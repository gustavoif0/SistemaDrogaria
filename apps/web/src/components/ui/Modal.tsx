import type { ReactNode } from "react";
import { X } from "lucide-react";
import { ActionButton } from "./ActionButton";

interface ModalProps {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function Modal({ title, description, open, onClose, children, footer, wide }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div
        className={[
          "max-h-[92vh] w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft",
          wide ? "max-w-5xl" : "max-w-2xl",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <ActionButton aria-label="Fechar modal" compact icon={X} onClick={onClose} variant="ghost" />
        </div>
        <div className="max-h-[68vh] overflow-auto p-5 erp-scrollbar">{children}</div>
        {footer ? <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
