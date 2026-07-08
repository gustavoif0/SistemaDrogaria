import type { LucideIcon } from "lucide-react";
import { Boxes, FileCog, FileText, GitBranch } from "lucide-react";
import { BadgeStatus } from "../../components/ui/BadgeStatus";
import { PageHeader } from "../../components/ui/PageHeader";

const icons: Record<string, LucideIcon> = {
  fiscal: FileCog,
  pbm: FileText,
  integracoes: GitBranch,
  multiempresa: Boxes,
};

interface ModulePlaceholderProps {
  moduleId: "fiscal" | "pbm" | "integracoes" | "multiempresa";
  title: string;
  description: string;
}

export function ModulePlaceholder({ moduleId, title, description }: ModulePlaceholderProps) {
  const Icon = icons[moduleId];

  return (
    <section>
      <PageHeader eyebrow="Modulo planejado" title={title} description={description} />
      <div className="p-6">
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 shadow-sm">
          <Icon className="h-7 w-7 text-pharma-600" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Fluxo academico/mockado</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Esta rota preserva a navegacao do prototipo e sera detalhada apos o fluxo principal de produto,
            balcao, PDV, estoque e financeiro.
          </p>
          <div className="mt-4">
            <BadgeStatus tone="warning">Sem integracao real no MVP</BadgeStatus>
          </div>
        </div>
      </div>
    </section>
  );
}
