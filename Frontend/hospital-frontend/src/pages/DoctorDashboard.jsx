import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  FileText,
  RefreshCw,
  Stethoscope,
  UserRound,
} from "lucide-react";
import api from "../api/api";
import DashboardLayout from "../layout/DashboardLayout";

export default function DoctorDashboard() {
  const doctor = JSON.parse(localStorage.getItem("user") || "{}");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [recordModal, setRecordModal] = useState(false);
  const [recordsModal, setRecordsModal] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);

  const [toast, setToast] = useState(null);

  const [recordForm, setRecordForm] = useState({
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
  });

  const showToast = (type, message) => {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchAppointments = async () => {
    setLoading(true);

    try {
      const res = await api.get(`/appointments/doctor/${doctor.id}`);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(
        "Doctor appointments error:",
        error.response?.data || error,
      );
      showToast("error", "Failed to load doctor appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctor?.id) {
      fetchAppointments();
    }
  }, [doctor?.id]);

  const updateStatus = async (appointmentId, status) => {
    setUpdatingId(appointmentId);

    try {
      const res = await api.patch(
        `/appointments/${appointmentId}/status`,
        null,
        {
          params: { status },
        },
      );

      setAppointments((prev) =>
        prev.map((item) => (item.id === appointmentId ? res.data : item)),
      );

      showToast("success", `Appointment ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Status update error:", error.response?.data || error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to update appointment",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const validateRecordForm = () => {
    if (!recordForm.diagnosis.trim()) {
      showToast("error", "Diagnosis is required");
      return false;
    }

    if (!recordForm.treatment.trim()) {
      showToast("error", "Treatment is required");
      return false;
    }

    return true;
  };

  const createMedicalRecord = async () => {
    if (!selectedAppointment) {
      showToast("error", "No appointment selected");
      return;
    }

    if (!validateRecordForm()) return;

    try {
      await api.post("/medical-records", {
        diagnosis: recordForm.diagnosis.trim(),
        treatment: recordForm.treatment.trim(),
        prescription: recordForm.prescription.trim(),
        notes: recordForm.notes.trim(),
        patient: {
          id: selectedAppointment.patient.id,
        },
        doctor: {
          id: doctor.id,
        },
      });

      showToast("success", "Medical record saved successfully");

      setRecordModal(false);
      setSelectedAppointment(null);
      setRecordForm({
        diagnosis: "",
        treatment: "",
        prescription: "",
        notes: "",
      });

      fetchAppointments();
    } catch (error) {
      console.error("Medical record error:", error.response?.data || error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to save medical record",
      );
    }
  };

  const fetchMedicalRecords = async (appointment) => {
    try {
      setSelectedAppointment(appointment);

      const patientId = appointment?.patient?.id;

      if (!patientId) {
        showToast("error", "Patient ID not found");
        return;
      }

      const res = await api.get(`/medical-records/patient/${patientId}`);

      setMedicalRecords(Array.isArray(res.data) ? res.data : []);
      setRecordsModal(true);
    } catch (error) {
      console.error("Fetch records error:", error.response?.data || error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to load medical records",
      );
    }
  };

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "Pending").length,
      approved: appointments.filter((a) => a.status === "Approved").length,
      completed: appointments.filter((a) => a.status === "Completed").length,
    };
  }, [appointments]);

  return (
    <DashboardLayout>
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={CalendarDays}
            label="Total Appointments"
            value={stats.total}
          />
          <StatCard icon={Clock3} label="Pending" value={stats.pending} />
          <StatCard
            icon={Stethoscope}
            label="Approved"
            value={stats.approved}
          />
          <StatCard icon={FileText} label="Completed" value={stats.completed} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Assigned Appointments
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Patients assigned to Dr. {doctor.firstName} {doctor.lastName}
              </p>
            </div>

            <button
              onClick={fetchAppointments}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500 dark:text-slate-400">Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
              <UserRound className="mx-auto text-slate-300 mb-3" size={36} />
              <h3 className="font-bold text-slate-700 dark:text-slate-200">
                No assigned appointments
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                New patient appointments assigned to you will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-slate-100 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition bg-slate-50 dark:bg-slate-800/40"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                        {appointment.patient?.firstName}{" "}
                        {appointment.patient?.lastName}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Complaint: {appointment.complaint}
                      </p>

                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Date:{" "}
                        {appointment.appointmentDate
                          ? new Date(
                              appointment.appointmentDate,
                            ).toLocaleString()
                          : "—"}
                      </p>

                      {appointment.notes && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Notes: {appointment.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={appointment.status} />

                      <ActionButton
                        label="Approve"
                        loading={updatingId === appointment.id}
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateStatus(appointment.id, "Approved")}
                      />

                      <ActionButton
                        label="Reject"
                        loading={updatingId === appointment.id}
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => updateStatus(appointment.id, "Rejected")}
                      />

                      <ActionButton
                        label="Complete"
                        loading={updatingId === appointment.id}
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() =>
                          updateStatus(appointment.id, "Completed")
                        }
                      />

                      <ActionButton
                        label="Medical Record"
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setRecordModal(true);
                        }}
                      />

                      <ActionButton
                        label="View Records"
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => fetchMedicalRecords(appointment)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {recordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
              Create Medical Record
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Patient: {selectedAppointment?.patient?.firstName}{" "}
              {selectedAppointment?.patient?.lastName}
            </p>

            <div className="space-y-4">
              <input
                placeholder="Diagnosis"
                value={recordForm.diagnosis}
                onChange={(e) =>
                  setRecordForm({ ...recordForm, diagnosis: e.target.value })
                }
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500"
              />

              <textarea
                placeholder="Treatment"
                value={recordForm.treatment}
                onChange={(e) =>
                  setRecordForm({ ...recordForm, treatment: e.target.value })
                }
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500"
              />

              <textarea
                placeholder="Prescription"
                value={recordForm.prescription}
                onChange={(e) =>
                  setRecordForm({
                    ...recordForm,
                    prescription: e.target.value,
                  })
                }
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500"
              />

              <textarea
                placeholder="Notes"
                value={recordForm.notes}
                onChange={(e) =>
                  setRecordForm({ ...recordForm, notes: e.target.value })
                }
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRecordModal(false)}
                  className="px-5 py-2 rounded-xl bg-gray-200 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>

                <button
                  onClick={createMedicalRecord}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {recordsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
              Patient Medical Records
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Patient: {selectedAppointment?.patient?.firstName}{" "}
              {selectedAppointment?.patient?.lastName}
            </p>

            {medicalRecords.length === 0 ? (
              <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
                <FileText className="mx-auto text-slate-300 mb-3" size={36} />
                <p className="text-slate-500 dark:text-slate-400">No medical records found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medicalRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 bg-slate-50 dark:bg-slate-800"
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      <strong>Diagnosis:</strong> {record.diagnosis || "—"}
                    </p>

                    <p className="text-sm text-slate-700 dark:text-slate-200 mt-2">
                      <strong>Treatment:</strong> {record.treatment || "—"}
                    </p>

                    <p className="text-sm text-slate-700 dark:text-slate-200 mt-2">
                      <strong>Prescription:</strong>{" "}
                      {record.prescription || "—"}
                    </p>

                    <p className="text-sm text-slate-700 dark:text-slate-200 mt-2">
                      <strong>Notes:</strong> {record.notes || "—"}
                    </p>

                    <p className="text-xs text-slate-400 mt-3">
                      Created:{" "}
                      {record.createdAt
                        ? new Date(record.createdAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-5">
              <button
                onClick={() => {
                  setRecordsModal(false);
                  setMedicalRecords([]);
                }}
                className="px-5 py-2 rounded-xl bg-gray-200 text-slate-700 dark:text-slate-200 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Toast({ type, message }) {
  const styles =
    type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white";

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ${styles}`}
    >
      {message}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Completed: "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-bold ${
        styles[status] || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
      }`}
    >
      {status || "Pending"}
    </span>
  );
}

function ActionButton({ label, onClick, className, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-50 ${className}`}
    >
      {loading ? "Updating..." : label}
    </button>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <Icon size={22} />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</h3>
    </div>
  );
}
