"use client";

import { useEffect, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let addToastFn: ((toast: Toast) => void) | null = null;

export function toast(message: string, type: ToastType = "info") {
  if (addToastFn) {
    addToastFn({ id: String(Date.now()), type, message });
  }
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const styles = {
  success: "bg-emerald-600 border-emerald-500",
  error: "bg-red-600 border-red-500",
  info: "bg-blue-600 border-blue-500",
  warning: "bg-amber-600 border-amber-500",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    addToastFn = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => removeToast(toast.id), 4000);
    };
    return () => {
      addToastFn = null;
    };
  }, [removeToast]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`${styles[t.type]} border rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg animate-slide-down min-w-[280px]`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}