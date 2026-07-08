import { AlertTriangle, PackagePlus, Pencil, Plus, Save, XCircle } from "lucide-react";
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
  subcategory: string;
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

interface ProductChange {
  key: keyof ProductFormState;
  label: string;
  before: string;
  after: string;
}

type ConfirmDialogMode = "cancel" | "save" | null;

const emptyForm: ProductFormState = {
  name: "",
  barcode: "",
  category: "Medicamentos",
  subcategory: "Analgesicos",
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

const fieldLabels: Record<keyof ProductFormState, string> = {
  name: "Nome do produto",
  barcode: "Codigo de barras",
  category: "Categoria",
  subcategory: "Subcategoria",
  manufacturer: "Fabricante",
  supplier: "Fornecedor",
  salePrice: "Preco de venda",
  cost: "Custo",
  stock: "Estoque atual",
  minStock: "Estoque minimo",
  maxDiscountPercent: "Desconto maximo",
  controlsBatch: "Controla lote",
  controlsExpiry: "Controla vencimento",
  allowFractional: "Venda fracionada",
  controlledMedicine: "Controlado SNGPC",
};

function boolText(value: boolean) {
  return value ? "Sim" : "Nao";
}

function numberText(value: number) {
  return Number.isFinite(value) ? String(value) : "";
}

function productToForm(product: Product): ProductFormState {
  return {
    name: product.name,
    barcode: product.barcode,
    category: product.category,
    subcategory: product.subcategory,
    manufacturer: product.manufacturer,
    supplier: product.supplier,
    salePrice: numberText(product.salePrice),
    cost: numberText(product.cost),
    stock: numberText(product.stock),
    minStock: numberText(product.minStock),
    maxDiscountPercent: numberText(product.maxDiscountPercent),
    controlsBatch: product.controlsBatch,
    controlsExpiry: product.controlsExpiry,
    allowFractional: product.allowFractional,
    controlledMedicine: product.controlledMedicine,
  };
}

function formToProductChanges(form: ProductFormState): Partial<Product> {
  return {
    name: form.name.trim(),
    barcode: form.barcode.trim(),
    category: form.category.trim(),
    subcategory: form.subcategory.trim(),
    manufacturer: form.manufacturer.trim(),
    supplier: form.supplier.trim(),
    salePrice: Number(form.salePrice),
    cost: Number(form.cost),
    stock: Number(form.stock),
    minStock: Number(form.minStock),
    maxDiscountPercent: Number(form.maxDiscountPercent),
    controlsBatch: form.controlsBatch,
    controlsExpiry: form.controlsExpiry,
    allowFractional: form.allowFractional,
    controlledMedicine: form.controlledMedicine,
  };
}

function getProductChanges(product: Product | null, form: ProductFormState): ProductChange[] {
  if (!product) return [];

  const stringComparisons: Array<{
    key: keyof ProductFormState;
    before: string;
    after: string;
  }> = [
    { key: "name", before: product.name, after: form.name.trim() },
    { key: "barcode", before: product.barcode, after: form.barcode.trim() },
    { key: "category", before: product.category, after: form.category.trim() },
    { key: "subcategory", before: product.subcategory, after: form.subcategory.trim() },
    { key: "manufacturer", before: product.manufacturer, after: form.manufacturer.trim() },
    { key: "supplier", before: product.supplier, after: form.supplier.trim() },
  ];

  const numericComparisons: Array<{
    key: keyof ProductFormState;
    before: number;
    after: number;
    format?: (value: number) => string;
  }> = [
    { key: "salePrice", before: product.salePrice, after: Number(form.salePrice), format: formatCurrency },
    { key: "cost", before: product.cost, after: Number(form.cost), format: formatCurrency },
    { key: "stock", before: product.stock, after: Number(form.stock) },
    { key: "minStock", before: product.minStock, after: Number(form.minStock) },
    {
      key: "maxDiscountPercent",
      before: product.maxDiscountPercent,
      after: Number(form.maxDiscountPercent),
      format: percent,
    },
  ];

  const booleanComparisons: Array<{
    key: keyof ProductFormState;
    before: boolean;
    after: boolean;
  }> = [
    { key: "controlsBatch", before: product.controlsBatch, after: form.controlsBatch },
    { key: "controlsExpiry", before: product.controlsExpiry, after: form.controlsExpiry },
    { key: "allowFractional", before: product.allowFractional, after: form.allowFractional },
    { key: "controlledMedicine", before: product.controlledMedicine, after: form.controlledMedicine },
  ];

  return [
    ...stringComparisons
      .filter((comparison) => comparison.before !== comparison.after)
      .map((comparison) => ({
        key: comparison.key,
        label: fieldLabels[comparison.key],
        before: comparison.before || "Vazio",
        after: comparison.after || "Vazio",
      })),
    ...numericComparisons
      .filter((comparison) => comparison.before !== comparison.after)
      .map((comparison) => ({
        key: comparison.key,
        label: fieldLabels[comparison.key],
        before: comparison.format ? comparison.format(comparison.before) : String(comparison.before),
        after: comparison.format ? comparison.format(comparison.after) : String(comparison.after),
      })),
    ...booleanComparisons
      .filter((comparison) => comparison.before !== comparison.after)
      .map((comparison) => ({
        key: comparison.key,
        label: fieldLabels[comparison.key],
        before: boolText(comparison.before),
        after: boolText(comparison.after),
      })),
  ];
}

export function ProductsPage() {
  const { products, categories, subcategories, addProduct, updateProduct } = usePharma();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editForm, setEditForm] = useState<ProductFormState>(emptyForm);
  const [activeTab, setActiveTab] = useState("cadastro");
  const [editActiveTab, setEditActiveTab] = useState("cadastro");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogMode>(null);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
      [product.name, product.internalCode, product.barcode, product.reference, product.category, product.subcategory]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [products, query]);

  const editChanges = useMemo(
    () => getProductChanges(editProduct, editForm),
    [editForm, editProduct],
  );
  const hasEditChanges = editChanges.length > 0;

  function updateForm<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateEditForm<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setEditForm((current) => ({ ...current, [key]: value }));
  }

  function getSubcategoriesForCategory(categoryName: string) {
    const category = categories.find((item) => item.name === categoryName);

    if (!category) return [];

    return subcategories.filter(
      (subcategory) => subcategory.categoryId === category.id && subcategory.status === "active",
    );
  }

  function updateFormCategory(categoryName: string) {
    const firstSubcategory = getSubcategoriesForCategory(categoryName)[0]?.name ?? "";
    setForm((current) => ({ ...current, category: categoryName, subcategory: firstSubcategory }));
  }

  function updateEditFormCategory(categoryName: string) {
    const firstSubcategory = getSubcategoriesForCategory(categoryName)[0]?.name ?? "";
    setEditForm((current) => ({ ...current, category: categoryName, subcategory: firstSubcategory }));
  }

  function openEdit(product: Product) {
    setEditProduct(product);
    setEditForm(productToForm(product));
    setEditActiveTab("cadastro");
    setConfirmDialog(null);
  }

  function closeEdit() {
    setEditProduct(null);
    setEditForm(emptyForm);
    setConfirmDialog(null);
  }

  function requestCloseEdit() {
    if (hasEditChanges) {
      setConfirmDialog("cancel");
      return;
    }

    closeEdit();
  }

  function requestSaveEdit() {
    if (hasEditChanges) {
      setConfirmDialog("save");
    }
  }

  function confirmSaveEdit() {
    if (!editProduct || !hasEditChanges) return;

    updateProduct(editProduct.id, formToProductChanges(editForm));
    closeEdit();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    addProduct({
      name: form.name,
      barcode: form.barcode,
      category: form.category,
      subcategory: form.subcategory,
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

  function renderChangeList() {
    return (
      <div className="space-y-2">
        {editChanges.map((change) => (
          <div key={change.key} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">{change.label}</p>
            <p className="mt-1 text-sm text-slate-600">
              <span className="text-slate-500">Antes:</span> {change.before}
            </p>
            <p className="text-sm text-slate-600">
              <span className="text-slate-500">Depois:</span> {change.after}
            </p>
          </div>
        ))}
      </div>
    );
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
            {
              header: "Classificacao",
              render: (product) => (
                <div>
                  <p className="font-medium text-slate-800">{product.category}</p>
                  <p className="text-xs text-slate-500">{product.subcategory}</p>
                </div>
              ),
            },
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
                <ActionButton
                  compact
                  data-testid={`products-edit-${product.id}`}
                  icon={Pencil}
                  onClick={() => openEdit(product)}
                  variant="ghost"
                >
                  Editar
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
                      <select
                        required
                        className={inputClassName}
                        value={form.category}
                        onChange={(event) => updateFormCategory(event.target.value)}
                      >
                        {categories
                          .filter((category) => category.status === "active")
                          .map((category) => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </FormField>
                    <FormField label="Subcategoria">
                      <select
                        required
                        className={inputClassName}
                        value={form.subcategory}
                        onChange={(event) => updateForm("subcategory", event.target.value)}
                      >
                        {getSubcategoriesForCategory(form.category).map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.name}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
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
        title="Editar produto"
        description={editProduct ? `${editProduct.internalCode} | ${editProduct.name}` : undefined}
        open={Boolean(editProduct)}
        onClose={requestCloseEdit}
        wide
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              {hasEditChanges
                ? `${editChanges.length} campo(s) alterado(s).`
                : "Nenhuma alteracao feita."}
            </div>
            <div className="flex justify-end gap-2">
              <ActionButton
                data-testid="product-edit-cancel"
                icon={XCircle}
                onClick={requestCloseEdit}
                variant="danger"
              >
                Sair / cancelar
              </ActionButton>
              <ActionButton
                data-testid="product-edit-save"
                disabled={!hasEditChanges}
                icon={Save}
                onClick={requestSaveEdit}
                variant={hasEditChanges ? "primary" : "secondary"}
              >
                Salvar alteracoes
              </ActionButton>
            </div>
          </div>
        }
      >
        {editProduct ? (
          <div className="space-y-5">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-pharma-700">
                    {editProduct.internalCode}
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">{editProduct.name}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <BadgeStatus tone={editProduct.status === "active" ? "success" : "neutral"}>
                    {editProduct.status === "active" ? "Ativo" : "Inativo"}
                  </BadgeStatus>
                  {editProduct.controlledMedicine ? <BadgeStatus tone="warning">SNGPC</BadgeStatus> : null}
                </div>
              </div>
            </div>

            <Tabs
              activeId={editActiveTab}
              onChange={setEditActiveTab}
              items={[
                {
                  id: "cadastro",
                  label: "Cadastro",
                  content: (
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField label="Nome do produto">
                        <input
                          className={inputClassName}
                          data-testid="product-edit-name"
                          value={editForm.name}
                          onChange={(event) => updateEditForm("name", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Codigo de barras">
                        <input
                          className={inputClassName}
                          value={editForm.barcode}
                          onChange={(event) => updateEditForm("barcode", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Categoria">
                        <select
                          className={inputClassName}
                          value={editForm.category}
                          onChange={(event) => updateEditFormCategory(event.target.value)}
                        >
                          {categories
                            .filter((category) => category.status === "active")
                            .map((category) => (
                              <option key={category.id} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                        </select>
                      </FormField>
                      <FormField label="Subcategoria">
                        <select
                          className={inputClassName}
                          value={editForm.subcategory}
                          onChange={(event) => updateEditForm("subcategory", event.target.value)}
                        >
                          {getSubcategoriesForCategory(editForm.category).map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.name}>
                              {subcategory.name}
                            </option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="Fabricante">
                        <input
                          className={inputClassName}
                          value={editForm.manufacturer}
                          onChange={(event) => updateEditForm("manufacturer", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Fornecedor">
                        <input
                          className={inputClassName}
                          value={editForm.supplier}
                          onChange={(event) => updateEditForm("supplier", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Preco de venda">
                        <input
                          min="0"
                          step="0.01"
                          type="number"
                          className={inputClassName}
                          value={editForm.salePrice}
                          onChange={(event) => updateEditForm("salePrice", event.target.value)}
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
                          min="0"
                          step="0.01"
                          type="number"
                          className={inputClassName}
                          value={editForm.cost}
                          onChange={(event) => updateEditForm("cost", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Estoque atual">
                        <input
                          min="0"
                          step="1"
                          type="number"
                          className={inputClassName}
                          value={editForm.stock}
                          onChange={(event) => updateEditForm("stock", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Estoque minimo">
                        <input
                          min="0"
                          step="1"
                          type="number"
                          className={inputClassName}
                          value={editForm.minStock}
                          onChange={(event) => updateEditForm("minStock", event.target.value)}
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
                            checked={Boolean(editForm[key as keyof ProductFormState])}
                            onChange={(event) =>
                              updateEditForm(key as keyof ProductFormState, event.target.checked as never)
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
                          min="0"
                          max="100"
                          step="0.5"
                          type="number"
                          className={inputClassName}
                          value={editForm.maxDiscountPercent}
                          onChange={(event) => updateEditForm("maxDiscountPercent", event.target.value)}
                        />
                      </FormField>
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                        Alteracoes em preco, desconto e estoque passam a valer imediatamente nos fluxos
                        mockados de Balcao e PDV.
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        ) : null}
      </Modal>

      <Modal
        title={confirmDialog === "save" ? "Confirmar salvamento" : "Cancelar edicao"}
        description={
          confirmDialog === "save"
            ? "Confira os campos alterados antes de salvar."
            : "Existem alteracoes nao salvas neste produto."
        }
        open={Boolean(confirmDialog)}
        onClose={() => setConfirmDialog(null)}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={() => setConfirmDialog(null)}>
              {confirmDialog === "save" ? "Voltar" : "Continuar editando"}
            </ActionButton>
            {confirmDialog === "save" ? (
              <ActionButton
                data-testid="product-edit-confirm-save"
                icon={Save}
                onClick={confirmSaveEdit}
                variant="primary"
              >
                Confirmar salvar
              </ActionButton>
            ) : (
              <ActionButton
                data-testid="product-edit-confirm-cancel"
                icon={XCircle}
                onClick={closeEdit}
                variant="danger"
              >
                Sair sem salvar
              </ActionButton>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <div
            className={[
              "flex items-start gap-3 rounded-md border p-3 text-sm",
              confirmDialog === "save"
                ? "border-pharma-100 bg-pharma-50 text-pharma-700"
                : "border-amber-200 bg-amber-50 text-amber-800",
            ].join(" ")}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {confirmDialog === "save"
              ? "Salvar aplicara as alteracoes abaixo no cadastro do produto."
              : "Ao sair agora, as alteracoes abaixo serao descartadas."}
          </div>
          {renderChangeList()}
        </div>
      </Modal>
    </section>
  );
}
