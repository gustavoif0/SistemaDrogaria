import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "info" | "ghost";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  variant?: ButtonVariant;
  compact?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-pharma-600 bg-pharma-600 text-white hover:bg-pharma-700 focus:ring-pharma-200",
  secondary: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200",
  danger: "border-red-600 bg-red-600 text-white hover:bg-red-700 focus:ring-red-200",
  info: "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200",
  ghost:
    "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200",
};

export function ActionButton({
  icon: Icon,
  variant = "secondary",
  compact = false,
  className = "",
  children,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
        compact ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
      {children}
    </button>
  );
}
