import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, Pill, RefreshCw, X } from "lucide-react";
import api from "../api/api";
import DashboardLayout from "../layout/DashboardLayout";

const EMPTY_FORM = {
  medicineName: "",
  category: "",
  quantity: "",
  price: "",
  status: "Available",
};

const STATUSES = ["Available", "Low Stock", "Out of Stock"];

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMedicines = async () => {
    setLoading(true);

    try {
      const res = await api.get("/medicines", {
        headers: authHeader(),
      });

      setMedicines(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Medicine fetch error:", error.response?.data || error);
      showToast("error", "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const generateStatus = (quantity) => {
    const qty = Number(quantity);

    if (qty <= 0) return "Out of Stock";
    if (qty <= 10) return "Low Stock";
    return "Available";
  };

  const summary = useMemo(() => {
    return {
      total: medicines.length,
      available: medicines.filter(
        (m) => generateStatus(m.quantity) === "Available",
      ).length,
      lowStock: medicines.filter(
        (m) => generateStatus(m.quantity) === "Low Stock",
      ).length,
    };
  }, [medicines]);

  const filtered = useMemo(() => {
    return medicines.filter((m) => {
      const text = [
        m.medicineName,
        m.category,
        m.quantity,
        m.price,
        generateStatus(m.quantity),
      ]
        .join(" ")
        .toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());

      const matchStatus =
        filterStatus === "all" ||
        generateStatus(m.quantity).toLowerCase() === filterStatus.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [medicines, search, filterStatus]);

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!form.medicineName.trim()) {
      showToast("error", "Medicine name is required");
      return false;
    }

    if (!form.category.trim()) {
      showToast("error", "Category is required");
      return false;
    }

    if (form.quantity === "" || Number(form.quantity) < 0) {
      showToast("error", "Enter a valid quantity");
      return false;
    }

    if (form.price === "" || Number(form.price) < 0) {
      showToast("error", "Enter a valid price");
      return false;
    }

    return true;
  };

  const toPayload = () => ({
    medicineName: form.medicineName.trim(),
    category: form.category.trim(),
    quantity: Number(form.quantity),
    price: Number(form.price),
    status: generateStatus(form.quantity),
  });

  const handleAdd = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const res = await api.post("/medicines", toPayload(), {
        headers: authHeader(),
      });

      setMedicines((prev) => [...prev, res.data]);
      setAddOpen(false);
      setForm(EMPTY_FORM);
      showToast("success", "Medicine added successfully");
    } catch (error) {
      console.error("Add medicine error:", error.response?.data || error);
      showToast("error", "Failed to add medicine");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (medicine) => {
    setSelected(medicine);

    setForm({
      medicineName: medicine.medicineName || "",
      category: medicine.category || "",
      quantity: medicine.quantity ?? "",
      price: medicine.price ?? "",
      status: medicine.status || "Available",
    });

    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selected) return;
    if (!validateForm()) return;

    setSaving(true);

    try {
      const res = await api.put(`/medicines/${selected.id}`, toPayload(), {
        headers: authHeader(),
      });

      setMedicines((prev) =>
        prev.map((m) => (m.id === selected.id ? res.data : m)),
      );

      setEditOpen(false);
      setSelected(null);
      setForm(EMPTY_FORM);
      showToast("success", "Medicine updated successfully");
    } catch (error) {
      console.error("Edit medicine error:", error.response?.data || error);
      showToast("error", "Failed to update medicine");
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (medicine) => {
    setSelected(medicine);
    setDelOpen(true);
  };

  const handleDelete = async () => {
    if (!selected) return;

    setSaving(true);

    try {
      await api.delete(`/medicines/${selected.id}`, {
        headers: authHeader(),
      });

      setMedicines((prev) => prev.filter((m) => m.id !== selected.id));
      setDelOpen(false);
      setSelected(null);
      showToast("success", "Medicine deleted successfully");
    } catch (error) {
      console.error("Delete medicine error:", error.response?.data || error);
      showToast("error", "Failed to delete medicine");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Pharmacy">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard label="Total Medicines" value={summary.total} />
          <SummaryCard label="Available" value={summary.available} />
          <SummaryCard label="Low Stock" value={summary.lowStock} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 @@@bg-white dark:bg-slate-900@@@ rounded-2xl border @@@border-slate-100 dark:border-slate-700@@@ shadow-sm px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold @@@text-slate-800 dark:text-white@@@">
              Pharmacy Inventory
            </h2>

            <p className="text-xs text-slate-400">
              {medicines.length} medicines registered
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMedicines}
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
              Add Medicine
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
              placeholder="Search medicines..."
              className="w-full pl-10 pr-4 py-3 rounded-xl @@@bg-white dark:bg-slate-900@@@ border @@@border-slate-200 dark:border-slate-700@@@ @@@text-slate-800 dark:text-white@@@ text-sm outline-none focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl @@@bg-white dark:bg-slate-900@@@ border @@@border-slate-200 dark:border-slate-700@@@ @@@text-slate-800 dark:text-white@@@ text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="@@@bg-white dark:bg-slate-900@@@ rounded-2xl border @@@border-slate-100 dark:border-slate-700@@@ shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="@@@bg-slate-50 dark:bg-slate-800@@@ border-b @@@border-slate-100 dark:border-slate-700@@@">
                  {[
                    "#",
                    "Medicine",
                    "Category",
                    "Quantity",
                    "Price",
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
                      colSpan="7"
                      className="p-6 text-center text-slate-500 dark:text-slate-300"
                    >
                      Loading medicines...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-8 text-center text-slate-500 dark:text-slate-300"
                    >
                      No medicines found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((medicine, index) => (
                    <tr
                      key={medicine.id}
                      className="border-b @@@border-slate-50 dark:border-slate-800@@@ hover:bg-blue-50/40 dark:hover:bg-slate-800/70"
                    >
                      <td className="px-4 py-3 text-slate-400 dark:text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-semibold @@@text-slate-800 dark:text-white@@@">
                        {medicine.medicineName || "—"}
                      </td>

                      <td className="px-4 py-3 @@@text-slate-600 dark:text-slate-300@@@">
                        {medicine.category || "—"}
                      </td>

                      <td className="px-4 py-3 font-bold @@@text-slate-800 dark:text-white@@@">
                        {medicine.quantity}
                      </td>

                      <td className="px-4 py-3 font-bold @@@text-slate-800 dark:text-white@@@">
                        ₦{Number(medicine.price || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge
                          status={generateStatus(medicine.quantity)}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => openEdit(medicine)}
                            className="p-2 rounded-lg @@@bg-slate-100 dark:bg-slate-800@@@ hover:bg-green-100 dark:hover:bg-green-950/40 @@@text-slate-600 dark:text-slate-300@@@ hover:text-green-600 dark:hover:text-green-300 cursor-pointer"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => openDelete(medicine)}
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
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Medicine"
      >
        <MedicineForm
          form={form}
          handleChange={handleChange}
          onSubmit={handleAdd}
          submitLabel="Add Medicine"
          saving={saving}
        />
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Medicine"
      >
        <MedicineForm
          form={form}
          handleChange={handleChange}
          onSubmit={handleEdit}
          submitLabel="Save Changes"
          saving={saving}
        />
      </Modal>

      <ConfirmModal
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine?"
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

function MedicineForm({ form, handleChange, onSubmit, submitLabel, saving }) {
  return (
    <div className="space-y-4">
      <FormInput
        label="Medicine Name"
        name="medicineName"
        value={form.medicineName}
        onChange={handleChange}
        placeholder="Paracetamol"
      />

      <FormInput
        label="Category"
        name="category"
        value={form.category}
        onChange={handleChange}
        placeholder="Pain Relief"
      />

      <FormInput
        label="Quantity"
        name="quantity"
        type="number"
        value={form.quantity}
        onChange={handleChange}
        placeholder="20"
      />

      <FormInput
        label="Price (₦)"
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
        placeholder="1000"
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
}

function SummaryCard({ label, value }) {
  return (
    <div className="@@@bg-white dark:bg-slate-900@@@ rounded-2xl border @@@border-slate-100 dark:border-slate-700@@@ shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
          <Pill size={18} />
        </div>

        <div>
          <p className="text-xs text-slate-400 font-bold uppercase">{label}</p>
          <p className="text-xl font-extrabold @@@text-slate-800 dark:text-white@@@">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase()?.trim();

  const cls =
    s === "available"
      ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300"
      : s === "low stock"
        ? "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300"
        : "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300";

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
      <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full mt-1 px-4 py-3 rounded-xl border @@@border-slate-200 dark:border-slate-700@@@ bg-white dark:bg-slate-950 @@@text-slate-800 dark:text-white@@@ text-sm outline-none focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
      />
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="@@@bg-white dark:bg-slate-900@@@ rounded-2xl shadow-xl w-full max-w-[520px] p-6 relative border @@@border-slate-100 dark:border-slate-700@@@">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-extrabold @@@text-slate-800 dark:text-white@@@ mb-5">
          {title}
        </h2>

        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
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
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 @@@text-slate-700 dark:text-slate-200@@@ cursor-pointer"
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
