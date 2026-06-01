import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileText,
  Eye,
  RefreshCw,
  X,
  ClipboardPlus,
  Stethoscope,
  Users,
  Pill,
} from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const EMPTY_FORM = {
  patientId: "",
  doctorId: "",
  diagnosis: "",
  treatment: "",
  prescription: "",
  notes: "",
};

const fullName = (person) =>
  `${person?.firstName || ""} ${person?.lastName || ""}`.trim();

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);

    try {
      const [rRes, pRes, dRes] = await Promise.all([
        api.get("/medical-records", { headers: authHeader() }),
        api.get("/patients", { headers: authHeader() }),
        api.get("/doctors", { headers: authHeader() }),
      ]);

      setRecords(normalizeArray(rRes.data));
      setPatients(normalizeArray(pRes.data));
      setDoctors(normalizeArray(dRes.data));
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to load medical records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const stats = useMemo(() => {
    return {
      records: records.length,
      patients: new Set(records.map((r) => r.patient?.id).filter(Boolean))
        .size,
      doctors: new Set(records.map((r) => r.doctor?.id).filter(Boolean)).size,
      prescriptions: records.filter((r) => r.prescription).length,
    };
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) =>
      [
        fullName(r.patient),
        fullName(r.doctor),
        r.diagnosis,
        r.treatment,
        r.prescription,
        r.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [records, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.patientId) return "Please select a patient.";
    if (!form.doctorId) return "Please select a doctor.";
    if (!form.diagnosis.trim()) return "Diagnosis is required.";
    if (!form.treatment.trim()) return "Treatment is required.";
    return null;
  };

  const toPayload = () => ({
    diagnosis: form.diagnosis.trim(),
    treatment: form.treatment.trim(),
    prescription: form.prescription.trim(),
    notes: form.notes.trim(),
    patient: {
      id: Number(form.patientId),
    },
    doctor: {
      id: Number(form.doctorId),
    },
  });

  const handleAdd = async (e) => {
    e.preventDefault();

    const errorMessage = validateForm();

    if (errorMessage) {
      showToast("error", errorMessage);
      return;
    }

    setSaving(true);

    try {
      const res = await api.post("/medical-records", toPayload(), {
        headers: authHeader(),
      });

      setRecords((prev) => [...prev, res.data]);
      showToast("success", "Medical record created.");

      setAddOpen(false);
      setForm(EMPTY_FORM);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to create medical record."
      );
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (record) => {
    setSelected(record);

    setForm({
      patientId: record.patient?.id?.toString() || "",
      doctorId: record.doctor?.id?.toString() || "",
      diagnosis: record.diagnosis || "",
      treatment: record.treatment || "",
      prescription: record.prescription || "",
      notes: record.notes || "",
    });

    setEditOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!selected) return;

    const errorMessage = validateForm();

    if (errorMessage) {
      showToast("error", errorMessage);
      return;
    }

    setSaving(true);

    try {
      const res = await api.put(`/medical-records/${selected.id}`, toPayload(), {
        headers: authHeader(),
      });

      setRecords((prev) =>
        prev.map((record) => (record.id === selected.id ? res.data : record))
      );

      showToast("success", "Medical record updated.");

      setEditOpen(false);
      setSelected(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to update medical record."
      );
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (record) => {
    setSelected(record);
    setDelOpen(true);
  };

  const handleDelete = async () => {
    if (!selected) return;

    setSaving(true);

    try {
      await api.delete(`/medical-records/${selected.id}`, {
        headers: authHeader(),
      });

      setRecords((prev) => prev.filter((record) => record.id !== selected.id));

      showToast("success", "Medical record deleted.");

      setDelOpen(false);
      setSelected(null);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to delete medical record."
      );
    } finally {
      setSaving(false);
    }
  };

  const openView = (record) => {
    setSelected(record);
    setViewOpen(true);
  };

  return (
    <DashboardLayout title="Medical Records">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="max-w-[1400px] mx-auto space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Records"
            value={stats.records}
            sub="Stored medical files"
            color="blue"
          />

          <StatCard
            icon={Users}
            label="Patients Covered"
            value={stats.patients}
            sub="Patients with records"
            color="cyan"
          />

          <StatCard
            icon={Stethoscope}
            label="Doctors"
            value={stats.doctors}
            sub="Doctors involved"
            color="purple"
          />

          <StatCard
            icon={Pill}
            label="Prescriptions"
            value={stats.prescriptions}
            sub="Records with prescriptions"
            color="green"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
              Medical Records
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              Manage diagnosis, treatment, prescriptions, and doctor notes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAll}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 cursor-pointer transition"
            >
              <RefreshCw size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_FORM);
                setAddOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition shadow-sm shadow-blue-200 dark:shadow-none"
            >
              <Plus size={16} />
              Add Record
            </button>
          </div>
        </div>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, doctor, diagnosis, treatment..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition placeholder:text-slate-400"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                  {[
                    "#",
                    "Patient",
                    "Doctor",
                    "Diagnosis",
                    "Treatment",
                    "Prescription",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-10 text-center text-slate-500 dark:text-slate-300"
                    >
                      Loading records...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12">
                      <EmptyState
                        title="No medical records found"
                        text="Try adjusting your search or create a new medical record."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((record, index) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-50 dark:border-slate-800 hover:bg-blue-50/40 dark:hover:bg-slate-800/70 transition-all duration-200"
                    >
                      <td className="px-4 py-3 text-slate-400 dark:text-slate-500 font-mono text-xs">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                        {fullName(record.patient) || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {fullName(record.doctor) || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[190px] truncate">
                        {record.diagnosis || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[190px] truncate">
                        {record.treatment || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[230px] truncate">
                        {record.prescription || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openView(record)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer transition"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(record)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-green-100 dark:hover:bg-green-950/40 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-300 cursor-pointer transition"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDelete(record)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 cursor-pointer transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-400 flex justify-between">
              <span>
                Showing {filtered.length} of {records.length} medical records
              </span>
              <span>Page 1</span>
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Medical Record"
        subtitle="Create a new clinical record"
      >
        <RecordForm
          form={form}
          patients={patients}
          doctors={doctors}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleAdd}
          submitLabel="Create Record"
        />
      </Drawer>

      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Medical Record"
        subtitle="Update clinical record information"
      >
        <RecordForm
          form={form}
          patients={patients}
          doctors={doctors}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleEdit}
          submitLabel="Save Changes"
        />
      </Drawer>

      <Drawer
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Medical Record Details"
        subtitle="View diagnosis, treatment, and prescription"
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <Detail label="Patient" value={fullName(selected.patient)} />
            <Detail label="Doctor" value={fullName(selected.doctor)} />
            <Detail label="Diagnosis" value={selected.diagnosis} />
            <Detail label="Treatment" value={selected.treatment} />
            <Detail label="Prescription" value={selected.prescription} />
            <Detail label="Notes" value={selected.notes} />
          </div>
        )}
      </Drawer>

      <ConfirmModal
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Medical Record"
        message="Delete this medical record permanently?"
      />
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

function RecordForm({
  form,
  patients,
  doctors,
  saving,
  onChange,
  onSubmit,
  submitLabel,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormSelect
        label="Patient"
        name="patientId"
        value={form.patientId}
        onChange={onChange}
      >
        <option value="">Select patient</option>

        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {fullName(patient)}
          </option>
        ))}
      </FormSelect>

      <FormSelect
        label="Doctor"
        name="doctorId"
        value={form.doctorId}
        onChange={onChange}
      >
        <option value="">Select doctor</option>

        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {fullName(doctor)}{" "}
            {doctor.specialization ? `- ${doctor.specialization}` : ""}
          </option>
        ))}
      </FormSelect>

      <FormTextarea
        label="Diagnosis"
        name="diagnosis"
        value={form.diagnosis}
        onChange={onChange}
        placeholder="Enter diagnosis"
      />

      <FormTextarea
        label="Treatment"
        name="treatment"
        value={form.treatment}
        onChange={onChange}
        placeholder="Enter treatment plan"
      />

      <FormTextarea
        label="Prescription"
        name="prescription"
        value={form.prescription}
        onChange={onChange}
        placeholder="Enter prescription"
      />

      <FormTextarea
        label="Doctor Notes"
        name="notes"
        value={form.notes}
        onChange={onChange}
        placeholder="Additional notes"
      />

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition disabled:opacity-50 cursor-pointer"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue: "from-blue-600 to-blue-800",
    cyan: "from-cyan-500 to-blue-600",
    purple: "from-violet-500 to-purple-700",
    green: "from-emerald-500 to-teal-700",
  };

  return (
    <div
      className={`bg-gradient-to-br ${
        colors[color] || colors.blue
      } rounded-2xl p-5 text-white shadow-sm hover:shadow-lg transition`}
    >
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
        <Icon size={20} />
      </div>

      <p className="text-sm text-white/80">{label}</p>
      <h3 className="text-2xl font-extrabold mt-1">{value}</h3>
      <p className="text-xs text-white/70 mt-1">{sub}</p>
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center mb-3">
        <ClipboardPlus size={22} />
      </div>
      <h3 className="text-sm font-bold text-slate-700 dark:text-white">
        {title}
      </h3>
      <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">{text}</p>
    </div>
  );
}

function FormTextarea({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none placeholder:text-slate-400"
      />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, children }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      >
        {children}
      </select>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
        {label}
      </p>

      <p className="text-slate-700 dark:text-white font-medium mt-1 whitespace-pre-wrap">
        {value || "—"}
      </p>
    </div>
  );
}

function Drawer({ open, onClose, title, subtitle, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl overflow-y-auto animate-slideIn">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              {title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-[420px] p-6 text-center border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-extrabold text-red-600 dark:text-red-400 mb-3">
          {title}
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          {message}
        </p>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}