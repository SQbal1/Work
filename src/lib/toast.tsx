"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Toast, type ToastTone } from "@/components/ui/Toast";

interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

/** Errors linger longer since they often carry an instruction to read. */
const DURATION: Record<ToastTone, number> = {
  success: 3400,
  info: 3400,
  error: 6000,
};

interface ToastApi {
  toast: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());
  const durations = useRef<Map<string, number>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const handle = timers.current.get(id);
    if (handle) {
      window.clearTimeout(handle);
      timers.current.delete(id);
    }
  }, []);

  const remove = useCallback(
    (id: string) => {
      clearTimer(id);
      durations.current.delete(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    },
    [clearTimer],
  );

  // Pause the auto-dismiss while the pointer/focus is on a toast…
  const pause = useCallback((id: string) => clearTimer(id), [clearTimer]);
  // …and restart the full timer when the pointer/focus leaves.
  const resume = useCallback(
    (id: string) => {
      if (timers.current.has(id) || !durations.current.has(id)) return;
      const handle = window.setTimeout(() => remove(id), durations.current.get(id));
      timers.current.set(id, handle);
    },
    [remove],
  );

  const toast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = Math.random().toString(36).slice(2);
      const duration = DURATION[tone];
      durations.current.set(id, duration);
      setItems((prev) => [...prev, { id, message, tone }]);
      timers.current.set(id, window.setTimeout(() => remove(id), duration));
    },
    [remove],
  );

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      success: (m: string) => toast(m, "success"),
      error: (m: string) => toast(m, "error"),
      info: (m: string) => toast(m, "info"),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto"
            onMouseEnter={() => pause(t.id)}
            onMouseLeave={() => resume(t.id)}
            onFocus={() => pause(t.id)}
            onBlur={() => resume(t.id)}
          >
            <Toast tone={t.tone} message={t.message} onClose={() => remove(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
