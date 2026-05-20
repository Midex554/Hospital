// ─────────────────────────────────────────────
//  MediCore HMS — Reusable UI Components
// ─────────────────────────────────────────────

import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";

// ── StatCard ──────────────────────────────────
export function StatCard({ icon: Icon, label, value, sub, gradient, trend }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        gradient || "bg-white"
      }`}
    >
      {/* subtle background circle */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
            {label}
          </p>
          <p className="text-3xl font-extrabold text-white leading-tight">{value}</p>
          {sub && (
            <p className="text-xs text-white/60 mt-1">{sub}</p>
          )}
          {trend && (
            <span className="inline-block mt-2 text-xs font-medium bg-white/20 text-white px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon size={22} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── StatusBadge ───────────────────────────────
const statusMap = {
  // Appointment
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  pending:   "bg-amber-100 text-amber-700 border-amber-200",
  // Billing
  paid:      "bg-green-100 text-green-700 border-green-200",
  unpaid:    "bg-red-100 text-red-700 border-red-200",
  partial:   "bg-orange-100 text-orange-700 border-orange-200",
  // Generic
  active:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  inactive:  "bg-gray-100 text-gray-500 border-gray-200",
};

export function StatusBadge({ status }) {
  const cls = statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}
    </span>
  );
}

// ── ActionButton ──────────────────────────────
export function ActionButton({ onClick, icon: Icon, label, variant = "default", disabled }) {
  const variants = {
    default: "bg-slate-100 hover:bg-slate-200 text-slate-600",
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 shadow-sm",
    danger:  "bg-red-50 hover:bg-red-100 text-red-600",
    success: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700",
    ghost:   "hover:bg-slate-100 text-slate-500",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {Icon && <Icon size={13} />}
      {label && <span>{label}</span>}
    </button>
  );
}

// ── LoadingSkeleton ───────────────────────────
export function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse space-y-3 px-4 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="h-4 bg-slate-200 rounded w-1/12" />
          <div className="h-4 bg-slate-200 rounded w-3/12" />
          <div className="h-4 bg-slate-200 rounded w-2/12" />
          <div className="h-4 bg-slate-200 rounded w-2/12" />
          <div className="h-4 bg-slate-100 rounded w-1/12 ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ── EmptyState ────────────────────────────────
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="p-4 rounded-full bg-slate-100 mb-4">
          <Icon size={32} className="text-slate-400" />
        </div>
      )}
      <p className="text-base font-semibold text-slate-600">{title || "No data found"}</p>
      {description && (
        <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────
export function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* card */}
      <div
        className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl animate-modal-in overflow-hidden`}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── ConfirmModal ──────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title || "Confirm Action"} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-3 rounded-full bg-red-50">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <p className="text-sm text-slate-600">{message || "Are you sure? This cannot be undone."}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Toast / AlertBanner ───────────────────────
export function AlertBanner({ type = "info", message, onClose }) {
  const styles = {
    info:    { bg: "bg-blue-50 border-blue-200 text-blue-700",    Icon: Info },
    success: { bg: "bg-green-50 border-green-200 text-green-700", Icon: CheckCircle },
    error:   { bg: "bg-red-50 border-red-200 text-red-700",       Icon: AlertTriangle },
  };
  const { bg, Icon: Ic } = styles[type] || styles.info;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${bg}`}>
      <Ic size={16} />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ── Breadcrumb ────────────────────────────────
export function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          <span className={i === items.length - 1 ? "text-slate-600 font-medium" : "hover:text-slate-600 cursor-pointer"}>
            {item}
          </span>
        </span>
      ))}
    </nav>
  );
}

// ── FormInput ─────────────────────────────────
export function FormInput({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>}
      <input
        {...props}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 transition-all duration-150 outline-none
          focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
          ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"}
          ${props.className || ""}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function FormSelect({ label, error, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>}
      <select
        {...props}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 transition-all duration-150 outline-none bg-white
          focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
          ${error ? "border-red-400" : "border-slate-200 hover:border-slate-300"}
          ${props.className || ""}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
