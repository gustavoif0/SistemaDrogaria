import { ClipboardCheck, FileWarning, ShieldCheck } from "lucide-react";
import { BadgeStatus } from "../../components/ui/BadgeStatus";
import { DataTable } from "../../components/ui/DataTable";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { usePharma } from "../../store/PharmaContext";

export function SngpcPage() {
  const { products, sales } = usePharma();
  const controlledProducts = products.filter((product) => product.controlledMedicine);
  const controlledSales = sales.filter((sale) =>
    sale.items.some((item) => controlledProducts.some((product) => product.id === item.productId)),
  );

  return (
    <section>
      <PageHeader
        eyebrow="Controle especial"
        title="SNGPC / Medicamentos Controlados"
        description="Controle academico/mockado para produtos controlados, receitas e saidas de lote."
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Produtos controlados" value={controlledProducts.length} icon={ShieldCheck} detail="Marcados no cadastro" />
          <StatCard label="Saidas registradas" value={controlledSales.length} icon={ClipboardCheck} tone="blue" detail="Geradas pelo PDV" />
          <StatCard label="Pendencias mock" value="0" icon={FileWarning} tone="amber" detail="Sem transmissao real para Anvisa" />
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Produtos sujeitos ao controle</h2>
            <p className="text-sm text-slate-500">Venda exige receita informada no Balcao.</p>
          </div>
          <DataTable
            data={controlledProducts}
            getRowKey={(product) => product.id}
            columns={[
              { header: "Produto", render: (product) => <span className="font-semibold">{product.name}</span> },
              { header: "Principio ativo", render: (product) => product.activeIngredient },
              { header: "Registro MS", render: (product) => product.msRegistration },
              { header: "Estoque", align: "right", render: (product) => `${product.stock} ${product.unit}` },
              { header: "Status", render: () => <BadgeStatus tone="warning">Receita obrigatoria</BadgeStatus> },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
