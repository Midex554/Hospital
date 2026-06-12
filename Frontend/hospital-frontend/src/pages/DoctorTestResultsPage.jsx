import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  X,
  Save,
  UserRound,
} from "lucide-react";
import api from "../api/api";
import DashboardLayout from "../layout/DashboardLayout";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const API_BASE =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8080";

export default function DoctorTestResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [doctorComment, setDoctorComment] = useState("");

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const doctorId = user?.doctorId || user?.id;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchResults = async () => {
    setLoading(true);

    try {
      if (!doctorId) {
        showToast("error", "Doctor ID not found. Please login again.");
        return;
      }

      const res = await api.get(`/test-results/doctor/${doctorId}`, {
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

  useEffect(() => {
    fetchResults();
  }, []);

  const stats = useMemo(() => {
    return {
      total: results.length,
      uploaded: results.filter((r) => r.status === "UPLOADED").length,
      reviewed: results.filter((r) => r.status === "REVIEWED").length,
    };
  }, [results]);

  const openReview = (result) => {
    setSelected(result);
    setDoctorComment(result.doctorComment || "");
    setReviewOpen(true);
  };

  const handleReview = async () => {
    if (!selected) return;

    if (!doctorComment.trim()) {
      showToast("error", "Doctor comment is required.");
      return;
    }

    setSaving(true);

    try {
      const res = await api.put(
        `/test-results/${selected.id}/review`,
        {
          doctorComment: doctorComment.trim(),
        },
        {
          headers: authHeader(),
        },
      );

      setResults((prev) =>
        prev.map((item) => (item.id === selected.id ? res.data : item)),
      );

      showToast("success", "Test result reviewed successfully.");
      setReviewOpen(false);
      setSelected(null);
      setDoctorComment("");
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to review test result.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Test Results">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="max-w-[1400px] mx-auto space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Results" value={stats.total} icon={FileText} />
          <StatCard
            label="Pending Review"
            value={stats.uploaded}
            icon={Clock}
          />
          <StatCard
            label="Reviewed"
            value={stats.reviewed}
            icon={CheckCircle}
          />
        </div>

        <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
              Patient Test Results
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              Review uploaded patient PDF/images and add medical comments.
            </p>
          </div>

          <button
            onClick={fetchResults}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                  {[
                    "#",
                    "Patient",
                    "Test Name",
                    "File",
                    "Status",
                    "Uploaded",
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
                      className="p-10 text-center text-slate-500 dark:text-slate-300"
                    >
                      No test result assigned to you yet.
                    </td>
                  </tr>
                ) : (
                  results.map((result, index) => (
                    <tr
                      key={result.id}
                      className="border-b border-slate-50 dark:border-slate-800 hover:bg-blue-50/40 dark:hover:bg-slate-800/70"
                    >
                      <td className="px-4 py-3 text-slate-400">{index + 1}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                            <UserRound size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white">
                              {result.patient?.firstName || ""}{" "}
                              {result.patient?.lastName || ""}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {result.patient?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                        {result.testName || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {result.fileName || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={result.status} />
                      </td>

                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {result.uploadedAt
                          ? new Date(result.uploadedAt).toLocaleString()
                          : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => openReview(result)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                        >
                          <Eye size={14} />
                          Review
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

      <ReviewModal
        open={reviewOpen}
        result={selected}
        doctorComment={doctorComment}
        setDoctorComment={setDoctorComment}
        saving={saving}
        onClose={() => setReviewOpen(false)}
        onSave={handleReview}
      />
    </DashboardLayout>
  );
}

function ReviewModal({
  open,
  result,
  doctorComment,
  setDoctorComment,
  saving,
  onClose,
  onSave,
}) {
  if (!open || !result) return null;

  const fileLink = `${API_BASE}${result.fileUrl}`;
  const isImage = result.fileType?.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl p-6 border border-slate-100 dark:border-slate-700 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
              {result.testName}
            </h2>
            <p className="text-xs text-slate-400">
              Patient: {result.patient?.firstName} {result.patient?.lastName}
            </p>
          </div>

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

        <div className="mt-5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
            Doctor Review Comment
          </label>

          <textarea
            value={doctorComment}
            onChange={(e) => setDoctorComment(e.target.value)}
            rows={5}
            placeholder="Write your medical review comment..."
            className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-50"
        >
          <Save size={17} />
          {saving ? "Saving Review..." : "Save Review"}
        </button>
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
