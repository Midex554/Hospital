// ─────────────────────────────────────────────
//  MediCore HMS — DashboardLayout
// ─────────────────────────────────────────────
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  Activity,
  Shield,
  Stethoscope,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    roles: ["admin", "doctor", "receptionist", "patient"],
  },

  {
    label: "Patients",
    path: "/patients",
    icon: Users,
    roles: ["admin", "doctor", "receptionist"],
  },

  {
    label: "Appointments",
    path: "/appointments",
    icon: CalendarDays,
    roles: ["admin", "doctor", "receptionist", "patient"],
  },

  {
    label: "Billing",
    path: "/billing",
    icon: CreditCard,
    roles: ["admin", "receptionist"],
  },

  {
    label: "Medical Records",
    path: "/medical-records",
    icon: FileText,
    roles: ["admin", "doctor", "patient"],
  },
];

const ROLE_COLORS = {
  admin: "bg-blue-100 text-blue-700",
  doctor: "bg-teal-100 text-teal-700",
  receptionist: "bg-purple-100 text-purple-700",
  patient: "bg-amber-100 text-amber-700",
};

const PAGE_TITLES = {
  "/admin": ["Dashboard", "Overview"],
  "/patients": ["Dashboard", "Patients"],
  "/appointments": ["Dashboard", "Appointments"],
  "/billing": ["Dashboard", "Billing"],
  "/medical-records": ["Dashboard", "Medical Records"],
};

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastSync, setLastSync] = useState("");

  // Pull user from localStorage (adjust key to match your auth logic)
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const role = user?.role || "admin";

  const filteredNav = NAV_ITEMS.filter((n) => n.roles.includes(role));

  useEffect(() => {
    const now = new Date();
    setLastSync(
      now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    );
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const breadcrumbs = PAGE_TITLES[location.pathname] || ["Dashboard"];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:relative z-40 flex flex-col h-full w-64 shrink-0
          bg-gradient-to-b from-[#0a1628] to-[#0d2244]
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg">
            <Stethoscope size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-base tracking-tight leading-tight">
              MediCore
            </p>
            <p className="text-cyan-400/80 text-[10px] font-medium tracking-widest uppercase">
              HMS
            </p>
          </div>
          <button
            className="ml-auto lg:hidden text-white/50 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* User card */}
        <div className="mx-3 mt-4 mb-2 px-3 py-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
              {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {user?.name || user?.username || "User"}
              </p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${ROLE_COLORS[role] || "bg-slate-100 text-slate-600"}`}
              >
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto scrollbar-none">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 pt-2 pb-1">
            Main Menu
          </p>
          {filteredNav.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-900/40"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={
                      isActive
                        ? "text-white"
                        : "text-white/50 group-hover:text-white/80"
                    }
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <ChevronRight size={13} className="text-white/70" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System health widget */}
        <div className="mx-3 mb-3 px-3 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <Activity size={13} className="text-emerald-400" />
            <p className="text-emerald-300 text-xs font-semibold">
              System Health
            </p>
          </div>
          <div className="flex gap-2">
            {["API", "DB", "Auth"].map((s) => (
              <div key={s} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-200/70 text-[10px]">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mx-3 mb-4 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-slate-200 shadow-sm shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex flex-col">
            <h1 className="text-base font-bold text-slate-800 leading-tight">
              {breadcrumbs[breadcrumbs.length - 1]}
            </h1>
            <nav className="flex items-center gap-1 text-[11px] text-slate-400">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={10} />}
                  <span
                    className={
                      i === breadcrumbs.length - 1
                        ? "text-slate-600 font-medium"
                        : ""
                    }
                  >
                    {b}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {lastSync && (
              <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Synced {lastSync}
              </span>
            )}

            {/* Notification bell */}
            <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shadow">
              {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {children}
        </main>
      </div>
    </div>
  );
}
