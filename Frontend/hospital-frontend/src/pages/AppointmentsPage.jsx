import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  CalendarDays,
  RefreshCw,
  CheckSquare,
  X,
} from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const EMPTY_FORM = {
  patientId: "",
  doctorId: "",
  appointmentDate: "",
  status: "Pending",
  notes: "",
};

const STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [alert, setAlert] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fullName = (person) =>
    `${person?.firstName || ""} ${person?.lastName || ""}`.trim();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, pRes, dRes] = await Promise.all([
        api.get("/appointments", { headers: authHeader() }),
        api.get("/patients", { headers: authHeader() }),
        api.get("/doctors", { headers: authHeader() }),
      ]);
      setAppointments(Array.isArray(aRes.data) ? aRes.data : []);
      setPatients(Array.isArray(pRes.data) ? pRes.data : []);
      setDoctors(Array.isArray(dRes.data) ? dRes.data : []);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.message || "Failed to load appointments.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const text = [
        fullName(a.patient),
        fullName(a.doctor),
        a.appointmentDate,
        a.status,
        a.notes,
      ]
        .join(" ")
        .toLowerCase();
      const status = a.status?.toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "all" || status === filterStatus.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [appointments, search, filterStatus]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toPayload = () => ({
    appointmentDate: form.appointmentDate,
    status: form.status,
    notes: form.notes,
    patient: { id: form.patientId },
    doctor: { id: form.doctorId },
  });

  const handleAdd = async () => {
    setSaving(true);
    try {
      const res = await api.post("/appointments", toPayload(), {
        headers: authHeader(),
      });
      setAppointments((prev) => [...prev, res.data]);
      setAlert({ type: "success", message: "Appointment created." });
      setAddOpen(false);
      setForm(EMPTY_FORM);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.message || "Failed to create appointment.",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (a) => {
    setSelected(a);
    setForm({
      patientId: a.patient?.id || "",
      doctorId: a.doctor?.id || "",
      appointmentDate: a.appointmentDate || "",
      status: a.status || "Pending",
      notes: a.notes || "",
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await api.put(`/appointments/${selected.id}`, toPayload(), {
        headers: authHeader(),
      });
      setAppointments((prev) =>
        prev.map((a) => (a.id === selected.id ? res.data : a)),
      );
      setAlert({ type: "success", message: "Appointment updated." });
      setEditOpen(false);
      setSelected(null);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.message || "Failed to update appointment.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (appointment, status) => {
    try {
      const payload = {
        appointmentDate: appointment.appointmentDate,
        status,
        notes: appointment.notes,
        patient: { id: appointment.patient?.id },
        doctor: { id: appointment.doctor?.id },
      };
      const res = await api.put(`/appointments/${appointment.id}`, payload, {
        headers: authHeader(),
      });
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointment.id ? res.data : a)),
      );
      setAlert({
        type: "success",
        message: `Appointment marked as ${status}.`,
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to update status.",
      });
    }
  };

  const openView = (a) => {
    setSelected(a);
    setViewOpen(true);
  };

  const AppointmentForm = ({ onSubmit, submitLabel }) => (
    <div className="space-y-4">
      <FormSelect
        label="Patient"
        name="patientId"
        value={form.patientId}
        onChange={handleChange}
      >
        <option value="">Select patient</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {fullName(p)}
          </option>
        ))}
      </FormSelect>
      <FormSelect
        label="Doctor"
        name="doctorId"
        value={form.doctorId}
        onChange={handleChange}
      >
        <option value="">Select doctor</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {fullName(d)} {d.specialization ? `- ${d.specialization}` : ""}
          </option>
        ))}
      </FormSelect>
      <FormInput
        label="Appointment Date"
        name="appointmentDate"
        value={form.appointmentDate}
        onChange={handleChange}
        type="datetime-local"
      />
      <FormSelect
        label="Status"
        name="status"
        value={form.status}
        onChange={handleChange}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </FormSelect>
      <FormTextarea
        label="Notes"
        name="notes"
        value={form.notes}
        onChange={handleChange}
        placeholder="Appointment notes"
      />
      <button
        onClick={onSubmit}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition disabled:opacity-50 cursor-pointer"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </div>
  );

  return (
    <DashboardLayout title="Appointments">
      {alert && (
        <AlertModal
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              Appointments
            </h2>
            <p className="text-xs text-slate-400">
              {appointments.length} hospital appointments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => {
                setForm(EMPTY_FORM);
                setAddOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition"
            >
              <Plus size={16} />
              Add Appointment
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search appointments..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    "#",
                    "Patient",
                    "Doctor",
                    "Date",
                    "Status",
                    "Notes",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-slate-500">
                      Loading appointments...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a, i) => (
                    <tr
                      key={a.id}
                      className="border-b border-slate-50 hover:bg-blue-50/40 transition"
                    >
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {fullName(a.patient) || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {fullName(a.doctor) || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.appointmentDate || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[220px] truncate">
                        {a.notes || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => openView(a)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEdit(a)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-green-100 text-slate-600 hover:text-green-600"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(a, "Completed")}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-yellow-100 text-slate-600 hover:text-yellow-600"
                          >
                            <CheckSquare size={15} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(a, "Cancelled")}
                            className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Appointment"
      >
        <AppointmentForm
          onSubmit={handleAdd}
          submitLabel="Create Appointment"
        />
      </Modal>
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Appointment"
      >
        <AppointmentForm onSubmit={handleEdit} submitLabel="Save Changes" />
      </Modal>
      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Appointment Details"
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <Detail label="Patient" value={fullName(selected.patient)} />
            <Detail label="Doctor" value={fullName(selected.doctor)} />
            <Detail label="Date" value={selected.appointmentDate} />
            <Detail label="Status" value={selected.status} />
            <Detail label="Notes" value={selected.notes} />
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  const cls =
    s === "completed"
      ? "bg-green-100 text-green-700"
      : s === "cancelled"
        ? "bg-red-100 text-red-700"
        : s === "confirmed"
          ? "bg-blue-100 text-blue-700"
          : "bg-amber-100 text-amber-700";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status || "—"}
    </span>
  );
}
function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      />
    </div>
  );
}
function FormTextarea({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      />
    </div>
  );
}
function FormSelect({ label, name, value, onChange, children }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      >
        {children}
      </select>
    </div>
  );
}
function Detail({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl px-3 py-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-slate-700 font-medium mt-1">{value || "—"}</p>
    </div>
  );
}
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[520px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 cursor-pointer"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-extrabold text-slate-800 mb-5">{title}</h2>
        {children}
      </div>
    </div>
  );
}
function AlertModal({ type, message, onClose }) {
  const ok = type === "success";
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 text-center">
        <h2
          className={`text-xl font-extrabold mb-3 ${ok ? "text-green-600" : "text-red-600"}`}
        >
          {ok ? "Success" : "Error"}
        </h2>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <button
          onClick={onClose}
          className={`px-5 py-2 rounded-xl text-white cursor-pointer ${ok ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
        >
          OK
        </button>
      </div>
    </div>
  );
}
