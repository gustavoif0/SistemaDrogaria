import { AlertTriangle, CheckCircle2, Search, Send, ShoppingBasket, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionButton } from "../../components/ui/ActionButton";
import { BadgeStatus } from "../../components/ui/BadgeStatus";
import { DataTable } from "../../components/ui/DataTable";
import { FormField, inputClassName } from "../../components/ui/FormField";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { formatCurrency, percent } from "../../lib/format";
import { calculateItemTotal, getBatchStatus, getPreferredBatch, validateSaleItem } from "../../lib/salesRules";
import { usePharma } from "../../store/PharmaContext";
import type { PreSaleItem, Product } from "../../types/domain";

export function CounterPage() {
  const { products, sendPreSaleToCashier } = usePharma();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [discount, setDiscount] = useState("0");
  const [batchId, setBatchId] = useState("");
  const [prescriptionInformed, setPrescriptionInformed] = useState(false);
  const [customerName, setCustomerName] = useState("Consumidor final");
  const [cart, setCart] = useState<PreSaleItem[]>([]);
  const [message, setMessage] = useState<{ tone: "success" | "warning" | "danger"; text: string } | null>(null);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products.slice(0, 8);

    return products.filter((product) =>
      [product.name, product.internalCode, product.barcode, product.reference, product.category, product.subcategory]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [products, query]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    return { subtotal, discountTotal: subtotal - total, total };
  }, [cart]);

  function selectProduct(product: Product) {
    const preferredBatch = getPreferredBatch(product);
    setSelectedProduct(product);
    setBatchId(preferredBatch?.id ?? "");
    setQuantity(product.allowFractional ? "1" : "1");
    setDiscount("0");
    setPrescriptionInformed(false);
    setMessage(null);
    setSearchOpen(false);
  }

  function addItem() {
    if (!selectedProduct) {
      setMessage({ tone: "warning", text: "Pesquise e selecione um produto." });
      return;
    }

    const parsedQuantity = Number(quantity);
    const parsedDiscount = Number(discount);
    const validation = validateSaleItem(
      selectedProduct,
      parsedQuantity,
      parsedDiscount,
      batchId || undefined,
      prescriptionInformed,
    );

    if (!validation.valid) {
      setMessage({ tone: "danger", text: validation.message });
      return;
    }

    const batch = selectedProduct.batches.find((item) => item.id === batchId);
    const total = calculateItemTotal(parsedQuantity, selectedProduct.salePrice, parsedDiscount);
    const item: PreSaleItem = {
      id: `${selectedProduct.id}-${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      internalCode: selectedProduct.internalCode,
      quantity: parsedQuantity,
      unit: selectedProduct.unit,
      unitPrice: selectedProduct.salePrice,
      discountPercent: parsedDiscount,
      total,
      batchId: batch?.id,
      batchCode: batch?.code,
      prescriptionInformed,
    };

    setCart((current) => [...current, item]);
    setMessage({
      tone: batch && getBatchStatus(batch) === "near_expiry" ? "warning" : "success",
      text:
        batch && getBatchStatus(batch) === "near_expiry"
          ? "Item adicionado. Atencao: lote proximo do vencimento."
          : "Item adicionado a pre-venda.",
    });
    setSelectedProduct(null);
    setBatchId("");
    setPrescriptionInformed(false);
  }

  function removeItem(itemId: string) {
    setCart((current) => current.filter((item) => item.id !== itemId));
  }

  function sendToCashier() {
    if (!cart.length) {
      setMessage({ tone: "warning", text: "Adicione ao menos um item antes de enviar ao caixa." });
      return;
    }

    const preSale = sendPreSaleToCashier(customerName, cart);
    setCart([]);
    setCustomerName("Consumidor final");
    setMessage({ tone: "success", text: `Pre-venda ${preSale.number} enviada para o PDV.` });
  }

  return (
    <section>
      <PageHeader
        eyebrow="Operacao"
        title="Atendimento ao Balcao"
        description="Pesquisa de produto, validacao de estoque, desconto maximo, lote e envio da pre-venda ao caixa."
        actions={
          <ActionButton
            data-testid="counter-open-product-search"
            icon={Search}
            variant="info"
            onClick={() => setSearchOpen(true)}
          >
            Pesquisar produto
          </ActionButton>
        }
      />

      <div className="grid gap-6 p-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingBasket className="h-5 w-5 text-pharma-600" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-slate-900">Item da pre-venda</h2>
            </div>
            <div className="space-y-4">
              <FormField label="Cliente">
                <input
                  className={inputClassName}
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                />
              </FormField>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                {selectedProduct ? (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{selectedProduct.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {selectedProduct.internalCode} | Estoque {selectedProduct.stock} {selectedProduct.unit}
                        </p>
                      </div>
                      <BadgeStatus tone={selectedProduct.controlledMedicine ? "warning" : "success"}>
                        {selectedProduct.controlledMedicine ? "SNGPC" : "Liberado"}
                      </BadgeStatus>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <FormField label="Quantidade">
                        <input
                          className={inputClassName}
                          min="0"
                          step={selectedProduct.allowFractional ? "0.001" : "1"}
                          type="number"
                          value={quantity}
                          data-testid="counter-quantity"
                          onChange={(event) => setQuantity(event.target.value)}
                        />
                      </FormField>
                      <FormField label={`Desconto max. ${percent(selectedProduct.maxDiscountPercent)}`}>
                        <input
                          className={inputClassName}
                          min="0"
                          max="100"
                          step="0.5"
                          type="number"
                          value={discount}
                          data-testid="counter-discount"
                          onChange={(event) => setDiscount(event.target.value)}
                        />
                      </FormField>
                      <FormField label="Preco">
                        <input className={inputClassName} readOnly value={formatCurrency(selectedProduct.salePrice)} />
                      </FormField>
                    </div>

                    {selectedProduct.controlsBatch ? (
                      <div className="mt-3">
                        <FormField label="Lote">
                          <select
                            className={inputClassName}
                            value={batchId}
                            onChange={(event) => setBatchId(event.target.value)}
                          >
                            <option value="">Selecione</option>
                            {selectedProduct.batches.map((batch) => (
                              <option key={batch.id} value={batch.id}>
                                {batch.code} - saldo {batch.quantity} - validade {batch.expiryDate}
                              </option>
                            ))}
                          </select>
                        </FormField>
                      </div>
                    ) : null}

                    {selectedProduct.controlledMedicine ? (
                      <label className="mt-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
                        <input
                          type="checkbox"
                          checked={prescriptionInformed}
                          onChange={(event) => setPrescriptionInformed(event.target.checked)}
                        />
                        Receita informada para controle SNGPC mockado
                      </label>
                    ) : null}

                    <div className="mt-4 flex justify-end">
                      <ActionButton
                        data-testid="counter-add-item"
                        icon={CheckCircle2}
                        variant="primary"
                        onClick={addItem}
                      >
                        Adicionar item
                      </ActionButton>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Search className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">Nenhum produto selecionado</p>
                    <p className="mt-1 text-sm text-slate-500">Use a pesquisa para adicionar itens.</p>
                  </div>
                )}
              </div>

              {message ? (
                <div
                  className={[
                    "flex items-start gap-2 rounded-md border p-3 text-sm",
                    message.tone === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : message.tone === "warning"
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-red-200 bg-red-50 text-red-800",
                  ].join(" ")}
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {message.text}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Carrinho da pre-venda</h2>
                <p className="text-sm text-slate-500">Itens ainda nao baixam estoque ate finalizar no PDV.</p>
              </div>
              <BadgeStatus tone={cart.length ? "info" : "neutral"}>{cart.length} itens</BadgeStatus>
            </div>
            <DataTable
              data={cart}
              getRowKey={(item) => item.id}
              emptyMessage="Carrinho vazio."
              columns={[
                {
                  header: "Produto",
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
                {
                  header: "",
                  align: "center",
                  render: (item) => (
                    <ActionButton
                      aria-label="Remover item"
                      compact
                      icon={Trash2}
                      onClick={() => removeItem(item.id)}
                      variant="ghost"
                    />
                  ),
                },
              ]}
            />
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">Subtotal</p>
                <p className="text-lg font-semibold text-slate-900">{formatCurrency(totals.subtotal)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Descontos</p>
                <p className="text-lg font-semibold text-red-600">{formatCurrency(totals.discountTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-2xl font-semibold text-pharma-700">{formatCurrency(totals.total)}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <ActionButton
                data-testid="counter-send-to-cashier"
                icon={Send}
                variant="primary"
                onClick={sendToCashier}
                disabled={!cart.length}
              >
                Enviar para o caixa
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Pesquisa de produto"
        description="Busca por nome, codigo interno, codigo de barras, referencia ou categoria."
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        wide
      >
        <div className="space-y-4">
          <input
            autoFocus
            className={inputClassName}
            placeholder="Digite parte do nome, codigo ou barras"
            value={query}
            data-testid="counter-product-search-input"
            onChange={(event) => setQuery(event.target.value)}
          />
          <DataTable
            data={filteredProducts}
            getRowKey={(product) => product.id}
            columns={[
              {
                header: "Produto",
                render: (product) => (
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">
                      {product.internalCode} | {product.barcode}
                    </p>
                  </div>
                ),
              },
              { header: "Estoque", align: "right", render: (product) => `${product.stock} ${product.unit}` },
              { header: "Preco", align: "right", render: (product) => formatCurrency(product.salePrice) },
              {
                header: "Status",
                render: (product) =>
                  product.stock <= product.minStock ? (
                    <BadgeStatus tone="warning">Baixo</BadgeStatus>
                  ) : (
                    <BadgeStatus tone="success">OK</BadgeStatus>
                  ),
              },
              {
                header: "Acao",
                align: "center",
                render: (product) => (
                  <ActionButton
                    compact
                    data-testid={`counter-select-product-${product.id}`}
                    variant="primary"
                    onClick={() => selectProduct(product)}
                  >
                    Selecionar
                  </ActionButton>
                ),
              },
            ]}
          />
        </div>
      </Modal>
    </section>
  );
}
