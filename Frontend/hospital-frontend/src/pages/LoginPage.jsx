import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  CalendarDays,
  BarChart3,
  Users,
  Headphones,
  Cloud,
  Stethoscope,
  ArrowRight,
  UserPlus,
} from "lucide-react";

import loginBg from "../assets/videos/286443_medium.mp4";

const avatars = [
  "https://i.pravatar.cc/40?img=1",
  "https://i.pravatar.cc/40?img=5",
  "https://i.pravatar.cc/40?img=8",
  "https://i.pravatar.cc/40?img=12",
];

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md hover:bg-white/[0.08] transition">
      <div className="flex gap-4 items-start">
        <div className="w-11 h-11 rounded-xl bg-blue-600/25 text-cyan-300 flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>

        <div>
          <h3 className="text-white font-bold text-sm">{title}</h3>
          <p className="text-white/55 text-xs mt-1 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

function TrustBadge({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-black/25 border border-white/10 px-5 py-3 backdrop-blur-xl">
      <div className="w-10 h-10 rounded-xl bg-white/10 text-cyan-300 flex items-center justify-center shrink-0">
        <Icon size={19} />
      </div>

      <div>
        <p className="text-white font-bold text-sm leading-tight">{title}</p>
        <p className="text-white/55 text-xs">{text}</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const goByRole = (role) => {
    if (role === "ADMIN") navigate("/admin");
    else if (role === "DOCTOR") navigate("/doctor");
    else if (role === "RECEPTIONIST") navigate("/receptionist");
    else if (role === "PATIENT") navigate("/patient");
    else navigate("/login");
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
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="fixed inset-0 h-full w-full object-cover opacity-100"
      >
        <source src={loginBg} type="video/mp4" />
      </video>

      <div className="fixed inset-0 bg-black/35" />
      <div className="fixed inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/35 to-slate-950/20" />

      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:52px_52px]" />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[46%_54%]">
        <section
          className="
    hidden lg:flex
    relative
    flex-col
    justify-between
    px-14
    py-12
    bg-[#010048]
    border-r
    border-cyan-500/20
    overflow-hidden
    rounded-br-[120px]
    shadow-[0_0_80px_rgba(0,120,255,0.15)]
  "
        >
          <div className="absolute -right-32 bottom-[-80px] w-[350px] h-[350px] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute top-32 left-40 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <div className="absolute top-72 left-72 w-1 h-1 bg-blue-300 rounded-full animate-pulse" />
          <div className="absolute bottom-44 left-52 w-2 h-2 bg-cyan-300 rounded-full animate-pulse" />

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/60">
              <Stethoscope size={22} className="text-white" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold leading-none tracking-wide">
                MediCore
              </h2>
              <p className="text-cyan-400 text-[10px] tracking-[0.4em] font-bold mt-0.5">
                HMS PLATFORM
              </p>
            </div>
          </div>

          <div className="max-w-[580px]">
            <h1 className="text-5xl xl:text-[3.4rem] font-black leading-[1.08] tracking-tight">
              Smart Healthcare,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Better Outcomes
              </span>
            </h1>

            <div className="w-36 h-[3px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 mt-6 shadow-[0_0_18px_rgba(34,211,238,0.75)]" />

            <p className="text-white/70 text-base leading-relaxed mt-6 max-w-lg">
              A unified platform for patient management, appointments, billing,
              consultation, prescriptions, and clinical records.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <FeatureCard
                icon={Users}
                title="Patient Management"
                text="Efficiently manage patient information and history"
              />

              <FeatureCard
                icon={CalendarDays}
                title="Smart Appointments"
                text="Schedule and manage appointments seamlessly"
              />

              <FeatureCard
                icon={ShieldCheck}
                title="Secure & Private"
                text="Enterprise-grade security for hospital data"
              />

              <FeatureCard
                icon={BarChart3}
                title="Analytics & Reports"
                text="Real-time insights for better decisions"
              />
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-600/25 flex items-center justify-center text-cyan-300 shrink-0">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="font-bold text-sm text-white">
                    Trusted by Hospitals
                  </p>
                  <p className="text-white/55 text-xs">
                    Modern. Secure. Reliable.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {avatars.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt="Hospital user"
                      className="w-8 h-8 rounded-full border-2 border-slate-800 object-cover"
                    />
                  ))}
                </div>

                <div className="rounded-xl bg-blue-600/45 px-4 py-2 text-center min-w-[70px]">
                  <p className="text-cyan-200 font-black text-lg leading-none">
                    500+
                  </p>
                  <p className="text-white/55 text-[10px] mt-0.5">Hospitals</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} MediCore HMS. All rights reserved.
          </p>
        </section>

        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-5 py-5 sm:py-8">
          <div className="lg:hidden mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/60">
              <Stethoscope size={20} className="text-white" />
            </div>

            <div>
              <h2 className="text-lg font-extrabold leading-none tracking-wide">
                MediCore
              </h2>
              <p className="text-cyan-300 text-[9px] tracking-[0.35em] font-bold mt-0.5">
                HMS PLATFORM
              </p>
            </div>
          </div>

          <div className="w-full max-w-[420px] rounded-[26px] border border-white/15 bg-white/[0.06] backdrop-blur-md shadow-[0_20px_80px_rgba(0,0,0,0.45)] px-5 sm:px-8 py-6 sm:py-8">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/15 border border-white/20 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(34,211,238,0.25)]">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Stethoscope size={21} className="text-white" />
              </div>
            </div>

            <div className="text-center mb-5">
              <h2 className="text-2xl sm:text-[1.75rem] font-black tracking-tight">
                Welcome Back
              </h2>

              <p className="text-white/65 text-xs sm:text-sm mt-1">
                Sign in to continue to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-white/80 mb-1.5">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full h-[48px] sm:h-[52px] rounded-xl border border-white/15 bg-white/[0.07] pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/15 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-white/80 mb-1.5">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
                  />

                  <input
                    type={showPw ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full h-[48px] sm:h-[52px] rounded-xl border border-white/15 bg-white/[0.07] pl-11 pr-11 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/15 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-cyan-300 transition"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center gap-2 text-white/65 cursor-pointer select-none">
                  <input type="checkbox" className="accent-cyan-400 w-4 h-4" />
                  Remember me
                </label>

                <button
                  type="button"
                  className="text-cyan-300 font-semibold hover:text-cyan-200 transition"
                >
                  Forgot Password?
                </button>
              </div>

              {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] sm:h-[52px] rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 text-white font-bold text-sm shadow-[0_12px_35px_rgba(37,99,235,0.4)] hover:scale-[1.015] active:scale-[0.985] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Signing In..."
                ) : (
                  <>
                    Sign In <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 text-white/40 text-xs">
                <div className="h-px flex-1 bg-white/15" />
                OR
                <div className="h-px flex-1 bg-white/15" />
              </div>

              <button
                type="button"
                onClick={() => navigate("/patient-register")}
                className="w-full h-[48px] sm:h-[52px] rounded-xl border border-white/20 bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                Create Patient Account <UserPlus size={17} />
              </button>

              <p className="text-center text-white/60 text-xs sm:text-sm">
                Need Help?{" "}
                <button
                  type="button"
                  className="text-cyan-300 font-semibold hover:text-cyan-200 transition"
                >
                  Contact Support
                </button>
              </p>
            </form>
          </div>

          <div className="hidden lg:flex gap-4 mt-8">
            <TrustBadge icon={ShieldCheck} title="HIPAA" text="Compliant" />
            <TrustBadge icon={Headphones} title="24/7" text="Support" />
            <TrustBadge icon={Cloud} title="Cloud" text="Secure" />
          </div>
        </section>
      </div>
    </div>
  );
}
