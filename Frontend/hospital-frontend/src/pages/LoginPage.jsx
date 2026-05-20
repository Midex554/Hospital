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
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const goByRole = (role) => {
    if (role === "ADMIN") navigate("/admin");
    else if (role === "DOCTOR") navigate("/doctor");
    else if (role === "RECEPTIONIST") navigate("/receptionist");
    else navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.post("/auth/login", form);
      const { token, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      setMessage({ type: "success", text: "Login successful" });
      setTimeout(() => goByRole(role), 900);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Invalid credentials. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {message && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-[400px] text-center shadow-xl">
            <h2
              className={`text-2xl font-bold mb-4 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {message.type === "success" ? "Success" : "Error"}
            </h2>
            <p className="text-slate-600 mb-6">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className={`px-5 py-2 rounded-xl text-white cursor-pointer ${message.type === "success" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              OK
            </button>
          </div>
        </div>
      )}

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

      <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Stethoscope size={18} className="text-white" />
            </div>
            <span className="text-slate-800 font-extrabold text-lg">
              MediCore HMS
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Sign in to your workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 outline-none transition-all hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
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
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 outline-none transition-all hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
