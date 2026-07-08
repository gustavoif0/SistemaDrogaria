import { Banknote, CheckCircle2, CreditCard, ReceiptText, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionButton } from "../../components/ui/ActionButton";
import { BadgeStatus } from "../../components/ui/BadgeStatus";
import { DataTable } from "../../components/ui/DataTable";
import { FormField, inputClassName } from "../../components/ui/FormField";
import { PageHeader } from "../../components/ui/PageHeader";
import { formatCurrency, formatDateTime, percent } from "../../lib/format";
import { usePharma } from "../../store/PharmaContext";
import type { PaymentMethod } from "../../types/domain";

const paymentMethods: PaymentMethod[] = [
  "Dinheiro",
  "Pix mockado",
  "Credito",
  "Debito",
  "Crediario",
  "Convenio/PBM mockado",
];

export function PdvPage() {
  const { preSales, finalizeSale, sales } = usePharma();
  const pendingPreSales = preSales.filter((preSale) => preSale.status === "sent_to_cashier");
  const [selectedId, setSelectedId] = useState(pendingPreSales[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Dinheiro");
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const selectedPreSale = useMemo(
    () => pendingPreSales.find((preSale) => preSale.id === selectedId) ?? pendingPreSales[0],
    [pendingPreSales, selectedId],
  );

  function recoverPreSale(id: string) {
    setSelectedId(id);
    setMessage(null);
  }

  function finishSale() {
    if (!selectedPreSale) {
      setMessage({ tone: "danger", text: "Nenhuma pre-venda pendente para finalizar." });
      return;
    }

    const result = finalizeSale(selectedPreSale.id, paymentMethod);

    if (!result.ok) {
      setMessage({ tone: "danger", text: result.message });
      return;
    }

    setMessage({
      tone: "success",
      text: `Venda ${result.sale.number} finalizada. Estoque e financeiro atualizados.`,
    });
    setSelectedId("");
  }

  return (
    <section>
      <PageHeader
        eyebrow="Frente de caixa"
        title="PDV / Caixa"
        description="Recupera pre-venda, escolhe pagamento, finaliza venda, baixa estoque e gera financeiro mockado."
        actions={
          <ActionButton icon={RefreshCcw} onClick={() => setSelectedId(pendingPreSales[0]?.id ?? "")}>
            Atualizar fila
          </ActionButton>
        }
      />

      <div className="grid gap-6 p-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Fila do caixa</h2>
                <p className="text-sm text-slate-500">Pre-vendas enviadas pelo balcao.</p>
              </div>
              <BadgeStatus tone={pendingPreSales.length ? "warning" : "neutral"}>
                {pendingPreSales.length} pendentes
              </BadgeStatus>
            </div>
            <DataTable
              data={pendingPreSales}
              getRowKey={(preSale) => preSale.id}
              emptyMessage="Nenhuma pre-venda pendente. Envie uma pelo Balcao."
              columns={[
                { header: "Pre-venda", render: (preSale) => <span className="font-semibold">{preSale.number}</span> },
                { header: "Cliente", render: (preSale) => preSale.customerName },
                { header: "Total", align: "right", render: (preSale) => formatCurrency(preSale.total) },
                {
                  header: "Acao",
                  align: "center",
                  render: (preSale) => (
                    <ActionButton
                      compact
                      data-testid={`pdv-recover-${preSale.id}`}
                      variant={selectedPreSale?.id === preSale.id ? "primary" : "secondary"}
                      onClick={() => recoverPreSale(preSale.id)}
                    >
                      Recuperar
                    </ActionButton>
                  ),
                },
              ]}
            />
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-pharma-600" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-slate-900">Ultimas vendas</h2>
            </div>
            <div className="space-y-2">
              {sales.slice(0, 4).map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{sale.number}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(sale.createdAt)}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(sale.total)}</p>
                </div>
              ))}
              {!sales.length ? <p className="text-sm text-slate-500">Sem vendas finalizadas ainda.</p> : null}
            </div>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          {selectedPreSale ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-pharma-700">Pre-venda recuperada</p>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedPreSale.number}</h2>
                  <p className="text-sm text-slate-500">
                    Cliente {selectedPreSale.customerName} | Atendente {selectedPreSale.attendant}
                  </p>
                </div>
                <BadgeStatus tone="info">Aguardando pagamento</BadgeStatus>
              </div>

              <DataTable
                data={selectedPreSale.items}
                getRowKey={(item) => item.id}
                columns={[
                  {
                    header: "Item",
                    render: (item) => (
                      <div>
                        <p className="font-semibold text-slate-900">{item.productName}</p>
                        <p className="text-xs text-slate-500">
                          {item.internalCode} {item.batchCode ? `| lote ${item.batchCode}` : ""}
                        </p>
                      </div>
                    ),
                  },
                  { header: "Qtd", align: "right", render: (item) => `${item.quantity} ${item.unit}` },
                  { header: "Desc.", align: "right", render: (item) => percent(item.discountPercent) },
                  { header: "Total", align: "right", render: (item) => formatCurrency(item.total) },
                ]}
              />

              <div className="grid gap-4 md:grid-cols-[0.75fr_1fr]">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <FormField label="Forma de pagamento">
                    <select
                      className={inputClassName}
                      data-testid="pdv-payment-method"
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                    >
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <CreditCard className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    NFC-e, Pix e PBM sao simulados nesta versao.
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-950 p-4 text-white">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <span className="text-slate-300">Subtotal</span>
                    <span className="text-right">{formatCurrency(selectedPreSale.subtotal)}</span>
                    <span className="text-slate-300">Descontos</span>
                    <span className="text-right text-red-200">{formatCurrency(selectedPreSale.discountTotal)}</span>
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-right text-2xl font-semibold text-emerald-200">
                      {formatCurrency(selectedPreSale.total)}
                    </span>
                  </div>
                  <ActionButton
                    className="mt-5 w-full"
                    data-testid="pdv-finish-sale"
                    icon={Banknote}
                    variant="primary"
                    onClick={finishSale}
                  >
                    Finalizar venda
                  </ActionButton>
                </div>
              </div>

              {message ? (
                <div
                  className={[
                    "flex items-start gap-2 rounded-md border p-3 text-sm",
                    message.tone === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-800",
                  ].join(" ")}
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {message.text}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <ReceiptText className="h-10 w-10 text-slate-400" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold text-slate-900">Nenhuma pre-venda selecionada</h2>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Envie uma pre-venda pelo Balcao e recupere aqui para concluir o fluxo principal.
              </p>
              {message ? <p className="mt-4 text-sm font-semibold text-emerald-700">{message.text}</p> : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
