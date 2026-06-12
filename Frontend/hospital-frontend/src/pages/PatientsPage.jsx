import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  RefreshCw,
  X,
  Users,
  Mars,
  Venus,
  Droplet,
} from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  bloodGroup: "",
  dateOfBirth: "",
  genotype: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  allergies: "",
  medicalHistory: "",
  profileImageUrl: "",
};

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fullName = (patient) =>
    `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim();

  const fetchPatients = async () => {
    setLoading(true);

    try {
      const res = await api.get("/patients", {
        headers: authHeader(),
      });

      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to load patients.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const stats = useMemo(() => {
    const male = patients.filter(
      (p) => p.gender?.toLowerCase() === "male",
    ).length;

    const female = patients.filter(
      (p) => p.gender?.toLowerCase() === "female",
    ).length;

    const bloodGroups = patients.filter((p) => p.bloodGroup).length;

    return {
      total: patients.length,
      male,
      female,
      bloodGroups,
    };
  }, [patients]);

  const filtered = useMemo(() => {
    return patients.filter((p) =>
      [
        p.firstName,
        p.lastName,
        p.email,
        p.phone,
        p.bloodGroup,
        p.gender,
        p.genotype,
        p.emergencyContactName,
        p.emergencyContactPhone,
        p.allergies,
        p.medicalHistory,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [patients, search]);

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAdd = async () => {
    setSaving(true);

    try {
      const res = await api.post("/patients", form, {
        headers: authHeader(),
      });

      setPatients((prev) => [...prev, res.data]);
      showToast("success", "Patient added successfully.");

      setAddOpen(false);
      setForm(EMPTY_FORM);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to add patient.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (patient) => {
    setSelected(patient);

    setForm({
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      bloodGroup: patient.bloodGroup || "",
      dateOfBirth: patient.dateOfBirth || "",
      genotype: patient.genotype || "",
      emergencyContactName: patient.emergencyContactName || "",
      emergencyContactPhone: patient.emergencyContactPhone || "",
      allergies: patient.allergies || "",
      medicalHistory: patient.medicalHistory || "",
      profileImageUrl: patient.profileImageUrl || "",
    });

    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selected) return;

    setSaving(true);

    try {
      const res = await api.put(`/patients/${selected.id}`, form, {
        headers: authHeader(),
      });

      setPatients((prev) =>
        prev.map((p) => (p.id === selected.id ? res.data : p)),
      );

      showToast("success", "Patient updated successfully.");
      setEditOpen(false);
      setSelected(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to update patient.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (patient) => {
    setSelected(patient);
    setDelOpen(true);
  };

  const handleDelete = async () => {
    if (!selected) return;

    setSaving(true);

    try {
      await api.delete(`/patients/${selected.id}`, {
        headers: authHeader(),
      });

      setPatients((prev) => prev.filter((p) => p.id !== selected.id));
      showToast("success", "Patient deleted successfully.");

      setDelOpen(false);
      setSelected(null);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Patient could not be deleted.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openView = (patient) => {
    setSelected(patient);
    setViewOpen(true);
  };

  return (
    <DashboardLayout title="Patients">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="max-w-[1400px] mx-auto space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Patients"
            value={stats.total}
            sub="Registered patients"
            color="blue"
          />

          <StatCard
            icon={Mars}
            label="Male Patients"
            value={stats.male}
            sub="Male records"
            color="cyan"
          />

          <StatCard
            icon={Venus}
            label="Female Patients"
            value={stats.female}
            sub="Female records"
            color="purple"
          />

          <StatCard
            icon={Droplet}
            label="Blood Groups"
            value={stats.bloodGroups}
            sub="With blood data"
            color="red"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 @@@bg-white dark:bg-slate-900@@@ rounded-2xl border @@@border-slate-100 dark:border-slate-700@@@ shadow-sm px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold @@@text-slate-800 dark:text-white@@@">
              Patients
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              Manage patient biodata and hospital records
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPatients}
              className="p-2 rounded-xl @@@hover:bg-slate-100 dark:hover:bg-slate-800@@@ text-slate-500 dark:text-slate-300 transition cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={() => {
                setForm(EMPTY_FORM);
                setAddOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition shadow-sm shadow-blue-200 dark:shadow-none"
            >
              <Plus size={16} />
              Add Patient
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
            placeholder="Search by name, email, phone, blood group..."
            className="w-full pl-10 pr-4 py-3 rounded-xl @@@bg-white dark:bg-slate-900@@@ border @@@border-slate-200 dark:border-slate-700@@@ text-sm text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="@@@bg-white dark:bg-slate-900@@@ rounded-2xl border @@@border-slate-100 dark:border-slate-700@@@ shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="@@@bg-slate-50 dark:bg-slate-800@@@ border-b @@@border-slate-100 dark:border-slate-700@@@">
                  {[
                    "#",
                    "Patient",
                    "Gender",
                    "Contact",
                    "Blood Group",
                    "Address",
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
                      colSpan="7"
                      className="p-10 text-center text-slate-500 dark:text-slate-300"
                    >
                      Loading patients...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12">
                      <EmptyState
                        title="No patients found"
                        text="Try adjusting your search or add a new patient record."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((patient, index) => (
                    <tr
                      key={patient.id}
                      className="border-b @@@border-slate-50 dark:border-slate-800@@@ hover:bg-blue-50/40 dark:hover:bg-slate-800/70 transition-all duration-200 group"
                    >
                      <td className="px-4 py-3 text-slate-400 dark:text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar patient={patient} />

                          <div>
                            <p className="font-semibold @@@text-slate-800 dark:text-white@@@">
                              {fullName(patient) || "—"}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-400">
                              {patient.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <GenderBadge gender={patient.gender} />
                      </td>

                      <td className="px-4 py-3 @@@text-slate-600 dark:text-slate-300@@@">
                        {patient.phone || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {patient.bloodGroup ? (
                          <span className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                            {patient.bloodGroup}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 @@@text-slate-600 dark:text-slate-300@@@ max-w-[280px] truncate">
                        {patient.address || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openView(patient)}
                            className="p-2 rounded-lg @@@bg-slate-100 dark:bg-slate-800@@@ hover:bg-blue-100 dark:hover:bg-blue-950/40 @@@text-slate-600 dark:text-slate-300@@@ hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer transition"
                          >
                            <User size={15} />
                          </button>

                          <button
                            onClick={() => openEdit(patient)}
                            className="p-2 rounded-lg @@@bg-slate-100 dark:bg-slate-800@@@ hover:bg-green-100 dark:hover:bg-green-950/40 @@@text-slate-600 dark:text-slate-300@@@ hover:text-green-600 dark:hover:text-green-300 cursor-pointer transition"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => openDelete(patient)}
                            className="p-2 rounded-lg @@@bg-slate-100 dark:bg-slate-800@@@ hover:bg-red-100 dark:hover:bg-red-950/40 @@@text-slate-600 dark:text-slate-300@@@ hover:text-red-600 dark:hover:text-red-300 cursor-pointer transition"
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
            <div className="px-4 py-3 border-t @@@border-slate-100 dark:border-slate-700@@@ text-xs text-slate-400 dark:text-slate-400 flex justify-between">
              <span>
                Showing {filtered.length} of {patients.length} patients
              </span>
              <span>Page 1</span>
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Patient"
        subtitle="Create a new patient profile"
      >
        <PatientForm
          form={form}
          handleChange={handleChange}
          onSubmit={handleAdd}
          submitLabel="Add Patient"
          saving={saving}
        />
      </Drawer>

      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Patient"
        subtitle="Update patient information"
      >
        <PatientForm
          form={form}
          handleChange={handleChange}
          onSubmit={handleEdit}
          submitLabel="Save Changes"
          saving={saving}
        />
      </Drawer>

      <Drawer
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Patient Details"
        subtitle="View patient information"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b @@@border-slate-100 dark:border-slate-700@@@">
              <Avatar patient={selected} large />

              <div>
                <p className="text-lg font-extrabold @@@text-slate-800 dark:text-white@@@">
                  {fullName(selected)}
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-400">
                  {selected.email || "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Detail label="Gender" value={selected.gender} />
              <Detail label="Phone" value={selected.phone} />
              <Detail label="Blood Group" value={selected.bloodGroup} />
              <Detail label="Genotype" value={selected.genotype} />
              <Detail label="Date of Birth" value={selected.dateOfBirth} />
              <Detail label="Address" value={selected.address} />
              <Detail
                label="Emergency Contact"
                value={selected.emergencyContactName}
              />
              <Detail
                label="Emergency Phone"
                value={selected.emergencyContactPhone}
              />
              <Detail label="Allergies" value={selected.allergies} full />
              <Detail
                label="Medical History"
                value={selected.medicalHistory}
                full
              />
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmModal
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Patient"
        message={`Are you sure you want to delete "${fullName(selected)}"?`}
      />
    </DashboardLayout>
  );
}

function PatientForm({ form, handleChange, onSubmit, submitLabel, saving }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <FormInput
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="First name"
        />

        <FormInput
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Last name"
        />

        <FormSelect
          label="Gender"
          name="gender"
          value={form.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </FormSelect>

        <FormSelect
          label="Blood Group"
          name="bloodGroup"
          value={form.bloodGroup}
          onChange={handleChange}
        >
          <option value="">Select Blood Group</option>
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </FormSelect>

        <FormSelect
          label="Genotype"
          name="genotype"
          value={form.genotype}
          onChange={handleChange}
        >
          <option value="">Select Genotype</option>
          {["AA", "AS", "SS", "AC", "SC"].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </FormSelect>

        <FormInput
          label="Date of Birth"
          name="dateOfBirth"
          value={form.dateOfBirth}
          onChange={handleChange}
          type="date"
        />

        <FormInput
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone number"
        />

        <FormInput
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          placeholder="email@example.com"
        />

        <FormInput
          label="Address"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
        />

        <FormInput
          label="Emergency Contact Name"
          name="emergencyContactName"
          value={form.emergencyContactName}
          onChange={handleChange}
          placeholder="Emergency contact name"
        />

        <FormInput
          label="Emergency Contact Phone"
          name="emergencyContactPhone"
          value={form.emergencyContactPhone}
          onChange={handleChange}
          placeholder="Emergency contact phone"
        />

        <FormInput
          label="Profile Image URL"
          name="profileImageUrl"
          value={form.profileImageUrl}
          onChange={handleChange}
          placeholder="https://..."
        />

        <FormTextarea
          label="Allergies"
          name="allergies"
          value={form.allergies}
          onChange={handleChange}
          placeholder="Example: Penicillin, peanuts..."
        />

        <FormTextarea
          label="Medical History"
          name="medicalHistory"
          value={form.medicalHistory}
          onChange={handleChange}
          placeholder="Previous conditions, surgeries, long-term illness..."
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition disabled:opacity-50 cursor-pointer"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}

function Avatar({ patient, large = false }) {
  const size = large
    ? "w-14 h-14 text-2xl rounded-2xl"
    : "w-9 h-9 text-xs rounded-full";

  if (patient?.profileImageUrl) {
    return (
      <img
        src={patient.profileImageUrl}
        alt="Patient"
        className={`${size} object-cover border @@@border-slate-200 dark:border-slate-700@@@`}
      />
    );
  }

  return (
    <div
      className={`${size} bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold`}
    >
      {(patient?.firstName || "?").charAt(0)}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue: "from-blue-600 to-blue-800",
    cyan: "from-cyan-500 to-blue-600",
    purple: "from-violet-500 to-purple-700",
    red: "from-rose-500 to-red-700",
  };

  return (
    <div
      className={`bg-gradient-to-br ${
        colors[color] || colors.blue
      } rounded-2xl p-5 text-white shadow-sm hover:shadow-lg transition`}
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

function GenderBadge({ gender }) {
  const value = gender?.toLowerCase();

  if (value === "male") {
    return (
      <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
        Male
      </span>
    );
  }

  if (value === "female") {
    return (
      <span className="bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
        Female
      </span>
    );
  }

  return <span className="text-slate-400 dark:text-slate-500 dark:text-slate-400">—</span>;
}

function EmptyState({ title, text }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center mb-3">
        <User size={22} />
      </div>
      <h3 className="text-sm font-bold text-slate-700 dark:text-white">
        {title}
      </h3>
      <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">{text}</p>
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
        className="w-full mt-1 px-4 py-3 rounded-xl border @@@border-slate-200 dark:border-slate-700@@@ bg-white dark:bg-slate-950 @@@text-slate-800 dark:text-white@@@ text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-500"
      />
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
        rows={4}
        placeholder={placeholder}
        className="w-full mt-1 px-4 py-3 rounded-xl border @@@border-slate-200 dark:border-slate-700@@@ bg-white dark:bg-slate-950 @@@text-slate-800 dark:text-white@@@ text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
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

function Detail({ label, value, full = false }) {
  return (
    <div
      className={`@@@bg-slate-50 dark:bg-slate-800@@@ rounded-xl px-3 py-3 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide">
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
      <div className="h-full w-full max-w-xl @@@bg-white dark:bg-slate-900@@@ shadow-2xl overflow-y-auto animate-slideIn border-l @@@border-slate-200 dark:border-slate-700@@@">
        <div className="sticky top-0 @@@bg-white dark:bg-slate-900@@@ border-b @@@border-slate-100 dark:border-slate-700@@@ px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-extrabold @@@text-slate-800 dark:text-white@@@">
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
      <div className="@@@bg-white dark:bg-slate-900@@@ rounded-2xl shadow-xl w-full max-w-[420px] p-6 text-center border @@@border-slate-100 dark:border-slate-700@@@">
        <h2 className="text-xl font-extrabold text-red-600 dark:text-red-400 mb-3">
          {title}
        </h2>

        <p className="text-sm @@@text-slate-600 dark:text-slate-300@@@ mb-6">
          {message}
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 @@@text-slate-700 dark:text-slate-200@@@ cursor-pointer transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white cursor-pointer transition disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
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
