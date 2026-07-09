import { AlertTriangle, PackagePlus, Pencil, Plus, Save, XCircle } from "lucide-react";
import { useMemo, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { ActionButton } from "../../components/ui/ActionButton";
import { BadgeStatus } from "../../components/ui/BadgeStatus";
import { DataTable } from "../../components/ui/DataTable";
import { FormField, inputClassName } from "../../components/ui/FormField";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Tabs } from "../../components/ui/Tabs";
import { formatCurrency, percent } from "../../lib/format";
import { usePharma } from "../../store/PharmaContext";
import type { Product, ProductSaleCondition, ProductSaleConditionMode } from "../../types/domain";

interface SaleConditionFormState {
  id: string;
  salePrice: string;
  expectedProfitPercent: string;
  expectedProfit: string;
  quantity: string;
  mode: ProductSaleConditionMode;
}

interface ProductFormState {
  internalCode: string;
  name: string;
  barcode: string;
  activeIngredient: string;
  reference: string;
  content: string;
  category: string;
  subcategory: string;
  manufacturer: string;
  brand: string;
  supplier: string;
  ncm: string;
  ncmDescription: string;
  purchasePrice: string;
  salePrice: string;
  cost: string;
  expectedProfitPercent: string;
  expectedProfit: string;
  saleConditions: SaleConditionFormState[];
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
  internalCode: "",
  name: "",
  barcode: "",
  activeIngredient: "",
  reference: "",
  content: "",
  category: "Medicamentos",
  subcategory: "Analgesicos",
  manufacturer: "",
  brand: "",
  supplier: "Fornecedor a definir",
  ncm: "30049099",
  ncmDescription: "",
  purchasePrice: "",
  salePrice: "",
  cost: "",
  expectedProfitPercent: "100",
  expectedProfit: "",
  saleConditions: [],
  stock: "",
  minStock: "",
  maxDiscountPercent: "10",
  controlsBatch: true,
  controlsExpiry: true,
  allowFractional: false,
  controlledMedicine: false,
};

