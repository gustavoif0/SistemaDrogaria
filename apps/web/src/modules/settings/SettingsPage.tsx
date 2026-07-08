import { Building2, Database, KeyRound, Settings } from "lucide-react";
import { BadgeStatus } from "../../components/ui/BadgeStatus";
import { PageHeader } from "../../components/ui/PageHeader";

const cards = [
  {
    title: "Empresa e filial",
    description: "Dados cadastrais, parametros comerciais e multiempresa.",
    icon: Building2,
  },
  {
    title: "Permissoes",
    description: "Perfis de acesso para atendente, caixa, gerente e farmaceutico.",
    icon: KeyRound,
  },
  {
    title: "Banco e API",
    description: "Estrutura preparada para PostgreSQL, Prisma e API REST futura.",
    icon: Database,
  },
];

export function SettingsPage() {
  return (
    <section>
      <PageHeader
        eyebrow="Sistema"
        title="Configuracoes"
        description="Parametros do ERP, permissoes, multiempresa e evolucao para backend."
      />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <card.icon className="h-5 w-5 text-pharma-600" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{card.description}</p>
            <div className="mt-4">
              <BadgeStatus tone="info">Planejado</BadgeStatus>
            </div>
          </div>
        ))}
        <div className="rounded-md border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <Settings className="h-5 w-5 text-pharma-100" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold">Mocks regulados</h2>
          <p className="mt-1 text-sm text-slate-300">
            Fiscal, SNGPC, Farmacia Popular e PBM ficam simulados ate homologacao tecnica.
          </p>
        </div>
      </div>
    </section>
  );
}
