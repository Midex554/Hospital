import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  RefreshCw,
  CheckSquare,
  X,
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
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

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.status?.toLowerCase() === "pending")
        .length,
      completed: appointments.filter(
        (a) => a.status?.toLowerCase() === "completed",
      ).length,
      cancelled: appointments.filter(
        (a) => a.status?.toLowerCase() === "cancelled",
      ).length,
    };
  }, [appointments]);

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

      const matchSearch = text.includes(search.toLowerCase());

      const matchStatus =
        filterStatus === "all" ||
        a.status?.toLowerCase() === filterStatus.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [appointments, search, filterStatus]);

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const toPayload = () => ({
    appointmentDate: form.appointmentDate,
    status: form.status,
    notes: form.notes,
    patient: {
      id: Number(form.patientId),
    },
    doctor: {
      id: Number(form.doctorId),
    },
  });

  const validateForm = () => {
    if (!form.patientId) return "Please select a patient.";
    if (!form.doctorId) return "Please select a doctor.";
    if (!form.appointmentDate) return "Please select appointment date.";
    return null;
  };

  const handleAdd = async () => {
    const errorMessage = validateForm();
    if (errorMessage) {
      setAlert({ type: "error", message: errorMessage });
      return;
    }

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

  const openEdit = (appointment) => {
    setSelected(appointment);

    setForm({
      patientId: appointment.patient?.id?.toString() || "",
      doctorId: appointment.doctor?.id?.toString() || "",
      appointmentDate: appointment.appointmentDate || "",
      status: appointment.status || "Pending",
      notes: appointment.notes || "",
    });

    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selected) return;

    const errorMessage = validateForm();
    if (errorMessage) {
      setAlert({ type: "error", message: errorMessage });
      return;
    }

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
      setForm(EMPTY_FORM);
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
        patient: {
          id: appointment.patient?.id,
        },
        doctor: {
          id: appointment.doctor?.id,
        },
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

  const openView = (appointment) => {
    setSelected(appointment);
    setViewOpen(true);
  };

  return (
    <DashboardLayout title="Appointments">
      <div className="max-w-[1400px] mx-auto space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={CalendarDays}
            label="Total Appointments"
            value={stats.total}
            sub="All appointments"
            color="blue"
          />

          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            sub="Awaiting confirmation"
            color="yellow"
          />

          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={stats.completed}
            sub="Finished visits"
            color="green"
          />

          <StatCard
            icon={XCircle}
            label="Cancelled"
            value={stats.cancelled}
            sub="Cancelled bookings"
            color="red"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              Appointments
            </h2>
            <p className="text-xs text-slate-400">
              Manage patient bookings, doctors, and appointment statuses
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
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition shadow-sm shadow-blue-200"
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
              placeholder="Search by patient, doctor, date, status..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition"
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
                    <td colSpan="7" className="p-10 text-center text-slate-500">
                      Loading appointments...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12">
                      <EmptyState
                        title="No appointments found"
                        text="Try adjusting your search or create a new appointment."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((a, i) => (
                    <tr
                      key={a.id}
                      className="border-b border-slate-50 hover:bg-blue-50/40 hover:scale-[1.002] transition-all duration-200"
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
                            className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => openEdit(a)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-green-100 text-slate-600 hover:text-green-600 cursor-pointer"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => handleStatusUpdate(a, "Completed")}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-yellow-100 text-slate-600 hover:text-yellow-600 cursor-pointer"
                          >
                            <CheckSquare size={15} />
                          </button>

                          <button
                            onClick={() => handleStatusUpdate(a, "Cancelled")}
                            className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs cursor-pointer"
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

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
              <span>
                Showing {filtered.length} of {appointments.length} appointments
              </span>
              <span>Page 1</span>
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Appointment"
        subtitle="Schedule a patient appointment"
      >
        <AppointmentForm
          form={form}
          handleChange={handleChange}
          onSubmit={handleAdd}
          submitLabel="Create Appointment"
          saving={saving}
          patients={patients}
          doctors={doctors}
          fullName={fullName}
        />
      </Drawer>

      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Appointment"
        subtitle="Update appointment information"
      >
        <AppointmentForm
          form={form}
          handleChange={handleChange}
          onSubmit={handleEdit}
          submitLabel="Save Changes"
          saving={saving}
          patients={patients}
          doctors={doctors}
          fullName={fullName}
        />
      </Drawer>

      <Drawer
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Appointment Details"
        subtitle="View appointment information"
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
      </Drawer>
    </DashboardLayout>
  );
}

function AppointmentForm({
  form,
  handleChange,
  onSubmit,
  submitLabel,
  saving,
  patients,
  doctors,
  fullName,
}) {
  return (
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
            {fullName(d)}
            {d.specialization ? ` - ${d.specialization}` : ""}
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
        type="button"
        onClick={onSubmit}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition disabled:opacity-50 cursor-pointer"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue: "from-blue-600 to-blue-800",
    yellow: "from-amber-500 to-yellow-600",
    green: "from-emerald-500 to-teal-700",
    red: "from-rose-500 to-red-700",
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

function StatusBadge({ status }) {
  const s = status?.toLowerCase();

  const cls =
    s === "completed"
      ? "bg-green-100 text-green-700 border-green-200"
      : s === "cancelled"
        ? "bg-red-100 text-red-700 border-red-200"
        : s === "confirmed"
          ? "bg-blue-100 text-blue-700 border-blue-200"
          : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      {status || "—"}
    </span>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
        <CalendarDays size={22} />
      </div>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      <p className="text-xs text-slate-400 mt-1">{text}</p>
    </div>
  );
}

function FormInput({ label, name, value, onChange, type = "text" }) {
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
        rows={4}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none"
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
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-white"
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

function Drawer({ open, onClose, title, subtitle, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl bg-white shadow-2xl overflow-y-auto animate-slideIn">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">{title}</h2>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
