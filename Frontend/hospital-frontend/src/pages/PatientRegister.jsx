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
} from "lucide-react";

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

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

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
      setAlert({
        type: "error",
        message: validationError,
      });

      return;
    }

    setLoading(true);

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
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-[#07111f] via-[#0b1d3a] to-[#07111f] overflow-hidden relative">
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-[-80px] left-[-80px] w-80 h-80 rounded-full bg-blue-600/20 blur-3xl" />

      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "35px 35px",
        }}
      />

      <div className="w-full max-w-[520px] bg-white/[0.08] border border-white/10 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.35)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[-40px] left-[-40px] w-40 h-40 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.45)]">
              <Stethoscope size={22} className="text-white" />
            </div>

            <div>
              <h1 className="text-white text-xl font-extrabold">
                MediCore HMS
              </h1>

              <p className="text-cyan-400/80 text-[11px] tracking-[3px] uppercase font-bold">
                Patient Registration
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Create Patient Account
            </h2>

            <p className="text-white/60 text-sm mt-2">
              Securely register to access hospital services online.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Feature icon={ShieldCheck} text="Secure" />
            <Feature icon={HeartPulse} text="Healthcare" />
            <Feature icon={UserPlus} text="Portal Access" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />

              <Input
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />

            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
                Password
              </label>

              <div className="relative mt-1">
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-white/10 bg-white/10 text-white placeholder-white/40 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-cyan-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
                Gender
              </label>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-white/10 bg-white/10 text-white outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
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

            <Input
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
              "
            >
              {loading ? "Creating Account..." : "Create Patient Account"}
            </button>

            <p className="text-sm text-center mt-5 text-white/60">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 bg-white/10 border border-white/10 rounded-2xl py-4">
      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
        <Icon size={18} className="text-cyan-300" />
      </div>

      <p className="text-white/70 text-xs font-medium">{text}</p>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-white/10 bg-white/10 text-white placeholder-white/40 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
      />
    </div>
  );
}
