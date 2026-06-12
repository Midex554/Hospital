import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  HeartPulse,
  Stethoscope,
  Mail,
  Lock,
  Phone,
  MapPin,
  UserRound,
  CalendarDays,
  BarChart3,
  Users,
  ArrowRight,
  Headphones,
  Cloud,
} from "lucide-react";

import loginBg from "../assets/videos/286443_medium.mp4";

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white dark:bg-slate-900/[0.06] p-5 backdrop-blur-xl hover:bg-white dark:bg-slate-900/[0.09] transition-all duration-200">
      <div className="flex gap-4 items-start">
        <div className="w-11 h-11 rounded-xl bg-blue-600/30 text-cyan-300 flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>

        <div>
          <h3 className="text-white font-bold text-sm">{title}</h3>
          <p className="text-white/50 text-xs mt-1 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

function TrustBadge({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-950/60 border border-white/10 px-5 py-3 backdrop-blur-xl">
      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900/10 text-cyan-300 flex items-center justify-center shrink-0">
        <Icon size={19} />
      </div>

      <div>
        <p className="text-white font-bold text-sm leading-tight">{title}</p>
        <p className="text-white/45 text-xs">{text}</p>
      </div>
    </div>
  );
}

function Input({ icon: Icon, label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-white/80 mb-1.5">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
        />

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full h-[50px] rounded-xl border border-white/15 bg-white dark:bg-slate-900/[0.08] pl-11 pr-4 text-sm text-white placeholder-white/35 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15 transition"
        />
      </div>
    </div>
  );
}

