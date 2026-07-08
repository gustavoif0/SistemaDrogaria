import { AlertTriangle, Banknote, Boxes, Clock3, ReceiptText, ShoppingCart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BadgeStatus } from "../../components/ui/BadgeStatus";
import { DataTable } from "../../components/ui/DataTable";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { usePharma } from "../../store/PharmaContext";

export function DashboardPage() {
  const { products, preSales, sales, financeMovements, stockAlerts } = usePharma();

  const pendingPreSales = preSales.filter((preSale) => preSale.status === "sent_to_cashier");
  const settledRevenue = financeMovements
    .filter((movement) => movement.kind === "income")
    .reduce((sum, movement) => sum + movement.amount, 0);
  const lowStockCount = products.filter((product) => product.stock <= product.minStock).length;
  const workflowCards: Array<[string, string, LucideIcon]> = [
    ["Produto", "Cadastro rico com preco, lote, fiscal e desconto maximo.", ReceiptText],
    ["Balcao", "Pesquisa, validacao de estoque e envio da pre-venda.", ShoppingCart],
    ["PDV", "Recupera pre-venda, finaliza venda e baixa estoque.", Banknote],
  ];

  return (
    <section>
      <PageHeader
        eyebrow="Visao geral"
        title="Dashboard"
        description="Indicadores simulados e derivados das operacoes feitas no MVP."
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Vendas finalizadas"
            value={sales.length}
            detail="Atualiza ao finalizar no PDV"
            icon={ShoppingCart}
            tone="green"
          />
          <StatCard
            label="Receita registrada"
            value={formatCurrency(settledRevenue)}
            detail="Movimentos financeiros mockados"
            icon={Banknote}
            tone="blue"
          />
          <StatCard
            label="Pre-vendas no caixa"
            value={pendingPreSales.length}
            detail="Aguardando recuperacao no PDV"
            icon={Clock3}
            tone="amber"
          />
          <StatCard
            label="Alertas de estoque"
            value={stockAlerts.length}
            detail={`${lowStockCount} produtos abaixo do minimo`}
            icon={AlertTriangle}
            tone="red"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Ultimas vendas</h2>
                <p className="text-sm text-slate-500">Fiscal e pagamentos em modo academico.</p>
              </div>
              <BadgeStatus tone="info">NFC-e mockada</BadgeStatus>
            </div>
            <DataTable
              data={sales.slice(0, 6)}
              getRowKey={(sale) => sale.id}
              emptyMessage="Finalize uma venda no PDV para alimentar o painel."
              columns={[
                { header: "Venda", render: (sale) => <span className="font-semibold">{sale.number}</span> },
                { header: "Cliente", render: (sale) => sale.customerName },
                { header: "Pagamento", render: (sale) => sale.paymentMethod },
                {
                  header: "Fiscal",
                  render: () => <BadgeStatus tone="success">Autorizada mock</BadgeStatus>,
                },
                { header: "Total", align: "right", render: (sale) => formatCurrency(sale.total) },
                { header: "Data", render: (sale) => formatDateTime(sale.createdAt) },
              ]}
            />
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Boxes className="h-5 w-5 text-pharma-600" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Alertas</h2>
                <p className="text-sm text-slate-500">Baixo estoque, vencidos e vencimento proximo.</p>
              </div>
            </div>
            <div className="space-y-3">
              {stockAlerts.slice(0, 7).map((alert) => (
                <div key={alert.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">{alert.productName}</p>
                    <BadgeStatus
                      tone={
                        alert.type === "low_stock"
                          ? "warning"
                          : alert.type === "expired"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {alert.type === "low_stock" ? "Estoque" : "Vencimento"}
                    </BadgeStatus>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {workflowCards.map(([title, description, Icon]) => (
            <div key={String(title)} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <Icon className="h-5 w-5 text-pharma-600" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
