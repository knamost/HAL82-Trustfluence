/**
 * Toast — lightweight toast notification system.
 * Uses React context + portal for global toast management.
 */
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, X, Info } from "lucide-react";

const ToastContext = createContext(undefined);

let toastId = 0;

/**
 * Toast provider — wrap your app with this component.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = "info", message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (message, duration) => addToast({ type: "success", message, duration }),
    error: (message, duration) => addToast({ type: "error", message, duration }),
    info: (message, duration) => addToast({ type: "info", message, duration }),
    warning: (message, duration) => addToast({ type: "warning", message, duration }),
  }, [addToast]);

  // Make toast callable as an object with methods
  const value = { toast: addToast, removeToast, toastHelpers: toast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: "24rem" }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: {
    bg: "bg-[#ECFDF5]",
    border: "border-[#059669]/20",
    text: "text-[#059669]",
    icon: "text-[#059669]",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "text-red-500",
  },
  warning: {
    bg: "bg-[#FFFBEB]",
    border: "border-[#D97706]/20",
    text: "text-[#92400E]",
    icon: "text-[#D97706]",
  },
  info: {
    bg: "bg-[#EEF2FF]",
    border: "border-[#2563EB]/20",
    text: "text-[#1E40AF]",
    icon: "text-[#2563EB]",
  },
};

function ToastItem({ toast, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setShow(true));
  }, []);

  const Icon = iconMap[toast.type] || iconMap.info;
  const colors = colorMap[toast.type] || colorMap.info;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border ${colors.bg} ${colors.border} shadow-lg transition-all duration-300 ${
        show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${colors.icon}`} />
      <p className={`flex-1 ${colors.text}`} style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="shrink-0 p-0.5 rounded-md hover:bg-black/5 transition-colors"
      >
        <X className={`w-4 h-4 ${colors.text}`} />
      </button>
    </div>
  );
}

/**
 * Hook to access toast functions.
 * Returns { toast, toastHelpers }
 * 
 * Usage:
 *   const { toast } = useToast();
 *   toast({ type: "success", message: "Done!" });
 * 
 * Or with helpers:
 *   const { toastHelpers } = useToast();
 *   toastHelpers.success("Profile saved!");
 *   toastHelpers.error("Something went wrong");
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
