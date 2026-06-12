import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Activity,
  Clock,
  CalendarDays,
  Stethoscope,
} from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const EMPTY_FORM = {
  doctorId: "",
  shiftDate: "",
  startTime: "",
  endTime: "",
  status: "ON_DUTY",
};

const STATUSES = ["ON_DUTY", "BREAK", "OFF_DUTY"];

export default function DoctorShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fullName = (doctor) =>
    `${doctor?.firstName || ""} ${doctor?.lastName || ""}`.trim();

  const fetchAll = async () => {
    setLoading(true);

    try {
      const [sRes, dRes] = await Promise.all([
        api.get("/doctor-shifts", { headers: authHeader() }),
        api.get("/doctors", { headers: authHeader() }),
      ]);

      setShifts(Array.isArray(sRes.data) ? sRes.data : []);
      setDoctors(Array.isArray(dRes.data) ? dRes.data : []);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to load shifts.",
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
      total: shifts.length,
      onDuty: shifts.filter((s) => s.status === "ON_DUTY").length,
      break: shifts.filter((s) => s.status === "BREAK").length,
      offDuty: shifts.filter((s) => s.status === "OFF_DUTY").length,
    };
  }, [shifts]);

  const filtered = useMemo(() => {
    return shifts.filter((shift) =>
      [
        fullName(shift.doctor),
        shift.doctor?.specialization,
        shift.shiftDate,
        shift.startTime,
        shift.endTime,
        shift.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [shifts, search]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toPayload = () => ({
    shiftDate: form.shiftDate,
    startTime: form.startTime,
    endTime: form.endTime,
    status: form.status,
    doctor: {
      id: Number(form.doctorId),
    },
  });

  const validateForm = () => {
    if (!form.doctorId) return "Please select a doctor.";
    if (!form.shiftDate) return "Please select shift date.";
    if (!form.startTime) return "Please select start time.";
    if (!form.endTime) return "Please select end time.";
    if (!form.status) return "Please select status.";
    return null;
  };

  const handleAdd = async () => {
    const errorMessage = validateForm();

    if (errorMessage) {
      showToast("error", errorMessage);
      return;
    }

    setSaving(true);

    try {
      const res = await api.post("/doctor-shifts", toPayload(), {
        headers: authHeader(),
      });

      setShifts((prev) => [...prev, res.data]);
      showToast("success", "Doctor shift created.");
      setAddOpen(false);
      setForm(EMPTY_FORM);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to create shift.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (shift) => {
    setSelected(shift);

    setForm({
      doctorId: shift.doctor?.id?.toString() || "",
      shiftDate: shift.shiftDate || "",
      startTime: shift.startTime || "",
      endTime: shift.endTime || "",
      status: shift.status || "ON_DUTY",
    });

    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selected) return;

    const errorMessage = validateForm();

    if (errorMessage) {
      showToast("error", errorMessage);
      return;
    }

    setSaving(true);

    try {
      const res = await api.put(`/doctor-shifts/${selected.id}`, toPayload(), {
        headers: authHeader(),
      });

      setShifts((prev) =>
        prev.map((shift) => (shift.id === selected.id ? res.data : shift)),
      );

      showToast("success", "Doctor shift updated.");
      setEditOpen(false);
      setSelected(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to update shift.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (shift) => {
    setSelected(shift);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selected) return;

    setSaving(true);

    try {
      await api.delete(`/doctor-shifts/${selected.id}`, {
        headers: authHeader(),
      });

      setShifts((prev) => prev.filter((shift) => shift.id !== selected.id));
      showToast("success", "Doctor shift deleted.");
      setDeleteOpen(false);
      setSelected(null);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to delete shift.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Doctor Shifts">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="max-w-[1400px] mx-auto space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={CalendarDays}
            label="Total Shifts"
            value={stats.total}
            sub="All assigned shifts"
            color="blue"
          />
          <StatCard
            icon={Activity}
            label="On Duty"
            value={stats.onDuty}
            sub="Available doctors"
            color="green"
          />
          <StatCard
            icon={Clock}
            label="On Break"
            value={stats.break}
            sub="Temporarily unavailable"
            color="yellow"
          />
          <StatCard
            icon={Stethoscope}
            label="Off Duty"
            value={stats.offDuty}
            sub="Not available"
            color="red"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 @@@bg-white dark:bg-slate-900@@@ rounded-2xl border @@@border-slate-100 dark:border-slate-700@@@ shadow-sm px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold @@@text-slate-800 dark:text-white@@@">
              Doctor Shifts
            </h2>
            <p className="text-xs text-slate-400">
              Manage doctor availability and duty schedules
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="p-2 rounded-xl @@@hover:bg-slate-100 dark:hover:bg-slate-800@@@ text-slate-500 dark:text-slate-300 cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={() => {
                setForm(EMPTY_FORM);
                setAddOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
            >
              <Plus size={16} />
              Add Shift
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
            placeholder="Search by doctor, specialization, date, time, status..."
            className="w-full pl-10 pr-4 py-3 rounded-xl @@@bg-white dark:bg-slate-900@@@ border @@@border-slate-200 dark:border-slate-700@@@ @@@text-slate-800 dark:text-white@@@ text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="@@@bg-white dark:bg-slate-900@@@ rounded-2xl border @@@border-slate-100 dark:border-slate-700@@@ shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="@@@bg-slate-50 dark:bg-slate-800@@@ border-b @@@border-slate-100 dark:border-slate-700@@@">
                  {[
                    "#",
                    "Doctor",
                    "Specialization",
                    "Date",
                    "Start",
                    "End",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-10 text-center text-slate-500 dark:text-slate-300"
                    >
                      Loading shifts...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-12">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  filtered.map((shift, index) => (
                    <tr
                      key={shift.id}
                      className="border-b @@@border-slate-50 dark:border-slate-800@@@ hover:bg-blue-50/40 dark:hover:bg-slate-800/70 transition-all duration-200"
                    >
                      <td className="px-4 py-3 text-slate-400 dark:text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-semibold @@@text-slate-800 dark:text-white@@@">
                        Dr. {fullName(shift.doctor) || "—"}
                      </td>

                      <td className="px-4 py-3 @@@text-slate-600 dark:text-slate-300@@@">
                        {shift.doctor?.specialization || "—"}
                      </td>

                      <td className="px-4 py-3 @@@text-slate-600 dark:text-slate-300@@@">
                        {shift.shiftDate || "—"}
                      </td>

                      <td className="px-4 py-3 @@@text-slate-600 dark:text-slate-300@@@">
                        {shift.startTime || "—"}
                      </td>

                      <td className="px-4 py-3 @@@text-slate-600 dark:text-slate-300@@@">
                        {shift.endTime || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={shift.status} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(shift)}
                            className="p-2 rounded-lg @@@bg-slate-100 dark:bg-slate-800@@@ hover:bg-green-100 dark:hover:bg-green-950/40 @@@text-slate-600 dark:text-slate-300@@@ hover:text-green-600 dark:hover:text-green-300 cursor-pointer"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => openDelete(shift)}
                            className="p-2 rounded-lg @@@bg-slate-100 dark:bg-slate-800@@@ hover:bg-red-100 dark:hover:bg-red-950/40 @@@text-slate-600 dark:text-slate-300@@@ hover:text-red-600 dark:hover:text-red-300 cursor-pointer"
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
            <div className="px-4 py-3 border-t @@@border-slate-100 dark:border-slate-700@@@ text-xs text-slate-400 flex justify-between">
              <span>
                Showing {filtered.length} of {shifts.length} doctor shifts
              </span>
              <span>Page 1</span>
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Doctor Shift"
        subtitle="Assign doctor duty schedule"
      >
        <ShiftForm
          form={form}
          doctors={doctors}
          onChange={handleChange}
          onSubmit={handleAdd}
          saving={saving}
          submitLabel="Create Shift"
          fullName={fullName}
        />
      </Drawer>

      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Doctor Shift"
        subtitle="Update doctor availability"
      >
        <ShiftForm
          form={form}
          doctors={doctors}
          onChange={handleChange}
          onSubmit={handleEdit}
          saving={saving}
          submitLabel="Save Changes"
          fullName={fullName}
        />
      </Drawer>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Shift"
        message="Are you sure you want to delete this doctor shift?"
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

function ShiftForm({
  form,
  doctors,
  onChange,
  onSubmit,
  saving,
  submitLabel,
  fullName,
}) {
  return (
    <div className="space-y-4">
      <FormSelect
        label="Doctor"
        name="doctorId"
        value={form.doctorId}
        onChange={onChange}
      >
        <option value="">Select doctor</option>
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            Dr. {fullName(doctor)}
            {doctor.specialization ? ` - ${doctor.specialization}` : ""}
          </option>
        ))}
      </FormSelect>

      <FormInput
        label="Shift Date"
        name="shiftDate"
        type="date"
        value={form.shiftDate}
        onChange={onChange}
      />
      <FormInput
        label="Start Time"
        name="startTime"
        type="time"
        value={form.startTime}
        onChange={onChange}
      />
      <FormInput
        label="End Time"
        name="endTime"
        type="time"
        value={form.endTime}
        onChange={onChange}
      />

      <FormSelect
        label="Status"
        name="status"
        value={form.status}
        onChange={onChange}
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status.replace("_", " ")}
          </option>
        ))}
      </FormSelect>

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
    green: "from-emerald-500 to-teal-700",
    yellow: "from-amber-500 to-yellow-600",
    red: "from-rose-500 to-red-700",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color] || colors.blue} rounded-2xl p-5 text-white shadow-sm hover:shadow-lg transition`}
    >
      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900/20 flex items-center justify-center mb-4">
        <Icon size={20} />
      </div>
      <p className="text-sm text-white/80">{label}</p>
      <h3 className="text-2xl font-extrabold mt-1">{value}</h3>
      <p className="text-xs text-white/70 mt-1">{sub}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls =
    status === "ON_DUTY"
      ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
      : status === "BREAK"
        ? "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
        : "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      {status?.replace("_", " ") || "—"}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center mb-3">
        <Activity size={22} />
      </div>
      <h3 className="text-sm font-bold text-slate-700 dark:text-white">
        No doctor shifts found
      </h3>
      <p className="text-xs text-slate-400 mt-1">
        Assign doctors to shifts so the system can detect who is on duty.
      </p>
    </div>
  );
}

function FormInput({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full mt-1 px-4 py-3 rounded-xl border @@@border-slate-200 dark:border-slate-700@@@ bg-white dark:bg-slate-950 @@@text-slate-800 dark:text-white@@@ text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
        className="w-full mt-1 px-4 py-3 rounded-xl border @@@border-slate-200 dark:border-slate-700@@@ bg-white dark:bg-slate-950 @@@text-slate-800 dark:text-white@@@ text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      >
        {children}
      </select>
    </div>
  );
}

function Drawer({ open, onClose, title, subtitle, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl @@@bg-white dark:bg-slate-900@@@ border-l @@@border-slate-200 dark:border-slate-700@@@ shadow-2xl overflow-y-auto animate-slideIn">
        <div className="sticky top-0 @@@bg-white dark:bg-slate-900@@@ border-b @@@border-slate-100 dark:border-slate-700@@@ px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-extrabold @@@text-slate-800 dark:text-white@@@">
              {title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          </div>

          <button
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
      <div className="@@@bg-white dark:bg-slate-900@@@ rounded-2xl shadow-xl w-full max-w-[420px] p-6 text-center border @@@border-slate-100 dark:border-slate-700@@@">
        <h2 className="text-xl font-extrabold text-red-600 dark:text-red-400 mb-3">
          {title}
        </h2>

        <p className="text-sm @@@text-slate-600 dark:text-slate-300@@@ mb-6">
          {message}
        </p>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 @@@text-slate-700 dark:text-slate-200@@@"
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
