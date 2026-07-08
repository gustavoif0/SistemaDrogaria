export type ProductStatus = "active" | "inactive";

export type BatchStatus = "ok" | "near_expiry" | "expired";

export type PreSaleStatus = "draft" | "sent_to_cashier" | "closed" | "cancelled";

export type PaymentMethod =
  | "Dinheiro"
  | "Pix mockado"
  | "Credito"
  | "Debito"
  | "Crediario"
  | "Convenio/PBM mockado";

export type FiscalStatus = "mock_authorized" | "mock_processing" | "mock_rejected";

export interface Company {
  id: string;
  name: string;
  document: string;
  storeName: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
}

export interface Batch {
  id: string;
  code: string;
  expiryDate: string;
  quantity: number;
}

export interface Product {
  id: string;
  internalCode: string;
  barcode: string;
  reference: string;
  name: string;
  description: string;
  unit: string;
  type: string;
  category: string;
  subcategory: string;
  manufacturer: string;
  supplier: string;
  activeIngredient: string;
  presentation: string;
  msRegistration: string;
  status: ProductStatus;
  allowDiscount: boolean;
  maxDiscountPercent: number;
  allowFractional: boolean;
  controlsBatch: boolean;
  controlsExpiry: boolean;
  controlledMedicine: boolean;
  participatesPbm: boolean;
  participatesPopularPharmacy: boolean;
  taxGroup: string;
  ncm: string;
  cest: string;
  cfop: string;
  purchasePrice: number;
  cost: number;
  averageCost: number;
  suggestedPrice: number;
  salePrice: number;
  minStock: number;
  maxStock: number;
  stock: number;
  location: string;
  batches: Batch[];
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  status: ProductStatus;
}

export interface ProductSubcategory {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  status: ProductStatus;
  requiresPharmacistReview: boolean;
}

export interface PreSaleItem {
  id: string;
  productId: string;
  productName: string;
  internalCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  total: number;
  batchId?: string;
  batchCode?: string;
  prescriptionInformed?: boolean;
}

export interface PreSale {
  id: string;
  number: string;
  customerName: string;
  attendant: string;
  status: PreSaleStatus;
  items: PreSaleItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  createdAt: string;
  sentAt?: string;
  closedAt?: string;
}

export interface Sale {
  id: string;
  number: string;
  preSaleId: string;
  customerName: string;
  cashier: string;
  paymentMethod: PaymentMethod;
  fiscalStatus: FiscalStatus;
  items: PreSaleItem[];
  total: number;
  createdAt: string;
}

export interface FinanceMovement {
  id: string;
  saleId: string;
  description: string;
  kind: "income" | "expense";
  amount: number;
  paymentMethod: PaymentMethod;
  status: "settled" | "pending";
  createdAt: string;
}

export interface StockAlert {
  id: string;
  productName: string;
  type: "low_stock" | "near_expiry" | "expired";
  message: string;
}

export interface StockEntryMock {
  id: string;
  accessKey: string;
  supplier: string;
  issueDate: string;
  total: number;
  status: "mapped" | "pending_review";
  items: Array<{
    id: string;
    productName: string;
    invoiceName: string;
    quantity: number;
    cost: number;
    batchCode: string;
    expiryDate: string;
    linkedProductId?: string;
  }>;
}
