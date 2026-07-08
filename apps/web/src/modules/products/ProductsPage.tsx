import { Eye, PackagePlus, Plus, Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { ActionButton } from "../../components/ui/ActionButton";
import { BadgeStatus } from "../../components/ui/BadgeStatus";
import { DataTable } from "../../components/ui/DataTable";
import { FormField, inputClassName } from "../../components/ui/FormField";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Tabs } from "../../components/ui/Tabs";
import { formatCurrency, percent } from "../../lib/format";
import { usePharma } from "../../store/PharmaContext";
import type { Product } from "../../types/domain";

interface ProductFormState {
  name: string;
  barcode: string;
  category: string;
  manufacturer: string;
  supplier: string;
  salePrice: string;
  cost: string;
  stock: string;
  minStock: string;
  maxDiscountPercent: string;
  controlsBatch: boolean;
  controlsExpiry: boolean;
  allowFractional: boolean;
  controlledMedicine: boolean;
}

const emptyForm: ProductFormState = {
  name: "",
  barcode: "",
  category: "Medicamentos",
  manufacturer: "",
  supplier: "",
  salePrice: "",
  cost: "",
  stock: "",
  minStock: "",
  maxDiscountPercent: "10",
  controlsBatch: true,
  controlsExpiry: true,
  allowFractional: false,
  controlledMedicine: false,
};

