import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastTone = "success" | "error" | "info";

const meta: Record<ToastTone, { icon: typeof CheckCircle2; className: string }> = {
  success: { icon: CheckCircle2, className: "text-signal" },
  error: { icon: AlertCircle, className: "text-mute-red" },
  info: { icon: Info, className: "text-syntax-violet" },
};

export function Toast({
  tone = "success",
  message,
  onClose,
}: {
  tone?: ToastTone;
  message: string;
  onClose?: () => void;
}) {
  const { icon: Icon, className } = meta[tone];
  return (
    <div className="flex w-[min(92vw,360px)] items-start gap-3 rounded-[4px] border border-hairline bg-ink px-4 py-3 animate-toast-in">
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", className)} />
      <p className="flex-1 text-sm text-cloud">{message}</p>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="text-fog transition hover:text-bone"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
