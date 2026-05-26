import {
  Bell,
  CalendarDays,
  CreditCard,
  HeartPulse,
  Pill,
  Stethoscope,
  UserRound,
} from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";

export default function PatientDashboard() {
  const role = localStorage.getItem("role") || "PATIENT";

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const displayName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Patient";

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <DashboardLayout title="Patient Dashboard">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <p className="text-white/70 text-sm font-medium">
                Patient Portal
              </p>

              <h1 className="text-2xl md:text-3xl font-extrabold mt-1">
                {greeting}, {displayName}
              </h1>

              <p className="text-white/70 text-sm mt-2 max-w-xl">
                Manage your appointments, prescriptions, payments, and hospital
                communication from one secure dashboard.
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <HeartPulse size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={CalendarDays}
            label="Appointments"
            value="0"
            sub="Upcoming visits"
            color="blue"
          />

          <StatCard
            icon={Pill}
            label="Prescriptions"
            value="0"
            sub="Available prescriptions"
            color="green"
          />

          <StatCard
            icon={CreditCard}
            label="Payments"
            value="₦0"
            sub="Total paid"
            color="purple"
          />

          <StatCard
            icon={Stethoscope}
            label="Assigned Doctor"
            value="—"
            sub="No active doctor yet"
            color="cyan"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Upcoming Appointments
                </h2>
                <p className="text-sm text-slate-400">
                  Your scheduled hospital consultations
                </p>
              </div>

              <CalendarDays className="text-blue-500" size={22} />
            </div>

            <EmptyBox
              icon={CalendarDays}
              title="No appointments yet"
              text="Book a consultation to get assigned to an available doctor."
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Notifications
                </h2>
                <p className="text-sm text-slate-400">
                  Latest hospital updates
                </p>
              </div>

              <Bell className="text-cyan-500" size={22} />
            </div>

            <div className="space-y-3">
              <NotificationItem
                title="Welcome to MediCore"
                text={`Your patient account is ready, ${displayName}.`}
              />

              <NotificationItem
                title="Next Step"
                text="Book an appointment to begin consultation."
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Prescriptions
                </h2>
                <p className="text-sm text-slate-400">
                  Doctor-issued medication notes
                </p>
              </div>

              <Pill className="text-emerald-500" size={22} />
            </div>

            <EmptyBox
              icon={Pill}
              title="No prescriptions"
              text="Your prescriptions will appear here after consultation."
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Patient Profile
                </h2>
                <p className="text-sm text-slate-400">
                  Account and access information
                </p>
              </div>

              <UserRound className="text-violet-500" size={22} />
            </div>

            <div className="space-y-3 text-sm">
              <InfoRow label="Name" value={displayName} />
              <InfoRow label="Email" value={user?.email || "—"} />
              <InfoRow label="Role" value={role} />
              <InfoRow label="Access" value="Patient Portal" />
              <InfoRow label="Status" value="Active" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue: "from-blue-600 to-blue-800",
    green: "from-emerald-500 to-teal-700",
    purple: "from-violet-500 to-purple-700",
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

function EmptyBox({ icon: Icon, title, text }) {
  return (
    <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
        <Icon size={22} />
      </div>

      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      <p className="text-xs text-slate-400 mt-1">{text}</p>
    </div>
  );
}

function NotificationItem({ title, text }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
        <Bell size={15} />
      </div>

      <div>
        <p className="text-sm font-bold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{text}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="text-slate-700 font-bold">{value}</span>
    </div>
  );
}