export default function PatientRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    address: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!form.firstName.trim()) return "First name is required";
    if (!form.lastName.trim()) return "Last name is required";
    if (!form.email.trim()) return "Email is required";
    if (!form.password.trim()) return "Password is required";
    if (!form.phone.trim()) return "Phone number is required";
    if (!form.gender.trim()) return "Gender is required";
    if (!form.address.trim()) return "Address is required";

    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setAlert({ type: "error", message: validationError });
      return;
    }

    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      await api.post("/auth/patient/register", form);

      setAlert({
        type: "success",
        message: "Patient account created successfully",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.message || "Registration failed. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030d1f] text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute right-0 top-0 h-full w-full lg:w-[58%] object-cover opacity-90"
      >
        <source src={loginBg} type="video/mp4" />
      </video>

      <div className="absolute right-0 top-0 h-full w-full lg:w-[58%] bg-blue-950/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030d1f] via-[#030d1f]/96 lg:via-[#030d1f]/85 to-[#030d1f]/20" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:52px_52px]" />

      <div className="absolute top-20 right-40 w-72 h-72 rounded-full bg-cyan-400/15 blur-3xl animate-pulse" />
      <div
        className="absolute bottom-24 right-80 w-80 h-80 rounded-full bg-blue-700/20 blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[46%_54%]">
        <section
          className="
    hidden lg:flex
    relative
    flex-col
    justify-between
    px-14
    py-12
    bg-[#021433]
    border-r
    border-cyan-500/20
    overflow-hidden
    rounded-br-[120px]
    shadow-[0_0_80px_rgba(0,120,255,0.15)]
  "
        >
          <div
            className="
    absolute
    -right-24
    bottom-0
    w-[250px]
    h-[250px]
    border
    border-cyan-400/40
    rounded-full
    blur-[1px]
  "
          />
          <div
            className="
    absolute
    -right-32
    bottom-[-80px]
    w-[350px]
    h-[350px]
    rounded-full
    bg-cyan-500/10
    blur-3xl
  "
          />
          <div
            className="
    absolute
    inset-0
    bg-gradient-to-br
    from-[#021433]
    via-[#031d47]
    to-[#021433]
    -z-10
  "
          />
          <div className="absolute top-32 left-40 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <div className="absolute top-72 left-72 w-1 h-1 bg-blue-300 rounded-full animate-pulse" />
          <div className="absolute bottom-44 left-52 w-2 h-2 bg-cyan-300 rounded-full animate-pulse" />
          <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />

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
              Join Smart Healthcare,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Better Patient Care
              </span>
            </h1>

            <div className="w-36 h-[3px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 mt-6 shadow-[0_0_18px_rgba(34,211,238,0.75)]" />

            <p className="text-white/60 text-base leading-relaxed mt-6 max-w-lg">
              Create your secure patient account to book appointments, view
              prescriptions, track medical records, and communicate with
              doctors.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <FeatureCard
                icon={Users}
                title="Patient Portal"
                text="Access your personal healthcare dashboard anytime"
              />

              <FeatureCard
                icon={CalendarDays}
                title="Easy Booking"
                text="Book appointments and track doctor assignment"
              />

              <FeatureCard
                icon={ShieldCheck}
                title="Protected Access"
                text="Your medical data stays secure and private"
              />

              <FeatureCard
                icon={HeartPulse}
                title="Care Tracking"
                text="Follow your care journey from visit to prescription"
              />
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white dark:bg-slate-900/[0.05] backdrop-blur-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-600/25 flex items-center justify-center text-cyan-300 shrink-0">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="font-bold text-sm text-white">
                    Trusted Patient Access
                  </p>
                  <p className="text-white/50 text-xs">
                    Secure. Fast. Reliable.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-blue-600/50 px-4 py-2 text-center min-w-[70px]">
                <p className="text-cyan-200 font-black text-lg leading-none">
                  24/7
                </p>
                <p className="text-white/55 text-[10px] mt-0.5">Portal</p>
              </div>
            </div>
          </div>

          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} MediCore HMS. All rights reserved.
          </p>
        </section>

        <section className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
          <div className="w-full max-w-[560px] rounded-[30px] border border-white/15 bg-[#0d1f3c]/60 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 sm:px-8 py-8">
            <div className="mx-auto w-18 h-18 rounded-full bg-white dark:bg-slate-900/90 flex items-center justify-center mb-5 shadow-[0_0_50px_rgba(34,211,238,0.35)]">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <UserPlus size={23} className="text-white" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-[1.75rem] font-black tracking-tight">
                Create Patient Account
              </h2>

              <p className="text-white/55 text-sm mt-1.5">
                Register to access hospital services online
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <MiniFeature icon={ShieldCheck} text="Secure" />
              <MiniFeature icon={HeartPulse} text="Healthcare" />
              <MiniFeature icon={UserPlus} text="Portal" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  icon={UserRound}
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                />

                <Input
                  icon={UserRound}
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>

              <Input
                icon={Mail}
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  icon={Phone}
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full h-[50px] rounded-xl border border-white/15 bg-white dark:bg-slate-900/[0.08] px-4 text-sm text-white outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15 transition"
                  >
                    <option value="" className="text-black">
                      Select gender
                    </option>
                    <option value="Male" className="text-black">
                      Male
                    </option>
                    <option value="Female" className="text-black">
                      Female
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1.5">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  />

                  <input
                    type={showPw ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="w-full h-[50px] rounded-xl border border-white/15 bg-white dark:bg-slate-900/[0.08] pl-11 pr-11 text-sm text-white placeholder-white/35 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-cyan-300 transition"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Input
                icon={MapPin}
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
              />

              {alert.message && (
                <div
                  className={`text-sm px-4 py-3 rounded-xl border ${
                    alert.type === "success"
                      ? "bg-green-500/10 border-green-400/20 text-green-200"
                      : "bg-red-500/10 border-red-400/20 text-red-200"
                  }`}
                >
                  {alert.message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 text-white font-bold text-sm shadow-[0_12px_35px_rgba(37,99,235,0.4)] hover:scale-[1.015] active:scale-[0.985] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Creating Account..."
                ) : (
                  <>
                    Create Patient Account <ArrowRight size={17} />
                  </>
                )}
              </button>

              <p className="text-center text-white/50 text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-cyan-300 font-semibold hover:text-cyan-200 transition"
                >
                  Sign In
                </button>
              </p>
            </form>
          </div>

          <div className="hidden lg:flex gap-4 mt-8">
            <TrustBadge icon={ShieldCheck} title="Secure" text="Access" />
            <TrustBadge icon={Headphones} title="24/7" text="Support" />
            <TrustBadge icon={Cloud} title="Cloud" text="Portal" />
          </div>
        </section>
      </div>
    </div>
  );
}

function MiniFeature({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 bg-white dark:bg-slate-900/[0.07] border border-white/10 rounded-2xl py-3">
      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center">
        <Icon size={15} className="text-cyan-300" />
      </div>

      <p className="text-white/65 text-[11px] font-medium">{text}</p>
    </div>
  );
}
