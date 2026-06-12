import { useEffect, useMemo, useState } from "react";
import {
  Upload,
  FileText,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import api from "../api/api";
import DashboardLayout from "../layout/DashboardLayout";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const API_BASE =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8080";

export default function PatientTestResultsPage() {
  const [results, setResults] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    testName: "",
    description: "",
    doctorId: "",
    file: null,
  });

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const patientId = user?.patientId || user?.id;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchResults = async () => {
    setLoading(true);

    try {
      if (!patientId) {
        showToast("error", "Patient ID not found. Please login again.");
        return;
      }

      const res = await api.get(`/test-results/patient/${patientId}`, {
        headers: authHeader(),
      });

      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to load test results.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors", {
        headers: authHeader(),
      });

      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch {
      setDoctors([]);
    }
  };

  useEffect(() => {
    fetchResults();
    fetchDoctors();
  }, []);

  const stats = useMemo(() => {
    return {
      total: results.length,
      uploaded: results.filter((r) => r.status === "UPLOADED").length,
      reviewed: results.filter((r) => r.status === "REVIEWED").length,
    };
  }, [results]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!patientId) {
      showToast("error", "Patient ID not found. Please login again.");
      return;
    }

    if (!form.testName.trim()) {
      showToast("error", "Test name is required.");
      return;
    }

    if (!form.doctorId) {
      showToast("error", "Please select doctor.");
      return;
    }

    if (!form.file) {
      showToast("error", "Please select a PDF or image.");
      return;
    }

    const data = new FormData();
    data.append("testName", form.testName);
    data.append("description", form.description);
    data.append("patientId", patientId);
    data.append("doctorId", form.doctorId);
    data.append("file", form.file);

    setSaving(true);

    try {
      const res = await api.post("/test-results/upload", data, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      setResults((prev) => [res.data, ...prev]);
      showToast("success", "Test result uploaded successfully.");

      setForm({
        testName: "",
        description: "",
        doctorId: "",
        file: null,
      });

      e.target.reset();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to upload test result.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openPreview = (result) => {
    setSelected(result);
    setPreviewOpen(true);
  };

  return (
    <DashboardLayout title="My Test Results">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="max-w-[1400px] mx-auto space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Results" value={stats.total} icon={FileText} />
          <StatCard label="Uploaded" value={stats.uploaded} icon={Clock} />
          <StatCard
            label="Reviewed"
            value={stats.reviewed}
            icon={CheckCircle}
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
            Upload Test Result
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Upload PDF, JPG, JPEG, or PNG result for your assigned doctor.
          </p>

          <form onSubmit={handleUpload} className="grid grid-cols-1 gap-4 mt-5">
            <Input
              label="Test Name"
              name="testName"
              value={form.testName}
              onChange={handleChange}
              placeholder="Blood Test, X-Ray, MRI..."
            />

            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short note about the result"
            />

            <Select
              label="Send To Doctor"
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
            >
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName}{" "}
                  {doctor.specialization ? `- ${doctor.specialization}` : ""}
                </option>
              ))}
            </Select>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                Result File
              </label>
              <input
                type="file"
                name="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-50"
            >
              <Upload size={17} />
              {saving ? "Uploading..." : "Upload Test Result"}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
                Upload History
              </h2>
              <p className="text-xs text-slate-400">
                View your uploaded results and doctor review.
              </p>
            </div>

            <button
              onClick={fetchResults}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  {[
                    "#",
                    "Test Name",
                    "Doctor",
                    "File",
                    "Status",
                    "Doctor Comment",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest"
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
                      className="p-8 text-center text-slate-500 dark:text-slate-300"
                    >
                      Loading test results...
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-8 text-center text-slate-500 dark:text-slate-300"
                    >
                      No test result uploaded yet.
                    </td>
                  </tr>
                ) : (
                  results.map((result, index) => (
                    <tr
                      key={result.id}
                      className="border-b border-slate-50 dark:border-slate-800 hover:bg-blue-50/40 dark:hover:bg-slate-800/70"
                    >
                      <td className="px-4 py-3 text-slate-400">{index + 1}</td>

                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                        {result.testName}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        Dr. {result.doctor?.firstName || ""}{" "}
                        {result.doctor?.lastName || ""}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {result.fileName || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={result.status} />
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[300px] truncate">
                        {result.doctorComment || "Not reviewed yet"}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => openPreview(result)}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PreviewModal
        open={previewOpen}
        result={selected}
        onClose={() => setPreviewOpen(false)}
      />
    </DashboardLayout>
  );
}

function PreviewModal({ open, result, onClose }) {
  if (!open || !result) return null;

  const fileLink = `${API_BASE}${result.fileUrl}`;
  const isImage = result.fileType?.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl p-6 border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
            {result.testName}
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-950">
          {isImage ? (
            <img
              src={fileLink}
              alt="Test result"
              className="w-full max-h-[500px] object-contain"
            />
          ) : (
            <iframe
              src={fileLink}
              className="w-full h-[500px]"
              title="Test result"
            />
          )}
        </div>

        <div className="mt-4 bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
          <p className="text-xs font-bold text-slate-400 uppercase">
            Doctor Comment
          </p>
          <p className="text-sm text-slate-700 dark:text-white mt-1">
            {result.doctorComment || "Not reviewed yet."}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase">{label}</p>
          <p className="text-xl font-extrabold text-slate-800 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const reviewed = status === "REVIEWED";

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
        reviewed
          ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300"
          : "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300"
      }`}
    >
      {status || "UPLOADED"}
    </span>
  );
}

function Input(props) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
        {props.label}
      </label>
      <input
        {...props}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm outline-none focus:border-blue-500"
      />
    </div>
  );
}

function Textarea(props) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
        {props.label}
      </label>
      <textarea
        {...props}
        rows={4}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm outline-none focus:border-blue-500 resize-none"
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
        {label}
      </label>
      <select
        {...props}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm outline-none focus:border-blue-500"
      >
        {children}
      </select>
    </div>
  );
}

function Toast({ type, message }) {
  return (
    <div
      className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ${
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {message}
    </div>
  );
}
