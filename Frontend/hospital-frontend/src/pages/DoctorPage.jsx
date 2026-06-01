import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Stethoscope,
  X,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  specialization: "",
};

const SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Gynecology",
  "Pediatrics",
  "Neurology",
  "Orthopedics",
  "Dentistry",
  "Ophthalmology",
  "Psychiatry",
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const doctorName = (doctor) =>
    `${doctor?.firstName || ""} ${doctor?.lastName || ""}`.trim();

  const fetchDoctors = async () => {
    setLoading(true);

    try {
      const res = await api.get("/doctors", {
        headers: authHeader(),
      });

      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to load doctors.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const stats = useMemo(() => {
    const specializations = new Set(
      doctors.map((d) => d.specialization).filter(Boolean),
    ).size;

    return {
      total: doctors.length,
      specializations,
      withEmail: doctors.filter((d) => d.email).length,
      withPhone: doctors.filter((d) => d.phone).length,
    };
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) =>
      [
        doctor.firstName,
        doctor.lastName,
        doctor.email,
        doctor.phone,
        doctor.specialization,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [doctors, search]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.specialization.trim()) return "Specialization is required.";
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
      const res = await api.post("/doctors", form, {
        headers: authHeader(),
      });

      setDoctors((prev) => [...prev, res.data]);
      showToast("success", "Doctor created successfully.");

      setAddOpen(false);
      setForm(EMPTY_FORM);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to create doctor.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (doctor) => {
    setSelected(doctor);

    setForm({
      firstName: doctor.firstName || "",
      lastName: doctor.lastName || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      specialization: doctor.specialization || "",
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
      const res = await api.put(`/doctors/${selected.id}`, form, {
        headers: authHeader(),
      });

      setDoctors((prev) =>
        prev.map((doctor) => (doctor.id === selected.id ? res.data : doctor)),
      );

      showToast("success", "Doctor updated successfully.");

      setEditOpen(false);
      setSelected(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to update doctor.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (doctor) => {
    setSelected(doctor);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selected) return;

    setSaving(true);

    try {
      await api.delete(`/doctors/${selected.id}`, {
        headers: authHeader(),
      });

      setDoctors((prev) => prev.filter((doctor) => doctor.id !== selected.id));

      showToast("success", "Doctor deleted successfully.");

      setDeleteOpen(false);
      setSelected(null);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to delete doctor.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openView = (doctor) => {
    setSelected(doctor);
    setViewOpen(true);
  };

  return (
    <DashboardLayout title="Doctors">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="max-w-[1400px] mx-auto space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Stethoscope}
            label="Total Doctors"
            value={stats.total}
            sub="Registered doctors"
            color="blue"
          />

          <StatCard
            icon={UserRound}
            label="Specializations"
            value={stats.specializations}
            sub="Medical departments"
            color="purple"
          />

          <StatCard
            icon={Mail}
            label="With Email"
            value={stats.withEmail}
            sub="Reachable by email"
            color="green"
          />

          <StatCard
            icon={Phone}
            label="With Phone"
            value={stats.withPhone}
            sub="Reachable by phone"
            color="cyan"
          />
        </div>

        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Doctors
            </h2>

            <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
              Manage doctors and specializations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDoctors}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={() => {
                setForm(EMPTY_FORM);
                setAddOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm cursor-pointer"
            >
              <Plus size={16} />
              Add Doctor
            </button>
          </div>
        </div>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctors..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm placeholder:text-slate-400"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                  {[
                    "#",
                    "Doctor",
                    "Email",
                    "Phone",
                    "Specialization",
                    "Created",
                    "Actions",
                  ].map((head) => (
                    <th
                      key={head}
                      className="text-left px-4 py-3 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-300 font-bold"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-8 text-center text-slate-500 dark:text-slate-300"
                    >
                      Loading doctors...
                    </td>
                  </tr>
                ) : filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-10">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor, index) => (
                    <tr
                      key={doctor.id}
                      className="border-b border-slate-50 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-slate-800/70 transition-all duration-200"
                    >
                      <td className="px-4 py-3 text-slate-400 dark:text-slate-500 text-xs font-mono">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                        Dr. {doctorName(doctor)}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {doctor.email || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {doctor.phone || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                          {doctor.specialization || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                        {doctor.createdAt
                          ? new Date(doctor.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openView(doctor)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => openEdit(doctor)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-green-100 dark:hover:bg-green-950/40 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-300 cursor-pointer"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => openDelete(doctor)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 cursor-pointer"
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

          {!loading && filteredDoctors.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-400 flex justify-between">
              <span>
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </span>
              <span>Page 1</span>
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Doctor"
        subtitle="Create a new doctor profile"
      >
        <DoctorForm
          form={form}
          onChange={handleChange}
          onSubmit={handleAdd}
          saving={saving}
          submitLabel="Create Doctor"
        />
      </Drawer>

      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Doctor"
        subtitle="Update doctor profile"
      >
        <DoctorForm
          form={form}
          onChange={handleChange}
          onSubmit={handleEdit}
          saving={saving}
          submitLabel="Save Changes"
        />
      </Drawer>

      <Drawer
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Doctor Details"
        subtitle="View doctor profile"
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <Detail label="Name" value={`Dr. ${doctorName(selected)}`} />
            <Detail label="Email" value={selected.email} />
            <Detail label="Phone" value={selected.phone} />
            <Detail label="Specialization" value={selected.specialization} />
            <Detail
              label="Created"
              value={
                selected.createdAt
                  ? new Date(selected.createdAt).toLocaleString()
                  : "—"
              }
            />
          </div>
        )}
      </Drawer>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Doctor"
        message={`Are you sure you want to delete Dr. ${doctorName(selected)}?`}
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

function DoctorForm({ form, onChange, onSubmit, saving, submitLabel }) {
  return (
    <div className="space-y-4">
      <FormInput
        label="First Name"
        name="firstName"
        value={form.firstName}
        onChange={onChange}
        placeholder="First name"
      />

      <FormInput
        label="Last Name"
        name="lastName"
        value={form.lastName}
        onChange={onChange}
        placeholder="Last name"
      />

      <FormInput
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        placeholder="doctor@example.com"
      />

      <FormInput
        label="Phone"
        name="phone"
        value={form.phone}
        onChange={onChange}
        placeholder="Phone number"
      />

      <FormSelect
        label="Specialization"
        name="specialization"
        value={form.specialization}
        onChange={onChange}
      >
        <option value="">Select specialization</option>

        {SPECIALIZATIONS.map((item) => (
          <option key={item} value={item}>
            {item}
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
    purple: "from-violet-500 to-purple-700",
    green: "from-emerald-500 to-teal-700",
    cyan: "from-cyan-500 to-blue-600",
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center mb-3">
        <Stethoscope size={22} />
      </div>
      <h3 className="text-sm font-bold text-slate-700 dark:text-white">
        No doctors found
      </h3>
      <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
        Add a doctor profile to begin shift scheduling.
      </p>
    </div>
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
      <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400"
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
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-slate-700 dark:text-white font-medium mt-1">
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
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
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
