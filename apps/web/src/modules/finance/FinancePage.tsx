import { Banknote, Clock3, Landmark, TrendingUp } from "lucide-react";
import { BadgeStatus } from "../../components/ui/BadgeStatus";
import { DataTable } from "../../components/ui/DataTable";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { usePharma } from "../../store/PharmaContext";

export function FinancePage() {
  const { financeMovements, sales } = usePharma();
  const settled = financeMovements
    .filter((movement) => movement.status === "settled")
    .reduce((sum, movement) => sum + movement.amount, 0);
  const pending = financeMovements
    .filter((movement) => movement.status === "pending")
    .reduce((sum, movement) => sum + movement.amount, 0);

  return (
    <section>
      <PageHeader
        eyebrow="Gestao"
        title="Financeiro"
        description="Movimentos financeiros gerados automaticamente ao finalizar vendas no PDV."
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Recebido" value={formatCurrency(settled)} detail="Pagamentos liquidados" icon={Banknote} />
          <StatCard label="Pendente" value={formatCurrency(pending)} detail="Crediario e contas a receber" icon={Clock3} tone="amber" />
          <StatCard label="Ticket medio" value={formatCurrency(sales.length ? settled / sales.length : 0)} detail="Com base nas vendas do MVP" icon={TrendingUp} tone="blue" />
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-pharma-600" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-900">Movimentos de caixa</h2>
          </div>
          <DataTable
            data={financeMovements}
            getRowKey={(movement) => movement.id}
            emptyMessage="Finalize uma venda para gerar movimento financeiro."
            columns={[
              { header: "Descricao", render: (movement) => movement.description },
              { header: "Pagamento", render: (movement) => movement.paymentMethod },
              {
                header: "Status",
                render: (movement) => (
                  <BadgeStatus tone={movement.status === "settled" ? "success" : "warning"}>
                    {movement.status === "settled" ? "Liquidado" : "Pendente"}
                  </BadgeStatus>
                ),
              },
              { header: "Valor", align: "right", render: (movement) => formatCurrency(movement.amount) },
              { header: "Data", render: (movement) => formatDateTime(movement.createdAt) },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
