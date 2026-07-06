import { cn } from "@/lib/cn";

/**
 * Lightweight password-strength cue for signup — encouraging, not punishing.
 * Scores on length + character variety into four bands and paints a segmented
 * bar. Purely advisory; the form's own `minLength={8}` is the hard rule.
 */
function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const BANDS = [
  { label: "Keep going", color: "bg-mute-red", text: "text-mute-red" },
  { label: "Getting there", color: "bg-key-lime/70", text: "text-key-lime" },
  { label: "Good", color: "bg-key-lime", text: "text-key-lime" },
  { label: "Strong 💪", color: "bg-signal", text: "text-signal" },
] as const;

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = scorePassword(password);
  const band = BANDS[Math.max(0, score - 1)];
  const filled = Math.max(1, score);

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < filled ? band.color : "bg-white/10",
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium", band.text)}>{band.label}</p>
    </div>
  );
}
