import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CreditCard,
  RefreshCw,
  X,
} from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const EMPTY_FORM = {
  patientId: "",
  billName: "",
  amount: "",
  status: "Unpaid",
};

const STATUSES = ["Unpaid", "Pending", "Paid"];

export default function BillingPage() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [alert, setAlert] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fullName = (person) =>
    `${person?.firstName || ""} ${person?.lastName || ""}`.trim();

  const fetchAll = async () => {
    setLoading(true);

    try {
      const [bRes, pRes] = await Promise.all([
        api.get("/bills", { headers: authHeader() }),
        api.get("/patients", { headers: authHeader() }),
      ]);

      setBills(Array.isArray(bRes.data) ? bRes.data : []);
      setPatients(Array.isArray(pRes.data) ? pRes.data : []);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.message || "Failed to load billing records.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const summary = useMemo(() => {
    const total = bills.reduce((s, b) => s + Number(b.amount || 0), 0);

    const paid = bills
      .filter((b) => b.status?.toLowerCase() === "paid")
      .reduce((s, b) => s + Number(b.amount || 0), 0);

    return {
      total,
      paid,
      outstanding: total - paid,
    };
  }, [bills]);

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      const text = [fullName(b.patient), b.billName, b.amount, b.status]
        .join(" ")
        .toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());

      const matchStatus =
        filterStatus === "all" ||
        b.status?.toLowerCase() === filterStatus.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [bills, search, filterStatus]);

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const toPayload = () => ({
    billName: form.billName,
    amount: form.amount,
    status: form.status,
    patient: {
      id: form.patientId,
    },
  });

  const handleAdd = async () => {
    setSaving(true);

    try {
      const res = await api.post("/bills", toPayload(), {
        headers: authHeader(),
      });

      setBills((prev) => [...prev, res.data]);
      setAlert({ type: "success", message: "Bill created successfully." });

      setAddOpen(false);
      setForm(EMPTY_FORM);
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to create bill.",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (bill) => {
    setSelected(bill);

    setForm({
      patientId: bill.patient?.id || "",
      billName: bill.billName || "",
      amount: bill.amount || "",
      status: bill.status || "Unpaid",
    });

    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selected) return;

    setSaving(true);

    try {
      const res = await api.put(`/bills/${selected.id}`, toPayload(), {
        headers: authHeader(),
      });

      setBills((prev) =>
        prev.map((b) => (b.id === selected.id ? res.data : b)),
      );

      setAlert({ type: "success", message: "Bill updated successfully." });
      setEditOpen(false);
      setSelected(null);
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to update bill.",
      });
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (bill) => {
    setSelected(bill);
    setDelOpen(true);
  };

  const handleDelete = async () => {
    if (!selected) return;

    setSaving(true);

    try {
      await api.delete(`/bills/${selected.id}`, {
        headers: authHeader(),
      });

      setBills((prev) => prev.filter((b) => b.id !== selected.id));

      setAlert({ type: "success", message: "Bill deleted successfully." });
      setDelOpen(false);
      setSelected(null);
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to delete bill.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsPaid = async (bill) => {
    try {
      const payload = {
        billName: bill.billName,
        amount: bill.amount,
        status: "Paid",
        patient: {
          id: bill.patient?.id,
        },
      };

      const res = await api.put(`/bills/${bill.id}`, payload, {
        headers: authHeader(),
      });

      setBills((prev) => prev.map((b) => (b.id === bill.id ? res.data : b)));

      setAlert({ type: "success", message: "Bill marked as paid." });
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to update bill.",
      });
    }
  };

  return (
    <DashboardLayout title="Billing">
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard
            label="Total Bills"
            value={`₦${summary.total.toLocaleString()}`}
          />

          <SummaryCard
            label="Paid"
            value={`₦${summary.paid.toLocaleString()}`}
          />

          <SummaryCard
            label="Outstanding"
            value={`₦${summary.outstanding.toLocaleString()}`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              Billing Records
            </h2>

            <p className="text-xs text-slate-400">
              {bills.length} billing records
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
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
              Add Bill
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
              placeholder="Search bills..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-blue-500"
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
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    "#",
                    "Patient",
                    "Bill Name",
                    "Amount",
                    "Status",
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
                    <td colSpan="6" className="p-6 text-center text-slate-500">
                      Loading bills...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      No bills found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b, i) => (
                    <tr
                      key={b.id}
                      className="border-b border-slate-50 hover:bg-blue-50/40"
                    >
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                        {i + 1}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {fullName(b.patient) || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {b.billName || "—"}
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-800">
                        ₦{Number(b.amount || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => openEdit(b)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-green-100 text-slate-600 hover:text-green-600 cursor-pointer"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => openDelete(b)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>

                          <button
                            onClick={() => handleMarkAsPaid(b)}
                            disabled={b.status?.toLowerCase() === "paid"}
                            className={`px-3 py-2 rounded-lg text-xs text-white cursor-pointer disabled:cursor-not-allowed ${
                              b.status?.toLowerCase() === "paid"
                                ? "bg-gray-400"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {b.status?.toLowerCase() === "paid"
                              ? "Paid"
                              : "Mark Paid"}
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

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Bill">
        <BillForm
          onSubmit={handleAdd}
          submitLabel="Create Bill"
          form={form}
          handleChange={handleChange}
          patients={patients}
          fullName={fullName}
          saving={saving}
        />
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Bill"
      >
        <BillForm
          onSubmit={handleEdit}
          submitLabel="Save Changes"
          form={form}
          handleChange={handleChange}
          patients={patients}
          fullName={fullName}
          saving={saving}
        />
      </Modal>

      <ConfirmModal
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Bill"
        message="Delete this billing record?"
      />
    </DashboardLayout>
  );
}

function BillForm({
  onSubmit,
  submitLabel,
  form,
  handleChange,
  patients,
  fullName,
  saving,
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

      <FormInput
        label="Bill Name"
        name="billName"
        value={form.billName}
        onChange={handleChange}
        placeholder="Consultation fee"
      />

      <FormInput
        label="Amount (₦)"
        name="amount"
        type="number"
        value={form.amount}
        onChange={handleChange}
        placeholder="0"
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

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
          <CreditCard size={18} />
        </div>

        <div>
          <p className="text-xs text-slate-400 font-bold uppercase">{label}</p>
          <p className="text-xl font-extrabold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase()?.trim();

  const cls =
    s === "paid"
      ? "bg-green-100 text-green-700"
      : s === "pending"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

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
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
