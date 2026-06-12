import { useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layout/DashboardLayout";

export default function BookAppointmentPage() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    appointmentDate: "",
    complaint: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        appointmentDate: form.appointmentDate,
        complaint: form.complaint,
        notes: form.notes,
        patient: {
          id: user.id,
        },
      };

      const res = await api.post("/appointments", payload);

      setMessage(
        `Appointment booked successfully with Dr. ${res.data.doctor.firstName} ${res.data.doctor.lastName}`,
      );

      setForm({
        appointmentDate: "",
        complaint: "",
        notes: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Book Appointment">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">
            Book Appointment
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Submit your complaint and get assigned to an available doctor.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Appointment Date
              </label>

              <input
                type="datetime-local"
                name="appointmentDate"
                value={form.appointmentDate}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Complaint
              </label>

              <input
                type="text"
                name="complaint"
                value={form.complaint}
                onChange={handleChange}
                placeholder="Enter your complaint"
                required
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Notes</label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Additional notes..."
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {message && (
              <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
