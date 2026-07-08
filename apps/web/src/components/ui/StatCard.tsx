import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  detail?: string;
  icon: LucideIcon;
  tone?: "green" | "blue" | "amber" | "red" | "slate";
}

const tones = {
  green: "border-l-pharma-600 bg-pharma-50 text-pharma-700",
  blue: "border-l-blue-600 bg-blue-50 text-blue-700",
  amber: "border-l-amber-500 bg-amber-50 text-amber-700",
  red: "border-l-red-500 bg-red-50 text-red-700",
  slate: "border-l-slate-500 bg-slate-50 text-slate-700",
};

export function StatCard({ label, value, detail, icon: Icon, tone = "green" }: StatCardProps) {
  return (
    <div className="rounded-md border border-slate-200 border-l-4 border-l-pharma-600 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className={["flex h-11 w-11 items-center justify-center rounded-md", tones[tone]].join(" ")}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      {detail ? <p className="mt-3 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}