export function ProductsPage() {
  const { products, addProduct } = usePharma();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [activeTab, setActiveTab] = useState("cadastro");

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
      [product.name, product.internalCode, product.barcode, product.reference, product.category]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [products, query]);

  function updateForm<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    addProduct({
      name: form.name,
      barcode: form.barcode,
      category: form.category,
      manufacturer: form.manufacturer,
      supplier: form.supplier,
      salePrice: Number(form.salePrice),
      cost: Number(form.cost),
      stock: Number(form.stock),
      minStock: Number(form.minStock),
      maxDiscountPercent: Number(form.maxDiscountPercent),
      controlsBatch: form.controlsBatch,
      controlsExpiry: form.controlsExpiry,
      allowFractional: form.allowFractional,
      controlledMedicine: form.controlledMedicine,
    });

    setForm(emptyForm);
    setFormOpen(false);
  }

  return (
    <section>
      <PageHeader
        eyebrow="Cadastros"
        title="Cadastro de Produtos"
        description="Produtos farmaceuticos com estoque, lote, vencimento, desconto e dados fiscais mockados."
        actions={
          <ActionButton icon={Plus} variant="primary" onClick={() => setFormOpen(true)}>
            Novo produto
          </ActionButton>
        }
      />

      <div className="space-y-5 p-6">
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <input
              className={inputClassName}
              placeholder="Pesquisar por nome, codigo, barras, referencia ou categoria"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <PackagePlus className="h-4 w-4 text-pharma-600" aria-hidden="true" />
              {filteredProducts.length} produtos encontrados
            </div>
          </div>
        </div>

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
            { header: "Categoria", render: (product) => product.category },
            { header: "Fabricante", render: (product) => product.manufacturer },
            {
              header: "Status",
              render: (product) => (
                <div className="flex flex-wrap gap-1">
                  <BadgeStatus tone={product.status === "active" ? "success" : "neutral"}>
                    {product.status === "active" ? "Ativo" : "Inativo"}
                  </BadgeStatus>
                  {product.controlledMedicine ? <BadgeStatus tone="warning">SNGPC</BadgeStatus> : null}
                </div>
              ),
            },
            { header: "Estoque", align: "right", render: (product) => `${product.stock} ${product.unit}` },
            { header: "Preco", align: "right", render: (product) => formatCurrency(product.salePrice) },
            {
              header: "Desc.",
              align: "right",
              render: (product) => (product.allowDiscount ? percent(product.maxDiscountPercent) : "Bloq."),
            },
            {
              header: "Acao",
              align: "center",
              render: (product) => (
                <ActionButton compact icon={Eye} onClick={() => setDetailProduct(product)} variant="ghost">
                  Ver
                </ActionButton>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title="Novo produto"
        description="Cadastro simplificado para a primeira versao funcional."
        open={formOpen}
        onClose={() => setFormOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={() => setFormOpen(false)}>Cancelar</ActionButton>
            <ActionButton form="product-form" type="submit" icon={Save} variant="primary">
              Salvar produto
            </ActionButton>
          </div>
        }
      >
        <form id="product-form" className="space-y-5" onSubmit={handleSubmit}>
          <Tabs
            activeId={activeTab}
            onChange={setActiveTab}
            items={[
              {
                id: "cadastro",
                label: "Cadastro",
                content: (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Nome do produto">
                      <input
                        required
                        className={inputClassName}
                        value={form.name}
                        onChange={(event) => updateForm("name", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Codigo de barras">
                      <input
                        required
                        className={inputClassName}
                        value={form.barcode}
                        onChange={(event) => updateForm("barcode", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Categoria">
                      <input
                        required
                        className={inputClassName}
                        value={form.category}
                        onChange={(event) => updateForm("category", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Fabricante">
                      <input
                        required
                        className={inputClassName}
                        value={form.manufacturer}
                        onChange={(event) => updateForm("manufacturer", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Fornecedor">
                      <input
                        required
                        className={inputClassName}
                        value={form.supplier}
                        onChange={(event) => updateForm("supplier", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Preco de venda">
                      <input
                        required
                        min="0"
                        step="0.01"
                        type="number"
                        className={inputClassName}
                        value={form.salePrice}
                        onChange={(event) => updateForm("salePrice", event.target.value)}
                      />
                    </FormField>
                  </div>
                ),
              },
              {
                id: "estoque",
                label: "Estoque",
                content: (
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField label="Custo">
                      <input
                        required
                        min="0"
                        step="0.01"
                        type="number"
                        className={inputClassName}
                        value={form.cost}
                        onChange={(event) => updateForm("cost", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Estoque atual">
                      <input
                        required
                        min="0"
                        step="1"
                        type="number"
                        className={inputClassName}
                        value={form.stock}
                        onChange={(event) => updateForm("stock", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Estoque minimo">
                      <input
                        required
                        min="0"
                        step="1"
                        type="number"
                        className={inputClassName}
                        value={form.minStock}
                        onChange={(event) => updateForm("minStock", event.target.value)}
                      />
                    </FormField>
                    {[
                      ["controlsBatch", "Controla lote"],
                      ["controlsExpiry", "Controla vencimento"],
                      ["allowFractional", "Venda fracionada"],
                      ["controlledMedicine", "Controlado SNGPC"],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={Boolean(form[key as keyof ProductFormState])}
                          onChange={(event) =>
                            updateForm(key as keyof ProductFormState, event.target.checked as never)
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                ),
              },
              {
                id: "comercial",
                label: "Comercial",
                content: (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Desconto maximo (%)">
                      <input
                        required
                        min="0"
                        max="100"
                        step="0.5"
                        type="number"
                        className={inputClassName}
                        value={form.maxDiscountPercent}
                        onChange={(event) => updateForm("maxDiscountPercent", event.target.value)}
                      />
                    </FormField>
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      Produtos SNGPC exigem receita no fluxo do balcao. Integracao real fica fora do MVP.
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </form>
      </Modal>

      <Modal
        title="Ficha do produto"
        open={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        wide
      >
        {detailProduct ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-pharma-700">{detailProduct.internalCode}</p>
                <h2 className="text-xl font-semibold text-slate-900">{detailProduct.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{detailProduct.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Categoria", detailProduct.category],
                  ["Fabricante", detailProduct.manufacturer],
                  ["Fornecedor", detailProduct.supplier],
                  ["Registro MS", detailProduct.msRegistration],
                  ["NCM", detailProduct.ncm],
                  ["CEST", detailProduct.cest],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-md border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Preco de venda</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {formatCurrency(detailProduct.salePrice)}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Lotes</p>
                <div className="mt-3 space-y-2">
                  {detailProduct.batches.length ? (
                    detailProduct.batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"
                      >
                        <span>{batch.code}</span>
                        <span className="font-semibold">{batch.quantity} un.</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Produto sem controle de lote no mock.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
