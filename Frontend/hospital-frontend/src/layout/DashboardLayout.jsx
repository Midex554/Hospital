import { useState, useEffect, useMemo } from "react";
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
  Activity,
  Stethoscope,
  UserRound,
  ClipboardPlus,
  Pill,
  MessageCircle,
  Search,
  Sun,
  Moon,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    roles: ["admin", "receptionist"],
  },
  {
    label: "Dashboard",
    path: "/patient",
    icon: LayoutDashboard,
    roles: ["patient"],
  },
  {
    label: "Dashboard",
    path: "/doctor",
    icon: LayoutDashboard,
    roles: ["doctor"],
  },

  {
    label: "Patients",
    path: "/patients",
    icon: Users,
    roles: ["admin", "doctor", "receptionist"],
  },
  {
    label: "Doctors",
    path: "/doctors",
    icon: Stethoscope,
    roles: ["admin", "doctor", "receptionist"],
  },
  {
    label: "Appointments",
    path: "/appointments",
    icon: CalendarDays,
    roles: ["admin", "receptionist"],
  },

  {
    label: "My Appointments",
    path: "/patient/appointments",
    icon: CalendarDays,
    roles: ["patient"],
  },
  {
    label: "Book Appointment",
    path: "/patient/book-appointment",
    icon: ClipboardPlus,
    roles: ["patient"],
  },

  {
    label: "Medical Records",
    path: "/medical-records",
    icon: FileText,
    roles: ["admin", "doctor", "patient"],
  },
  {
    label: "Chat",
    path: "/chat",
    icon: MessageCircle,
    roles: ["doctor", "patient"],
  },
  {
    label: "Pharmacy",
    path: "/pharmacy",
    icon: Pill,
    roles: ["admin", "receptionist"],
  },
  {
    label: "Billing",
    path: "/billing",
    icon: CreditCard,
    roles: ["admin", "receptionist"],
  },
  {
    label: "Doctor Shifts",
    path: "/doctor-shifts",
    icon: Activity,
    roles: ["admin"],
  },

  { label: "Profile", path: "/patient", icon: UserRound, roles: ["patient"] },
];

const PAGE_TITLES = {
  "/admin": ["Dashboard", "Overview"],
  "/patient": ["Dashboard", "Overview"],
  "/doctor": ["Dashboard", "Doctor Workspace"],
  "/patients": ["Dashboard", "Patients"],
  "/appointments": ["Dashboard", "Appointments"],
  "/patient/appointments": ["Dashboard", "My Appointments"],
  "/patient/book-appointment": ["Dashboard", "Book Appointment"],
  "/billing": ["Dashboard", "Billing"],
  "/medical-records": ["Dashboard", "Medical Records"],
  "/doctors": ["Dashboard", "Doctors"],
  "/doctor-shifts": ["Dashboard", "Doctor Shifts"],
  "/receptionist": ["Dashboard", "Receptionist"],
  "/pharmacy": ["Dashboard", "Pharmacy"],
  "/chat": ["Dashboard", "Consultation Chat"],
};

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const role = (
    localStorage.getItem("role") ||
    user?.role ||
    "ADMIN"
  ).toLowerCase();

  const displayName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    user?.userName ||
    role.toUpperCase();

  const initials =
    `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase() ||
    displayName.charAt(0).toUpperCase();

  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const breadcrumbs = PAGE_TITLES[location.pathname] || [
    "Dashboard",
    "Overview",
  ];

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, [currentTime]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#f5f8ff] dark:bg-slate-950 font-sans overflow-hidden text-slate-900 dark:text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative z-40 h-full w-[280px] shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Stethoscope size={25} className="text-white" />
            </div>

            <div>
              <h1 className="font-black text-slate-900 dark:text-white leading-tight">
                MediCore
              </h1>
              <p className="text-xs text-slate-400 font-semibold">
                Hospital System
              </p>
            </div>
          </div>

          <button
            className="lg:hidden text-slate-400 hover:text-red-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search menu..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>

        <nav className="flex-1 px-4 pb-4 overflow-y-auto space-y-1">
          <SectionTitle title="Main Menu" />

          {filteredNav.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={`${label}-${path}`}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-500 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Settings size={20} />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-20 bg-[#f5f8ff]/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <button
                className="lg:hidden w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={22} />
              </button>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  {breadcrumbs[0]}
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                  {breadcrumbs[1]}
                </h2>
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  placeholder="Search patients, doctors, appointments..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:border-blue-500 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setTheme((prev) => (prev === "dark" ? "light" : "dark"));
                }}
                className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:scale-105 transition"
                title="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun size={20} className="text-yellow-400" />
                ) : (
                  <Moon
                    size={20}
                    className="text-slate-700 dark:text-slate-200"
                  />
                )}
              </button>

              <button className="relative w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                  3
                </span>
              </button>

              <div className="hidden sm:flex items-center gap-3 pl-2">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30">
                  {initials}
                </div>

                <div className="hidden xl:block">
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {role} <span className="text-emerald-500">● Online</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 py-6 space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20">
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10" />
            <div className="absolute right-10 bottom-0 w-36 h-36 rounded-full bg-cyan-300/20" />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <p className="text-blue-100 font-semibold">
                  {currentTime.toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                <h1 className="text-2xl sm:text-4xl font-black mt-2">
                  {greeting}, {displayName} 👋
                </h1>

                <p className="text-blue-100 mt-3 max-w-2xl">
                  Welcome back to your MediCore workspace. Manage consultations,
                  records, billing, pharmacy, and patient care from one place.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 min-w-[260px]">
                <InfoPill
                  label="Time"
                  value={currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              </div>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <p className="px-4 pt-2 pb-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
      {title}
    </p>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur border border-white/20 px-4 py-3">
      <p className="text-xs text-blue-100 font-semibold">{label}</p>
      <p className="font-black mt-1">{value}</p>
    </div>
  );
}
