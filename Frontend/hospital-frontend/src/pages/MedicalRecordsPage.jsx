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

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fullName = (person) =>
    `${person?.firstName || ""} ${person?.lastName || ""}`.trim();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rRes, pRes, dRes] = await Promise.all([
        api.get("/medical-records", { headers: authHeader() }),
        api.get("/patients", { headers: authHeader() }),
        api.get("/doctors", { headers: authHeader() }),
      ]);
      setRecords(Array.isArray(rRes.data) ? rRes.data : []);
      setPatients(Array.isArray(pRes.data) ? pRes.data : []);
      setDoctors(Array.isArray(dRes.data) ? dRes.data : []);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.message || "Failed to load medical records.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(
    () =>
      records.filter((r) =>
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
          .includes(search.toLowerCase()),
      ),
    [records, search],
  );
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const toPayload = () => ({
    diagnosis: form.diagnosis,
    treatment: form.treatment,
    prescription: form.prescription,
    notes: form.notes,
    patient: { id: form.patientId },
    doctor: { id: form.doctorId },
  });

  const handleAdd = async () => {
    setSaving(true);
    try {
      const res = await api.post("/medical-records", toPayload(), {
        headers: authHeader(),
      });
      setRecords((prev) => [...prev, res.data]);
      setAlert({ type: "success", message: "Medical record created." });
      setAddOpen(false);
      setForm(EMPTY_FORM);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.message || "Failed to create medical record.",
      });
    } finally {
      setSaving(false);
    }
  };
  const openEdit = (r) => {
    setSelected(r);
    setForm({
      patientId: r.patient?.id || "",
      doctorId: r.doctor?.id || "",
      diagnosis: r.diagnosis || "",
      treatment: r.treatment || "",
      prescription: r.prescription || "",
      notes: r.notes || "",
    });
    setEditOpen(true);
  };
  const handleEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await api.put(
        `/medical-records/${selected.id}`,
        toPayload(),
        { headers: authHeader() },
      );
      setRecords((prev) =>
        prev.map((r) => (r.id === selected.id ? res.data : r)),
      );
      setAlert({ type: "success", message: "Medical record updated." });
      setEditOpen(false);
      setSelected(null);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.message || "Failed to update medical record.",
      });
    } finally {
      setSaving(false);
    }
  };
  const openDelete = (r) => {
    setSelected(r);
    setDelOpen(true);
  };
  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete(`/medical-records/${selected.id}`, {
        headers: authHeader(),
      });
      setRecords((prev) => prev.filter((r) => r.id !== selected.id));
      setAlert({ type: "success", message: "Medical record deleted." });
      setDelOpen(false);
      setSelected(null);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.message || "Failed to delete medical record.",
      });
    } finally {
      setSaving(false);
    }
  };
  const openView = (r) => {
    setSelected(r);
    setViewOpen(true);
  };

  const RecordForm = ({ onSubmit, submitLabel }) => (
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
        label="Diagnosis"
        name="diagnosis"
        value={form.diagnosis}
        onChange={handleChange}
        placeholder="Diagnosis"
      />
      <FormInput
        label="Treatment"
        name="treatment"
        value={form.treatment}
        onChange={handleChange}
        placeholder="Treatment"
      />
      <FormTextarea
        label="Prescription"
        name="prescription"
        value={form.prescription}
        onChange={handleChange}
        placeholder="Prescription"
      />
      <FormTextarea
        label="Doctor Notes"
        name="notes"
        value={form.notes}
        onChange={handleChange}
        placeholder="Notes"
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
    <DashboardLayout title="Medical Records">
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
              Medical Records
            </h2>
            <p className="text-xs text-slate-400">
              {records.length} stored records
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => {
                setForm(EMPTY_FORM);
                setAddOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
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
            placeholder="Search medical records..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm outline-none"
          />
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    "#",
                    "Patient",
                    "Doctor",
                    "Diagnosis",
                    "Treatment",
                    "Prescription",
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
                      Loading records...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      <FileText className="mx-auto mb-2 text-slate-300" />
                      No medical records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-50 hover:bg-blue-50/40"
                    >
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {fullName(r.patient) || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {fullName(r.doctor) || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">
                        {r.diagnosis || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">
                        {r.treatment || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[220px] truncate">
                        {r.prescription || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openView(r)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEdit(r)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-green-100 text-slate-600 hover:text-green-600"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => openDelete(r)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600"
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
        </div>
      </div>
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Medical Record"
      >
        <RecordForm onSubmit={handleAdd} submitLabel="Create Record" />
      </Modal>
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Medical Record"
      >
        <RecordForm onSubmit={handleEdit} submitLabel="Save Changes" />
      </Modal>
      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Medical Record Details"
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
      </Modal>
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
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
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
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
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
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
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
      <p className="text-slate-700 font-medium mt-1 whitespace-pre-wrap">
        {value || "—"}
      </p>
    </div>
  );
}
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[560px] p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-extrabold text-slate-800 mb-5">{title}</h2>
        {children}
      </div>
    </div>
  );
}
function ConfirmModal({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] p-6 text-center">
        <h2 className="text-xl font-extrabold text-red-600 mb-3">{title}</h2>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300"
          >
            Cancel
          </button>
          <button
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
          className={`px-5 py-2 rounded-xl text-white ${ok ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
        >
          OK
        </button>
      </div>
    </div>
  );
}
