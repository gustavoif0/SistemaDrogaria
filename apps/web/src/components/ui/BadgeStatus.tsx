import type { ReactNode } from "react";

type BadgeTone = "success" | "warning" | "danger" | "neutral" | "info";

interface BadgeStatusProps {
  children: ReactNode;
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

export function BadgeStatus({ children, tone = "neutral" }: BadgeStatusProps) {
  return (
    <span
      className={[
        "inline-flex h-6 items-center rounded-md border px-2 text-xs font-semibold",
        tones[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