const fieldLabels: Record<keyof ProductFormState, string> = {
  internalCode: "Codigo interno",
  name: "Nome do produto",
  barcode: "Codigo de barras",
  activeIngredient: "Principio ativo + posologia",
  reference: "Referencia",
  content: "Conteudo",
  category: "Categoria",
  subcategory: "Subcategoria",
  manufacturer: "Fabricante",
  brand: "Marca",
  supplier: "Fornecedor",
  ncm: "NCM",
  ncmDescription: "Descricao do NCM",
  purchasePrice: "Preco de compra",
  salePrice: "Valor Venda 1",
  cost: "Preco de custo",
  expectedProfitPercent: "% lucro esperado",
  expectedProfit: "Lucro esperado",
  saleConditions: "Condicoes adicionais de venda",
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

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function numberInputText(value: string) {
  if (value.trim() === "") return "";

  return String(toNumber(value));
}

function decimalText(value: number) {
  if (!Number.isFinite(value)) return "";

  return String(Number(value.toFixed(2)));
}

function calculateExpectedProfitValue(cost: number, expectedProfitPercent: number) {
  return Number((cost * (expectedProfitPercent / 100)).toFixed(2));
}

function calculateSalePriceValue(cost: number, expectedProfit: number) {
  return Number((cost + expectedProfit).toFixed(2));
}

function calculateExpectedProfitPercent(cost: number, expectedProfit: number) {
  if (cost <= 0) return 0;

  return Number(((expectedProfit / cost) * 100).toFixed(2));
}

function makeSaleConditionId() {
  return `price-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function saleConditionModeLabel(mode: ProductSaleConditionMode) {
  return mode === "every_quantity" ? "a cada" : "a partir de";
}

function normalizeSaleConditions(conditions: SaleConditionFormState[]): ProductSaleCondition[] {
  return conditions.map((condition, index) => ({
    id: condition.id,
    label: `Valor Venda ${index + 2}`,
    salePrice: toNumber(condition.salePrice),
    expectedProfitPercent: toNumber(condition.expectedProfitPercent),
    expectedProfit: toNumber(condition.expectedProfit),
    quantity: Math.max(2, toNumber(condition.quantity)),
    mode: condition.mode,
  }));
}

function saleConditionsToText(conditions: ProductSaleCondition[]) {
  if (conditions.length === 0) return "Nenhuma";

  return conditions
    .map(
      (condition) =>
        `${condition.label}: ${formatCurrency(condition.salePrice)}, ${percent(
          condition.expectedProfitPercent,
        )}, lucro ${formatCurrency(condition.expectedProfit)} ${saleConditionModeLabel(
          condition.mode,
        )} ${condition.quantity} unidade(s)`,
    )
    .join("; ");
}

function MoneyInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
        R$
      </span>
      <input
        {...props}
        type="number"
        min="0"
        step="0.01"
        className={`${inputClassName.replace("px-3", "pl-10 pr-3")} ${className}`}
      />
    </div>
  );
}

function PercentInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <input
        {...props}
        type="number"
        min="0"
        step="0.01"
        className={`${inputClassName.replace("px-3", "pl-3 pr-10")} ${className}`}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
        %
      </span>
    </div>
  );
}

function productToForm(product: Product): ProductFormState {
  return {
    internalCode: product.internalCode,
    name: product.name,
    barcode: product.barcode,
    activeIngredient: product.activeIngredient,
    reference: product.reference,
    content: product.content,
    category: product.category,
    subcategory: product.subcategory,
    manufacturer: product.manufacturer,
    brand: product.brand,
    supplier: product.supplier,
    ncm: product.ncm,
    ncmDescription: product.ncmDescription,
    purchasePrice: numberText(product.purchasePrice),
    salePrice: numberText(product.salePrice),
    cost: numberText(product.cost),
    expectedProfitPercent: numberText(product.expectedProfitPercent),
    expectedProfit: numberText(product.expectedProfit),
    saleConditions: (product.saleConditions ?? []).map((condition) => ({
      id: condition.id,
      salePrice: numberText(condition.salePrice),
      expectedProfitPercent: numberText(
        condition.expectedProfitPercent ?? calculateExpectedProfitPercent(
          product.cost,
          Math.max(0, condition.salePrice - product.cost),
        ),
      ),
      expectedProfit: numberText(condition.expectedProfit ?? Math.max(0, condition.salePrice - product.cost)),
      quantity: numberText(condition.quantity),
      mode: condition.mode,
    })),
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
  const cost = toNumber(form.cost);
  const salePrice = toNumber(form.salePrice);
  const expectedProfitPercent = toNumber(form.expectedProfitPercent);
  const expectedProfit = toNumber(form.expectedProfit);

  return {
    internalCode: form.internalCode.trim(),
    name: form.name.trim(),
    barcode: form.barcode.trim(),
    activeIngredient: form.activeIngredient.trim(),
    reference: form.reference.trim(),
    content: form.content.trim(),
    presentation: form.content.trim(),
    category: form.category.trim(),
    subcategory: form.subcategory.trim(),
    manufacturer: form.manufacturer.trim(),
    brand: form.brand.trim(),
    supplier: form.supplier.trim(),
    ncm: form.ncm.trim(),
    ncmDescription: form.ncmDescription.trim(),
    purchasePrice: toNumber(form.purchasePrice),
    salePrice,
    cost,
    averageCost: cost,
    expectedProfitPercent,
    expectedProfit,
    saleConditions: normalizeSaleConditions(form.saleConditions),
    stock: toNumber(form.stock),
    minStock: toNumber(form.minStock),
    maxDiscountPercent: toNumber(form.maxDiscountPercent),
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
    { key: "internalCode", before: product.internalCode, after: form.internalCode.trim() },
    { key: "name", before: product.name, after: form.name.trim() },
    { key: "barcode", before: product.barcode, after: form.barcode.trim() },
    { key: "activeIngredient", before: product.activeIngredient, after: form.activeIngredient.trim() },
    { key: "reference", before: product.reference, after: form.reference.trim() },
    { key: "content", before: product.content, after: form.content.trim() },
    { key: "category", before: product.category, after: form.category.trim() },
    { key: "subcategory", before: product.subcategory, after: form.subcategory.trim() },
    { key: "manufacturer", before: product.manufacturer, after: form.manufacturer.trim() },
    { key: "brand", before: product.brand, after: form.brand.trim() },
    { key: "supplier", before: product.supplier, after: form.supplier.trim() },
    { key: "ncm", before: product.ncm, after: form.ncm.trim() },
    { key: "ncmDescription", before: product.ncmDescription, after: form.ncmDescription.trim() },
  ];

  const numericComparisons: Array<{
    key: keyof ProductFormState;
    before: number;
    after: number;
    format?: (value: number) => string;
  }> = [
    { key: "purchasePrice", before: product.purchasePrice, after: toNumber(form.purchasePrice), format: formatCurrency },
    { key: "cost", before: product.cost, after: toNumber(form.cost), format: formatCurrency },
    {
      key: "expectedProfitPercent",
      before: product.expectedProfitPercent,
      after: toNumber(form.expectedProfitPercent),
      format: percent,
    },
    { key: "salePrice", before: product.salePrice, after: toNumber(form.salePrice), format: formatCurrency },
    { key: "expectedProfit", before: product.expectedProfit, after: toNumber(form.expectedProfit), format: formatCurrency },
    { key: "stock", before: product.stock, after: toNumber(form.stock) },
    { key: "minStock", before: product.minStock, after: toNumber(form.minStock) },
    {
      key: "maxDiscountPercent",
      before: product.maxDiscountPercent,
      after: toNumber(form.maxDiscountPercent),
      format: percent,
    },
  ];

  const productSaleConditions = product.saleConditions ?? [];
  const formSaleConditions = normalizeSaleConditions(form.saleConditions);
  const saleConditionsChanged =
    JSON.stringify(productSaleConditions) !== JSON.stringify(formSaleConditions);

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
    ...(saleConditionsChanged
      ? [
          {
            key: "saleConditions" as keyof ProductFormState,
            label: fieldLabels.saleConditions,
            before: saleConditionsToText(productSaleConditions),
            after: saleConditionsToText(formSaleConditions),
          },
        ]
      : []),
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
      [
        product.name,
        product.internalCode,
        product.barcode,
        product.reference,
        product.activeIngredient,
        product.content,
        product.manufacturer,
        product.brand,
        product.category,
        product.subcategory,
        product.ncm,
      ]
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

  function resolveCostChange(
    current: ProductFormState,
    key: "purchasePrice" | "cost",
    rawValue: string,
  ): ProductFormState {
    const valueText = numberInputText(rawValue);
    const value = toNumber(valueText);
    const previousPurchasePrice = toNumber(current.purchasePrice);
    const currentCost = toNumber(current.cost);
    const costFollowsPurchase = current.cost.trim() === "" || currentCost === previousPurchasePrice;
    const nextCost = key === "cost" || costFollowsPurchase ? value : currentCost;
    const expectedProfitPercent = toNumber(current.expectedProfitPercent);
    const expectedProfit = calculateExpectedProfitValue(nextCost, expectedProfitPercent);
    const salePrice = calculateSalePriceValue(nextCost, expectedProfit);

    return {
      ...current,
      [key]: valueText,
      ...(key === "purchasePrice" && costFollowsPurchase ? { cost: valueText } : {}),
      ...(key === "cost" ? { cost: valueText } : {}),
      expectedProfitPercent: decimalText(expectedProfitPercent),
      expectedProfit: decimalText(expectedProfit),
      salePrice: decimalText(salePrice),
      saleConditions: current.saleConditions.map((condition) =>
        resolveSaleConditionCostChange(condition, nextCost),
      ),
    };
  }

  function resolveSaleConditionCostChange(
    condition: SaleConditionFormState,
    cost: number,
  ): SaleConditionFormState {
    const expectedProfitPercent = toNumber(condition.expectedProfitPercent);
    const expectedProfit = calculateExpectedProfitValue(cost, expectedProfitPercent);
    const salePrice = calculateSalePriceValue(cost, expectedProfit);

    return {
      ...condition,
      expectedProfitPercent: decimalText(expectedProfitPercent),
      expectedProfit: decimalText(expectedProfit),
      salePrice: decimalText(salePrice),
    };
  }

  function resolvePricingChange(
    current: ProductFormState,
    key: "salePrice" | "expectedProfitPercent" | "expectedProfit",
    rawValue: string,
  ): ProductFormState {
    const valueText = numberInputText(rawValue);
    const value = toNumber(valueText);
    const cost = toNumber(current.cost);

    if (key === "expectedProfitPercent") {
      const expectedProfitPercent = value;
      const expectedProfit = calculateExpectedProfitValue(cost, expectedProfitPercent);
      const salePrice = calculateSalePriceValue(cost, expectedProfit);

      return {
        ...current,
        expectedProfitPercent: valueText,
        expectedProfit: decimalText(expectedProfit),
        salePrice: decimalText(salePrice),
      };
    }

    const salePrice = key === "salePrice" && cost > 0 ? Math.max(value, cost) : value;
    const expectedProfit = key === "salePrice" ? Math.max(0, salePrice - cost) : value;
    const expectedProfitPercent = calculateExpectedProfitPercent(cost, expectedProfit);
    const nextSalePrice = key === "salePrice" ? salePrice : calculateSalePriceValue(cost, expectedProfit);

    return {
      ...current,
      [key]: key === "salePrice" ? decimalText(nextSalePrice) : decimalText(expectedProfit),
      expectedProfitPercent: decimalText(expectedProfitPercent),
      expectedProfit: decimalText(expectedProfit),
      salePrice: decimalText(nextSalePrice),
    };
  }

  function resolveSaleConditionPricingChange(
    condition: SaleConditionFormState,
    cost: number,
    key: "salePrice" | "expectedProfitPercent" | "expectedProfit",
    rawValue: string,
  ): SaleConditionFormState {
    const valueText = numberInputText(rawValue);
    const value = toNumber(valueText);

    if (key === "expectedProfitPercent") {
      const expectedProfitPercent = value;
      const expectedProfit = calculateExpectedProfitValue(cost, expectedProfitPercent);
      const salePrice = calculateSalePriceValue(cost, expectedProfit);

      return {
        ...condition,
        expectedProfitPercent: valueText,
        expectedProfit: decimalText(expectedProfit),
        salePrice: decimalText(salePrice),
      };
    }

    const salePrice = key === "salePrice" && cost > 0 ? Math.max(value, cost) : value;
    const expectedProfit = key === "salePrice" ? Math.max(0, salePrice - cost) : value;
    const expectedProfitPercent = calculateExpectedProfitPercent(cost, expectedProfit);
    const nextSalePrice = key === "salePrice" ? salePrice : calculateSalePriceValue(cost, expectedProfit);

    return {
      ...condition,
      [key]: key === "salePrice" ? decimalText(nextSalePrice) : decimalText(expectedProfit),
      expectedProfitPercent: decimalText(expectedProfitPercent),
      expectedProfit: decimalText(expectedProfit),
      salePrice: decimalText(nextSalePrice),
    };
  }

  function updateFormCost(key: "purchasePrice" | "cost", value: string) {
    setForm((current) => resolveCostChange(current, key, value));
  }

  function updateEditFormCost(key: "purchasePrice" | "cost", value: string) {
    setEditForm((current) => resolveCostChange(current, key, value));
  }

  function updateFormPricing(
    key: "salePrice" | "expectedProfitPercent" | "expectedProfit",
    value: string,
  ) {
    setForm((current) => resolvePricingChange(current, key, value));
  }

  function updateEditFormPricing(
    key: "salePrice" | "expectedProfitPercent" | "expectedProfit",
    value: string,
  ) {
    setEditForm((current) => resolvePricingChange(current, key, value));
  }

  function updateSaleConditionPricing(
    conditionId: string,
    key: "salePrice" | "expectedProfitPercent" | "expectedProfit",
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      saleConditions: current.saleConditions.map((condition) =>
        condition.id === conditionId
          ? resolveSaleConditionPricingChange(condition, toNumber(current.cost), key, value)
          : condition,
      ),
    }));
  }

  function updateEditSaleConditionPricing(
    conditionId: string,
    key: "salePrice" | "expectedProfitPercent" | "expectedProfit",
    value: string,
  ) {
    setEditForm((current) => ({
      ...current,
      saleConditions: current.saleConditions.map((condition) =>
        condition.id === conditionId
          ? resolveSaleConditionPricingChange(condition, toNumber(current.cost), key, value)
          : condition,
      ),
    }));
  }

  function addSaleCondition() {
    setForm((current) => ({
      ...current,
      saleConditions: [
        ...current.saleConditions,
        {
          id: makeSaleConditionId(),
          salePrice: current.salePrice,
          expectedProfitPercent: current.expectedProfitPercent,
          expectedProfit: current.expectedProfit,
          quantity: "2",
          mode: "from_quantity",
        },
      ],
    }));
  }

  function addEditSaleCondition() {
    setEditForm((current) => ({
      ...current,
      saleConditions: [
        ...current.saleConditions,
        {
          id: makeSaleConditionId(),
          salePrice: current.salePrice,
          expectedProfitPercent: current.expectedProfitPercent,
          expectedProfit: current.expectedProfit,
          quantity: "2",
          mode: "from_quantity",
        },
      ],
    }));
  }

  function updateSaleCondition<K extends keyof SaleConditionFormState>(
    conditionId: string,
    key: K,
    value: SaleConditionFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      saleConditions: current.saleConditions.map((condition) =>
        condition.id === conditionId ? { ...condition, [key]: value } : condition,
      ),
    }));
  }

  function updateEditSaleCondition<K extends keyof SaleConditionFormState>(
    conditionId: string,
    key: K,
    value: SaleConditionFormState[K],
  ) {
    setEditForm((current) => ({
      ...current,
      saleConditions: current.saleConditions.map((condition) =>
        condition.id === conditionId ? { ...condition, [key]: value } : condition,
      ),
    }));
  }

  function removeSaleCondition(conditionId: string) {
    setForm((current) => ({
      ...current,
      saleConditions: current.saleConditions.filter((condition) => condition.id !== conditionId),
    }));
  }

  function removeEditSaleCondition(conditionId: string) {
    setEditForm((current) => ({
      ...current,
      saleConditions: current.saleConditions.filter((condition) => condition.id !== conditionId),
    }));
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
      internalCode: form.internalCode,
      name: form.name,
      barcode: form.barcode,
      activeIngredient: form.activeIngredient,
      reference: form.reference,
      content: form.content,
      category: form.category,
      subcategory: form.subcategory,
      manufacturer: form.manufacturer,
      brand: form.brand,
      supplier: form.supplier,
      ncm: form.ncm,
      ncmDescription: form.ncmDescription,
      purchasePrice: toNumber(form.purchasePrice),
      salePrice: toNumber(form.salePrice),
      cost: toNumber(form.cost),
      expectedProfitPercent: toNumber(form.expectedProfitPercent),
      expectedProfit: toNumber(form.expectedProfit),
      saleConditions: normalizeSaleConditions(form.saleConditions),
      stock: toNumber(form.stock),
      minStock: toNumber(form.minStock),
      maxDiscountPercent: toNumber(form.maxDiscountPercent),
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
        wide
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
                    <FormField label="Codigo de barras">
                      <input
                        required
                        className={inputClassName}
                        value={form.barcode}
                        onChange={(event) => updateForm("barcode", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Codigo interno">
                      <input
                        className={inputClassName}
                        placeholder="Gerado automaticamente se ficar vazio"
                        value={form.internalCode}
                        onChange={(event) => updateForm("internalCode", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Nome">
                      <input
                        required
                        className={inputClassName}
                        placeholder="Referencia ou similar"
                        value={form.name}
                        onChange={(event) => updateForm("name", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Principio ativo + posologia">
                      <input
                        required
                        className={inputClassName}
                        value={form.activeIngredient}
                        onChange={(event) => updateForm("activeIngredient", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Referencia">
                      <input
                        className={inputClassName}
                        value={form.reference}
                        onChange={(event) => updateForm("reference", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Conteudo">
                      <input
                        required
                        className={inputClassName}
                        placeholder="20 comprimidos, 60ml xarope"
                        value={form.content}
                        onChange={(event) => updateForm("content", event.target.value)}
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
                    <FormField label="Marca">
                      <input
                        required
                        className={inputClassName}
                        value={form.brand}
                        onChange={(event) => updateForm("brand", event.target.value)}
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
                    <FormField label="NCM">
                      <input
                        required
                        className={inputClassName}
                        value={form.ncm}
                        onChange={(event) => updateForm("ncm", event.target.value)}
                      />
                    </FormField>
                    <FormField label="Descricao do NCM">
                      <input
                        required
                        className={inputClassName}
                        value={form.ncmDescription}
                        onChange={(event) => updateForm("ncmDescription", event.target.value)}
                      />
                    </FormField>
                  </div>
                ),
              },
              {
                id: "estoque",
                label: "Estoque",
                content: (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField label="Preco de compra">
                        <MoneyInput
                          required
                          value={form.purchasePrice}
                          onChange={(event) => updateFormCost("purchasePrice", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Preco de custo">
                        <MoneyInput
                          required
                          value={form.cost}
                          onChange={(event) => updateFormCost("cost", event.target.value)}
                        />
                      </FormField>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField label="Valor Venda 1">
                        <MoneyInput
                          required
                          value={form.salePrice}
                          onChange={(event) => updateFormPricing("salePrice", event.target.value)}
                        />
                      </FormField>
                      <FormField label="% lucro esperado">
                        <PercentInput
                          required
                          value={form.expectedProfitPercent}
                          onChange={(event) => updateFormPricing("expectedProfitPercent", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Lucro esperado">
                        <MoneyInput
                          required
                          value={form.expectedProfit}
                          onChange={(event) => updateFormPricing("expectedProfit", event.target.value)}
                        />
                      </FormField>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
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
                    </div>

                    <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-slate-900">Condicoes adicionais de venda</h3>
                        <ActionButton compact icon={Plus} onClick={addSaleCondition}>
                          Adicionar valor
                        </ActionButton>
                      </div>
                      {form.saleConditions.length > 0 ? (
                        <div className="space-y-3">
                          {form.saleConditions.map((condition, index) => (
                            <div
                              key={condition.id}
                              className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 md:grid-cols-[170px_130px_1fr_160px_1fr_auto]"
                            >
                              <FormField label="Regra">
                                <select
                                  className={inputClassName}
                                  value={condition.mode}
                                  onChange={(event) =>
                                    updateSaleCondition(
                                      condition.id,
                                      "mode",
                                      event.target.value as ProductSaleConditionMode,
                                    )
                                  }
                                >
                                  <option value="from_quantity">A partir de</option>
                                  <option value="every_quantity">A cada</option>
                                </select>
                              </FormField>
                              <FormField label="Quantidade">
                                <input
                                  required
                                  min="2"
                                  step="1"
                                  type="number"
                                  className={inputClassName}
                                  value={condition.quantity}
                                  onChange={(event) =>
                                    updateSaleCondition(
                                      condition.id,
                                      "quantity",
                                      String(Math.max(2, toNumber(event.target.value))),
                                    )
                                  }
                                />
                              </FormField>
                              <FormField label={`Valor Venda ${index + 2}`}>
                                <MoneyInput
                                  required
                                  value={condition.salePrice}
                                  onChange={(event) =>
                                    updateSaleConditionPricing(condition.id, "salePrice", event.target.value)
                                  }
                                />
                              </FormField>
                              <FormField label="% lucro esperado">
                                <PercentInput
                                  required
                                  value={condition.expectedProfitPercent}
                                  onChange={(event) =>
                                    updateSaleConditionPricing(
                                      condition.id,
                                      "expectedProfitPercent",
                                      event.target.value,
                                    )
                                  }
                                />
                              </FormField>
                              <FormField label="Lucro esperado">
                                <MoneyInput
                                  required
                                  value={condition.expectedProfit}
                                  onChange={(event) =>
                                    updateSaleConditionPricing(condition.id, "expectedProfit", event.target.value)
                                  }
                                />
                              </FormField>
                              <ActionButton
                                compact
                                className="self-end"
                                icon={XCircle}
                                onClick={() => removeSaleCondition(condition.id)}
                                variant="ghost"
                              >
                                Remover
                              </ActionButton>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Nenhuma condicao adicional cadastrada.</p>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                id: "comercial",
                label: "Regras",
                content: (
                  <div className="grid gap-4 md:grid-cols-3">
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
                      <FormField label="Codigo de barras">
                        <input
                          className={inputClassName}
                          value={editForm.barcode}
                          onChange={(event) => updateEditForm("barcode", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Codigo interno">
                        <input
                          className={inputClassName}
                          value={editForm.internalCode}
                          onChange={(event) => updateEditForm("internalCode", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Nome">
                        <input
                          className={inputClassName}
                          data-testid="product-edit-name"
                          value={editForm.name}
                          onChange={(event) => updateEditForm("name", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Principio ativo + posologia">
                        <input
                          className={inputClassName}
                          value={editForm.activeIngredient}
                          onChange={(event) => updateEditForm("activeIngredient", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Referencia">
                        <input
                          className={inputClassName}
                          value={editForm.reference}
                          onChange={(event) => updateEditForm("reference", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Conteudo">
                        <input
                          className={inputClassName}
                          value={editForm.content}
                          onChange={(event) => updateEditForm("content", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Fabricante">
                        <input
                          className={inputClassName}
                          value={editForm.manufacturer}
                          onChange={(event) => updateEditForm("manufacturer", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Marca">
                        <input
                          className={inputClassName}
                          value={editForm.brand}
                          onChange={(event) => updateEditForm("brand", event.target.value)}
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
                      <FormField label="NCM">
                        <input
                          className={inputClassName}
                          value={editForm.ncm}
                          onChange={(event) => updateEditForm("ncm", event.target.value)}
                        />
                      </FormField>
                      <FormField label="Descricao do NCM">
                        <input
                          className={inputClassName}
                          value={editForm.ncmDescription}
                          onChange={(event) => updateEditForm("ncmDescription", event.target.value)}
                        />
                      </FormField>
                    </div>
                  ),
                },
                {
                  id: "estoque",
                  label: "Estoque",
                  content: (
                    <div className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Preco de compra">
                          <MoneyInput
                            value={editForm.purchasePrice}
                            onChange={(event) => updateEditFormCost("purchasePrice", event.target.value)}
                          />
                        </FormField>
                        <FormField label="Preco de custo">
                          <MoneyInput
                            value={editForm.cost}
                            onChange={(event) => updateEditFormCost("cost", event.target.value)}
                          />
                        </FormField>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField label="Valor Venda 1">
                          <MoneyInput
                            value={editForm.salePrice}
                            onChange={(event) => updateEditFormPricing("salePrice", event.target.value)}
                          />
                        </FormField>
                        <FormField label="% lucro esperado">
                          <PercentInput
                            value={editForm.expectedProfitPercent}
                            onChange={(event) =>
                              updateEditFormPricing("expectedProfitPercent", event.target.value)
                            }
                          />
                        </FormField>
                        <FormField label="Lucro esperado">
                          <MoneyInput
                            value={editForm.expectedProfit}
                            onChange={(event) => updateEditFormPricing("expectedProfit", event.target.value)}
                          />
                        </FormField>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
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
                      </div>

                      <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-slate-900">Condicoes adicionais de venda</h3>
                          <ActionButton compact icon={Plus} onClick={addEditSaleCondition}>
                            Adicionar valor
                          </ActionButton>
                        </div>
                        {editForm.saleConditions.length > 0 ? (
                          <div className="space-y-3">
                            {editForm.saleConditions.map((condition, index) => (
                              <div
                                key={condition.id}
                                className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 md:grid-cols-[170px_130px_1fr_160px_1fr_auto]"
                              >
                                <FormField label="Regra">
                                  <select
                                    className={inputClassName}
                                    value={condition.mode}
                                    onChange={(event) =>
                                      updateEditSaleCondition(
                                        condition.id,
                                        "mode",
                                        event.target.value as ProductSaleConditionMode,
                                      )
                                    }
                                  >
                                    <option value="from_quantity">A partir de</option>
                                    <option value="every_quantity">A cada</option>
                                  </select>
                                </FormField>
                                <FormField label="Quantidade">
                                  <input
                                    min="2"
                                    step="1"
                                    type="number"
                                    className={inputClassName}
                                    value={condition.quantity}
                                    onChange={(event) =>
                                      updateEditSaleCondition(
                                        condition.id,
                                        "quantity",
                                        String(Math.max(2, toNumber(event.target.value))),
                                      )
                                    }
                                  />
                                </FormField>
                                <FormField label={`Valor Venda ${index + 2}`}>
                                  <MoneyInput
                                    value={condition.salePrice}
                                    onChange={(event) =>
                                      updateEditSaleConditionPricing(condition.id, "salePrice", event.target.value)
                                    }
                                  />
                                </FormField>
                                <FormField label="% lucro esperado">
                                  <PercentInput
                                    value={condition.expectedProfitPercent}
                                    onChange={(event) =>
                                      updateEditSaleConditionPricing(
                                        condition.id,
                                        "expectedProfitPercent",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </FormField>
                                <FormField label="Lucro esperado">
                                  <MoneyInput
                                    value={condition.expectedProfit}
                                    onChange={(event) =>
                                      updateEditSaleConditionPricing(
                                        condition.id,
                                        "expectedProfit",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </FormField>
                                <ActionButton
                                  compact
                                  className="self-end"
                                  icon={XCircle}
                                  onClick={() => removeEditSaleCondition(condition.id)}
                                  variant="ghost"
                                >
                                  Remover
                                </ActionButton>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">Nenhuma condicao adicional cadastrada.</p>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  id: "comercial",
                  label: "Regras",
                  content: (
                    <div className="grid gap-4 md:grid-cols-3">
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
