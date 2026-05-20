import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layout/DashboardLayout";
import { Users, CalendarDays, CreditCard, FileText } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function StatCard({ icon: Icon, label, value, sub, gradient }) {
  return (
    <div
      className={`${gradient} rounded-2xl p-5 text-white shadow-sm hover:shadow-lg transition`}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon size={21} />
        </div>

        <span className="text-[11px] bg-white/20 px-2 py-1 rounded-full">
          Live
        </span>
      </div>

      <p className="text-sm text-white/80">{label}</p>
      <h3 className="text-2xl font-extrabold mt-1">{value}</h3>
      <p className="text-xs text-white/75 mt-1">{sub}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-36 rounded-2xl bg-slate-200 animate-pulse"
        />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");

      try {
        const h = authHeader();

        const [patientsRes, appointmentsRes, billsRes, recordsRes] =
          await Promise.all([
            api.get("/patients", { headers: h }),
            api.get("/appointments", { headers: h }),
            api.get("/bills", { headers: h }),
            api.get("/medical-records", { headers: h }),
          ]);

        setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
        setAppointments(
          Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [],
        );
        setBills(Array.isArray(billsRes.data) ? billsRes.data : []);
        setRecords(Array.isArray(recordsRes.data) ? recordsRes.data : []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data. Check backend, token, or endpoint.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const totalRevenue = useMemo(() => {
    return bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  }, [bills]);

  const chartData = [
    { name: "Patients", total: patients.length },
    { name: "Appointments", total: appointments.length },
    { name: "Bills", total: bills.length },
    { name: "Records", total: records.length },
  ];

  const recentAppointments = [...appointments].slice(-5).reverse();

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
        <p className="text-slate-500 text-sm">Welcome back 👋</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Users}
              label="Patients"
              value={patients.length}
              sub="Registered patients"
              gradient="bg-gradient-to-br from-blue-600 to-blue-800"
            />

            <StatCard
              icon={CalendarDays}
              label="Appointments"
              value={appointments.length}
              sub="Hospital appointments"
              gradient="bg-gradient-to-br from-cyan-500 to-cyan-700"
            />

            <StatCard
              icon={CreditCard}
              label="Revenue"
              value={`₦${totalRevenue.toLocaleString()}`}
              sub="Total bill amount"
              gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
            />

            <StatCard
              icon={FileText}
              label="Medical Records"
              value={records.length}
              sub="Stored records"
              gradient="bg-gradient-to-br from-violet-500 to-indigo-700"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                System Overview
              </h3>

              <div className="h-72 min-h-[288px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Recent Appointments
              </h3>

              {recentAppointments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No recent appointments.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentAppointments.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {item.patient?.firstName} {item.patient?.lastName}
                        </p>

                        <p className="text-xs text-slate-400">
                          {item.appointmentDate}
                        </p>
                      </div>

                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
