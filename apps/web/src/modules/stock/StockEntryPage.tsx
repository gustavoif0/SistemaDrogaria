import { FileUp, Link2, PackageCheck } from "lucide-react";
import { ActionButton } from "../../components/ui/ActionButton";
import { BadgeStatus } from "../../components/ui/BadgeStatus";
import { DataTable } from "../../components/ui/DataTable";
import { PageHeader } from "../../components/ui/PageHeader";
import { formatCurrency, formatDate } from "../../lib/format";
import { usePharma } from "../../store/PharmaContext";

export function StockEntryPage() {
  const { stockEntryMock, products } = usePharma();

  return (
    <section>
      <PageHeader
        eyebrow="Estoque"
        title="Entrada de Estoque / XML"
        description="Importacao de NF-e em modo mockado, com associacao de produto, lote, vencimento e custo."
        actions={
          <ActionButton icon={FileUp} variant="primary">
            Carregar XML exemplo
          </ActionButton>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
            <p className="text-sm text-slate-500">Fornecedor</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{stockEntryMock.supplier}</p>
            <p className="mt-2 text-xs text-slate-500">{stockEntryMock.accessKey}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Emissao</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{formatDate(stockEntryMock.issueDate)}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total NF-e</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(stockEntryMock.total)}</p>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Itens da nota</h2>
              <p className="text-sm text-slate-500">Associacao simulada com cadastro interno.</p>
            </div>
            <BadgeStatus tone="warning">Pendente revisao</BadgeStatus>
          </div>
          <DataTable
            data={stockEntryMock.items}
            getRowKey={(item) => item.id}
            columns={[
              {
                header: "Item XML",
                render: (item) => (
                  <div>
                    <p className="font-semibold text-slate-900">{item.invoiceName}</p>
                    <p className="text-xs text-slate-500">Lote {item.batchCode}</p>
                  </div>
                ),
              },
              {
                header: "Produto interno",
                render: (item) => {
                  const product = products.find((entry) => entry.id === item.linkedProductId);
                  return (
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-pharma-600" aria-hidden="true" />
                      <span>{product?.name ?? "Nao associado"}</span>
                    </div>
                  );
                },
              },
              { header: "Qtd", align: "right", render: (item) => item.quantity },
              { header: "Custo", align: "right", render: (item) => formatCurrency(item.cost) },
              { header: "Vencimento", render: (item) => formatDate(item.expiryDate) },
            ]}
          />
        </div>

        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
          <div className="flex items-start gap-3">
            <PackageCheck className="h-5 w-5 text-pharma-600" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-slate-900">Proxima etapa</h2>
              <p className="mt-1 text-sm text-slate-500">
                Confirmar entrada devera atualizar saldo, custo medio, lote, validade e historico de movimentacao.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
