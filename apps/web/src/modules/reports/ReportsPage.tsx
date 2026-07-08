import { BarChart3, LineChart, PieChart } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { formatCurrency } from "../../lib/format";
import { usePharma } from "../../store/PharmaContext";

export function ReportsPage() {
  const { products, sales } = usePharma();
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const maxStock = Math.max(...products.map((product) => product.stock), 1);

  return (
    <section>
      <PageHeader
        eyebrow="BI"
        title="Relatorios / BI"
        description="Indicadores iniciais para demonstracao academica do ERP."
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Faturamento" value={formatCurrency(totalRevenue)} icon={LineChart} tone="green" detail="Vendas finalizadas no PDV" />
          <StatCard label="SKUs ativos" value={products.length} icon={PieChart} tone="blue" detail="Produtos cadastrados no MVP" />
          <StatCard label="Vendas" value={sales.length} icon={BarChart3} tone="amber" detail="Operacoes simuladas" />
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Estoque por produto</h2>
          <div className="mt-5 space-y-4">
            {products.map((product) => (
              <div key={product.id}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{product.name}</span>
                  <span className="text-slate-500">{product.stock} un.</span>
                </div>
                <div className="h-3 overflow-hidden rounded-md bg-slate-100">
                  <div
                    className="h-full rounded-md bg-pharma-600"
                    style={{ width: `${Math.max(6, (product.stock / maxStock) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
