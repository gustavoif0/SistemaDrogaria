import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  company,
  currentUser,
  initialCategories,
  initialFinanceMovements,
  initialPreSales,
  initialProducts,
  initialSales,
  initialSubcategories,
  stockEntryMock,
} from "../mocks/mockData";
import type {
  FinanceMovement,
  PaymentMethod,
  PreSale,
  PreSaleItem,
  Product,
  ProductCategory,
  ProductSubcategory,
  Sale,
} from "../types/domain";
import { buildStockAlerts, summarizeItems, validateSaleItem } from "../lib/salesRules";

type ProductDraft = Pick<
  Product,
  | "internalCode"
  | "name"
  | "barcode"
  | "reference"
  | "category"
  | "subcategory"
  | "manufacturer"
  | "brand"
  | "supplier"
  | "activeIngredient"
  | "content"
  | "ncm"
  | "ncmDescription"
  | "purchasePrice"
  | "salePrice"
  | "cost"
  | "expectedProfitPercent"
  | "expectedProfit"
  | "saleConditions"
  | "stock"
  | "minStock"
  | "maxDiscountPercent"
> &
  Partial<Product>;

type CategoryDraft = Omit<ProductCategory, "id">;

type SubcategoryDraft = Omit<ProductSubcategory, "id">;

interface PharmaContextValue {
  company: typeof company;
  currentUser: typeof currentUser;
  products: Product[];
  categories: ProductCategory[];
  subcategories: ProductSubcategory[];
  preSales: PreSale[];
  sales: Sale[];
  financeMovements: FinanceMovement[];
  stockAlerts: ReturnType<typeof buildStockAlerts>;
  stockEntryMock: typeof stockEntryMock;
  addProduct: (draft: ProductDraft) => Product;
  updateProduct: (productId: string, changes: Partial<Product>) => void;
  addCategory: (draft: CategoryDraft) => ProductCategory;
  updateCategory: (categoryId: string, changes: Partial<ProductCategory>) => void;
  addSubcategory: (draft: SubcategoryDraft) => ProductSubcategory;
  updateSubcategory: (subcategoryId: string, changes: Partial<ProductSubcategory>) => void;
  sendPreSaleToCashier: (customerName: string, items: PreSaleItem[]) => PreSale;
  finalizeSale: (
    preSaleId: string,
    paymentMethod: PaymentMethod,
  ) => { ok: true; sale: Sale } | { ok: false; message: string };
  getProductById: (productId: string) => Product | undefined;
}

const PharmaContext = createContext<PharmaContextValue | null>(null);

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeNumber(prefix: string, length: number) {
  const value = Math.floor(10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1));
  return `${prefix}-${value}`;
}

