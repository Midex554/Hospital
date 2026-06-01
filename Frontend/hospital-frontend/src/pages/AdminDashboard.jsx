import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layout/DashboardLayout";
import {
  Users,
  CalendarDays,
  CreditCard,
  FileText,
  Activity,
  TrendingUp,
} from "lucide-react";
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

  const paidRevenue = useMemo(() => {
    return bills
      .filter((bill) => bill.status?.toLowerCase() === "paid")
      .reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  }, [bills]);

  const pendingAppointments = appointments.filter(
    (a) => a.status === "Pending",
  ).length;

  const chartData = [
    { name: "Patients", total: patients.length },
    { name: "Appointments", total: appointments.length },
    { name: "Bills", total: bills.length },
    { name: "Records", total: records.length },
  ];

  const recentAppointments = [...appointments].slice(-5).reverse();
  const recentRecords = [...records].slice(-4).reverse();

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl p-4 text-sm font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Patients"
                value={patients.length}
                sub="Registered patients"
                gradient="from-blue-600 to-blue-800"
              />

              <StatCard
                icon={CalendarDays}
                label="Appointments"
                value={appointments.length}
                sub={`${pendingAppointments} pending approval`}
                gradient="from-cyan-500 to-blue-700"
              />

              <StatCard
                icon={CreditCard}
                label="Revenue"
                value={`₦${totalRevenue.toLocaleString()}`}
                sub={`₦${paidRevenue.toLocaleString()} paid`}
                gradient="from-emerald-500 to-teal-700"
              />

              <StatCard
                icon={FileText}
                label="Medical Records"
                value={records.length}
                sub="Stored patient records"
                gradient="from-violet-500 to-indigo-700"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      System Overview
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Hospital activity summary
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                    <TrendingUp size={22} />
                  </div>
                </div>

                <div className="h-72 min-h-[288px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis allowDecimals={false} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: "14px",
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="total"
                        fill="#2563eb"
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Recent Appointments
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Latest patient bookings
                    </p>
                  </div>

                  <CalendarDays className="text-blue-600 dark:text-blue-300" />
                </div>

                {recentAppointments.length === 0 ? (
                  <EmptyState text="No recent appointments." />
                ) : (
                  <div className="space-y-3">
                    {recentAppointments.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 rounded-2xl p-3"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">
                            {item.patient?.firstName} {item.patient?.lastName}
                          </p>

                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {item.appointmentDate
                              ? new Date(item.appointmentDate).toLocaleString()
                              : "No date"}
                          </p>
                        </div>

                        <StatusBadge status={item.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Quick Actions
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Common admin tasks
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <QuickAction icon={Users} label="Patients" />
                  <QuickAction icon={CalendarDays} label="Appointments" />
                  <QuickAction icon={CreditCard} label="Billing" />
                  <QuickAction icon={FileText} label="Records" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Recent Records
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Latest medical updates
                    </p>
                  </div>

                  <FileText className="text-violet-500" />
                </div>

                {recentRecords.length === 0 ? (
                  <EmptyState text="No medical records yet." />
                ) : (
                  <div className="space-y-3">
                    {recentRecords.map((record) => (
                      <div
                        key={record.id}
                        className="bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 rounded-2xl p-3"
                      >
                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                          {record.diagnosis || "Medical Record"}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {record.createdAt
                            ? new Date(record.createdAt).toLocaleString()
                            : "No date"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      System Status
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      HMS health overview
                    </p>
                  </div>

                  <Activity className="text-emerald-500" />
                </div>

                <div className="space-y-3">
                  <StatusRow label="Backend API" value="Online" />
                  <StatusRow label="Database" value="Connected" />
                  <StatusRow label="Authentication" value="Active" />
                  <StatusRow label="Dashboard" value="Stable" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, sub, gradient }) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-3xl p-5 text-white shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition`}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
          <Icon size={22} />
        </div>

        <span className="text-[11px] bg-white/20 px-2 py-1 rounded-full font-bold">
          Live
        </span>
      </div>

      <p className="text-sm text-white/80 font-medium">{label}</p>
      <h3 className="text-3xl font-black mt-1">{value}</h3>
      <p className="text-xs text-white/75 mt-1">{sub}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label }) {
  return (
    <button className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 p-4 text-left hover:bg-blue-50 dark:hover:bg-blue-950/30 transition">
      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 flex items-center justify-center mb-3">
        <Icon size={19} />
      </div>
      <p className="text-sm font-black text-slate-800 dark:text-white">
        {label}
      </p>
    </button>
  );
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase();

  const cls =
    s === "approved"
      ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300"
      : s === "rejected"
        ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300"
        : s === "completed"
          ? "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
          : "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300";

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${cls}`}>
      {status || "Pending"}
    </span>
  );
}

function StatusRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 px-4 py-3">
      <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
        {label}
      </span>
      <span className="text-sm text-emerald-600 dark:text-emerald-300 font-black">
        {value}
      </span>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
      <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-36 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"
        />
      ))}
    </div>
  );
}
