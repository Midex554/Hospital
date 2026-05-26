import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  Eye,
  EyeOff,
  Stethoscope,
  ShieldCheck,
  Activity,
  Users,
} from "lucide-react";

function FeatureBadge({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3.5 py-2.5">
      <div className="p-1.5 rounded-lg bg-white/20">
        <Icon size={14} className="text-white" />
      </div>
      <span className="text-white/90 text-sm font-medium">{text}</span>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const goByRole = (role) => {
    if (role === "ADMIN") navigate("/admin");
    else if (role === "DOCTOR") navigate("/doctor");
    else if (role === "RECEPTIONIST") navigate("/receptionist");
    else if (role === "PATIENT") navigate("/patient");
    else navigate("/admin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", form);

      const { token, role, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      goByRole(role);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <div className="hidden lg:flex flex-col justify-between w-[52%] bg-gradient-to-br from-[#0a1628] via-[#0d2244] to-[#0a3060] px-14 py-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-blue-400/10 blur-2xl" />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl shadow-blue-900/50">
            <Stethoscope size={22} className="text-white" />
          </div>

          <div>
            <p className="text-white font-extrabold text-xl tracking-tight">
              MediCore
            </p>
            <p className="text-cyan-400/80 text-[10px] font-bold tracking-[4px] uppercase">
              HMS Platform
            </p>
          </div>
        </div>

        <div className="relative space-y-6">
          <div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
              Smart Hospital
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Operations,
              </span>
              <br />
              Simplified.
            </h1>

            <p className="mt-4 text-white/60 text-base leading-relaxed max-w-sm">
              A unified platform for patient management, appointments, billing,
              and clinical records — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <FeatureBadge icon={Users} text="Patient Management" />
            <FeatureBadge icon={Activity} text="Live Analytics" />
            <FeatureBadge icon={ShieldCheck} text="Protected Access" />
            <FeatureBadge icon={Stethoscope} text="Clinical Records" />
          </div>
        </div>

        <p className="relative text-white/30 text-xs">
          © {new Date().getFullYear()} MediCore HMS.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 relative overflow-hidden bg-gradient-to-br from-[#07111f] via-[#0b1d3a] to-[#07111f] lg:bg-slate-50">
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-cyan-500/25 blur-3xl" />
          <div className="absolute bottom-[-80px] left-[-80px] w-80 h-80 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute top-1/3 left-1/2 w-52 h-52 rounded-full bg-indigo-500/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
          <div className="absolute top-40 right-16 w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
          <div className="absolute bottom-32 left-16 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-1.5 h-1.5 rounded-full bg-blue-300 animate-ping" />
        </div>

        <div className="absolute -inset-10 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none lg:hidden" />

        <div
          className="
            w-full
            max-w-[400px]
            relative
            bg-white/[0.08]
            lg:bg-transparent
            border
            border-white/10
            lg:border-transparent
            backdrop-blur-2xl
            lg:backdrop-blur-none
            rounded-[32px]
            lg:rounded-none
            p-7
            lg:p-0
            overflow-hidden
            shadow-[0_8px_40px_rgba(0,0,0,0.35)]
            lg:shadow-none
            before:absolute
            before:inset-0
            before:rounded-[32px]
            before:bg-gradient-to-br
            before:from-white/10
            before:to-transparent
            before:pointer-events-none
            lg:before:hidden
          "
        >
          <div className="absolute inset-[1px] rounded-[31px] border border-cyan-400/10 pointer-events-none lg:hidden" />

          <div className="absolute inset-0 opacity-[0.06] pointer-events-none lg:hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-cyan-400/20 blur-3xl lg:hidden" />
          <div className="absolute bottom-[-40px] left-[-40px] w-40 h-40 rounded-full bg-blue-500/20 blur-3xl lg:hidden" />

          <div className="relative">
            <div className="flex lg:hidden items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.45)]">
                <Stethoscope size={18} className="text-white" />
              </div>
              <span className="text-white font-extrabold text-lg">
                MediCore HMS
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl lg:text-2xl font-extrabold text-white lg:text-slate-800 tracking-tight">
                Welcome back
              </h2>
              <p className="text-white/60 lg:text-slate-500 text-sm mt-1">
                Sign in to your workspace
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/60 lg:text-slate-500 uppercase tracking-widest">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-white/10 lg:border-slate-200 bg-white/10 lg:bg-white text-white lg:text-slate-800 placeholder-white/40 lg:placeholder-slate-400 outline-none transition-all hover:border-cyan-400/40 lg:hover:border-slate-300 focus:border-cyan-400 lg:focus:border-blue-500 focus:ring-4 focus:ring-cyan-400/20 lg:focus:ring-blue-500/10 shadow-inner shadow-black/20 lg:shadow-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/60 lg:text-slate-500 uppercase tracking-widest">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-white/10 lg:border-slate-200 bg-white/10 lg:bg-white text-white lg:text-slate-800 placeholder-white/40 lg:placeholder-slate-400 outline-none transition-all hover:border-cyan-400/40 lg:hover:border-slate-300 focus:border-cyan-400 lg:focus:border-blue-500 focus:ring-4 focus:ring-cyan-400/20 lg:focus:ring-blue-500/10 shadow-inner shadow-black/20 lg:shadow-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 lg:text-slate-400 hover:text-cyan-300 lg:hover:text-slate-600 cursor-pointer"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-400/20 text-red-200 lg:bg-red-50 lg:border-red-200 lg:text-red-600 text-xs px-3.5 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  py-3.5
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-500
                  via-cyan-500
                  to-blue-600
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  text-white
                  font-bold
                  text-sm
                  transition-all
                  duration-300
                  shadow-[0_0_25px_rgba(59,130,246,0.55)]
                  hover:shadow-[0_0_35px_rgba(34,211,238,0.75)]
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  cursor-pointer
                "
              >
                {loading ? "Signing in…" : "Sign In →"}
              </button>

              <p className="text-sm text-center mt-5 text-white/60 lg:text-slate-500">
                Don’t have a patient account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/patient-register")}
                  className="text-cyan-400 lg:text-blue-600 font-bold hover:underline"
                >
                  Create Account
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