export function PharmaProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const [subcategories, setSubcategories] =
    useState<ProductSubcategory[]>(initialSubcategories);
  const [preSales, setPreSales] = useState<PreSale[]>(initialPreSales);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [financeMovements, setFinanceMovements] = useState<FinanceMovement[]>(
    initialFinanceMovements,
  );

  const getProductById = useCallback(
    (productId: string) => products.find((product) => product.id === productId),
    [products],
  );

  const addProduct = useCallback((draft: ProductDraft) => {
    const expectedProfit =
      draft.expectedProfit ??
      Number((draft.cost + draft.cost * (draft.expectedProfitPercent / 100)).toFixed(2));
    const product: Product = {
      id: makeId("prod"),
      internalCode: draft.internalCode.trim() || makeNumber("MED", 4),
      barcode: draft.barcode,
      reference: draft.reference.trim() || draft.name.slice(0, 8).toUpperCase(),
      name: draft.name,
      description: draft.description ?? "Cadastro criado no MVP academico.",
      unit: draft.unit ?? "CX",
      type: draft.type ?? "Medicamento",
      category: draft.category,
      subcategory: draft.subcategory ?? "Sem subcategoria",
      manufacturer: draft.manufacturer,
      brand: draft.brand,
      supplier: draft.supplier,
      activeIngredient: draft.activeIngredient,
      presentation: draft.presentation ?? draft.content,
      content: draft.content,
      msRegistration: draft.msRegistration ?? "Isento",
      status: draft.status ?? "active",
      allowDiscount: draft.allowDiscount ?? true,
      maxDiscountPercent: draft.maxDiscountPercent,
      allowFractional: draft.allowFractional ?? false,
      controlsBatch: draft.controlsBatch ?? false,
      controlsExpiry: draft.controlsExpiry ?? false,
      controlledMedicine: draft.controlledMedicine ?? false,
      participatesPbm: draft.participatesPbm ?? false,
      participatesPopularPharmacy: draft.participatesPopularPharmacy ?? false,
      taxGroup: draft.taxGroup ?? "Medicamento tributado",
      ncm: draft.ncm,
      ncmDescription: draft.ncmDescription,
      cest: draft.cest ?? "13.001.00",
      cfop: draft.cfop ?? "5102",
      purchasePrice: draft.purchasePrice,
      cost: draft.cost,
      averageCost: draft.averageCost ?? draft.cost,
      suggestedPrice: draft.suggestedPrice ?? draft.salePrice,
      expectedProfitPercent: draft.expectedProfitPercent,
      expectedProfit,
      salePrice: draft.salePrice,
      saleConditions: draft.saleConditions ?? [],
      minStock: draft.minStock,
      maxStock: draft.maxStock ?? draft.stock * 3,
      stock: draft.stock,
      location: draft.location ?? "A definir",
      batches: draft.batches ?? [],
    };

    setProducts((current) => [product, ...current]);
    return product;
  }, []);

  const updateProduct = useCallback((productId: string, changes: Partial<Product>) => {
    setProducts((current) =>
      current.map((product) => (product.id === productId ? { ...product, ...changes } : product)),
    );
  }, []);

  const addCategory = useCallback((draft: CategoryDraft) => {
    const category: ProductCategory = {
      ...draft,
      id: makeId("cat"),
    };

    setCategories((current) => [category, ...current]);
    return category;
  }, []);

  const updateCategory = useCallback((categoryId: string, changes: Partial<ProductCategory>) => {
    setCategories((current) => {
      const existing = current.find((category) => category.id === categoryId);

      if (existing && changes.name && changes.name !== existing.name) {
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.category === existing.name ? { ...product, category: changes.name! } : product,
          ),
        );
      }

      return current.map((category) =>
        category.id === categoryId ? { ...category, ...changes } : category,
      );
    });
  }, []);

  const addSubcategory = useCallback((draft: SubcategoryDraft) => {
    const subcategory: ProductSubcategory = {
      ...draft,
      id: makeId("sub"),
    };

    setSubcategories((current) => [subcategory, ...current]);
    return subcategory;
  }, []);

  const updateSubcategory = useCallback(
    (subcategoryId: string, changes: Partial<ProductSubcategory>) => {
      setSubcategories((current) => {
        const existing = current.find((subcategory) => subcategory.id === subcategoryId);

        if (existing && changes.name && changes.name !== existing.name) {
          setProducts((currentProducts) =>
            currentProducts.map((product) =>
              product.subcategory === existing.name
                ? { ...product, subcategory: changes.name! }
                : product,
            ),
          );
        }

        return current.map((subcategory) =>
          subcategory.id === subcategoryId ? { ...subcategory, ...changes } : subcategory,
        );
      });
    },
    [],
  );

  const sendPreSaleToCashier = useCallback(
    (customerName: string, items: PreSaleItem[]) => {
      const totals = summarizeItems(items);
      const preSale: PreSale = {
        id: makeId("pre"),
        number: makeNumber("PV", 5),
        customerName: customerName.trim() || "Consumidor final",
        attendant: currentUser.name,
        status: "sent_to_cashier",
        items,
        ...totals,
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
      };

      setPreSales((current) => [preSale, ...current]);
      return preSale;
    },
    [],
  );

  const finalizeSale = useCallback(
    (preSaleId: string, paymentMethod: PaymentMethod) => {
      const preSale = preSales.find((item) => item.id === preSaleId);

      if (!preSale || preSale.status !== "sent_to_cashier") {
        return { ok: false as const, message: "Pre-venda pendente nao encontrada." };
      }

      for (const item of preSale.items) {
        const product = products.find((entry) => entry.id === item.productId);

        if (!product) {
          return { ok: false as const, message: `Produto ${item.productName} nao encontrado.` };
        }

        const validation = validateSaleItem(
          product,
          item.quantity,
          item.discountPercent,
          item.batchId,
          item.prescriptionInformed,
        );

        if (!validation.valid) {
          return { ok: false as const, message: `${item.productName}: ${validation.message}` };
        }
      }

      const sale: Sale = {
        id: makeId("sale"),
        number: makeNumber("VD", 5),
        preSaleId: preSale.id,
        customerName: preSale.customerName,
        cashier: "Caixa 01 - Julia Almeida",
        paymentMethod,
        fiscalStatus: "mock_authorized",
        items: preSale.items,
        total: preSale.total,
        createdAt: new Date().toISOString(),
      };

      const financeMovement: FinanceMovement = {
        id: makeId("fin"),
        saleId: sale.id,
        description: `Venda ${sale.number} - ${preSale.customerName}`,
        kind: "income",
        amount: sale.total,
        paymentMethod,
        status: paymentMethod === "Crediario" ? "pending" : "settled",
        createdAt: sale.createdAt,
      };

      setProducts((currentProducts) =>
        currentProducts.map((product) => {
          const soldItems = preSale.items.filter((item) => item.productId === product.id);
          if (!soldItems.length) return product;

          const soldQuantity = soldItems.reduce((sum, item) => sum + item.quantity, 0);

          return {
            ...product,
            stock: Number((product.stock - soldQuantity).toFixed(3)),
            batches: product.batches.map((batch) => {
              const batchQuantity = soldItems
                .filter((item) => item.batchId === batch.id)
                .reduce((sum, item) => sum + item.quantity, 0);

              if (!batchQuantity) return batch;

              return {
                ...batch,
                quantity: Number((batch.quantity - batchQuantity).toFixed(3)),
              };
            }),
          };
        }),
      );

      setPreSales((current) =>
        current.map((item) =>
          item.id === preSale.id
            ? { ...item, status: "closed", closedAt: sale.createdAt }
            : item,
        ),
      );
      setSales((current) => [sale, ...current]);
      setFinanceMovements((current) => [financeMovement, ...current]);

      return { ok: true as const, sale };
    },
    [preSales, products],
  );

  const value = useMemo<PharmaContextValue>(
    () => ({
      company,
      currentUser,
      products,
      categories,
      subcategories,
      preSales,
      sales,
      financeMovements,
      stockAlerts: buildStockAlerts(products),
      stockEntryMock,
      addProduct,
      updateProduct,
      addCategory,
      updateCategory,
      addSubcategory,
      updateSubcategory,
      sendPreSaleToCashier,
      finalizeSale,
      getProductById,
    }),
    [
      addProduct,
      addCategory,
      addSubcategory,
      categories,
      financeMovements,
      finalizeSale,
      getProductById,
      preSales,
      products,
      sales,
      subcategories,
      updateCategory,
      updateProduct,
      updateSubcategory,
    ],
  );

  return <PharmaContext.Provider value={value}>{children}</PharmaContext.Provider>;
}

export function usePharma() {
  const context = useContext(PharmaContext);

  if (!context) {
    throw new Error("usePharma deve ser usado dentro de PharmaProvider.");
  }

  return context;
}
