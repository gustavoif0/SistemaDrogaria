import type { Batch, PreSaleItem, Product, StockAlert } from "../types/domain";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function daysUntil(date: string) {
  const today = new Date();
  const target = new Date(`${date}T00:00:00`);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / DAY_IN_MS);
}

export function getBatchStatus(batch: Batch) {
  const days = daysUntil(batch.expiryDate);
  if (days < 0) return "expired";
  if (days <= 90) return "near_expiry";
  return "ok";
}

export function getPreferredBatch(product: Product) {
  if (!product.controlsBatch) return undefined;
  return product.batches
    .filter((batch) => batch.quantity > 0 && getBatchStatus(batch) !== "expired")
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];
}

export function calculateItemTotal(
  quantity: number,
  unitPrice: number,
  discountPercent: number,
) {
  const discount = unitPrice * quantity * (discountPercent / 100);
  return Number((unitPrice * quantity - discount).toFixed(2));
}

export function validateSaleItem(
  product: Product,
  quantity: number,
  discountPercent: number,
  batchId?: string,
  prescriptionInformed?: boolean,
) {
  if (product.status !== "active") {
    return { valid: false, message: "Produto inativo nao pode ser vendido." };
  }

  if (quantity <= 0) {
    return { valid: false, message: "Informe uma quantidade maior que zero." };
  }

  if (!product.allowFractional && !Number.isInteger(quantity)) {
    return { valid: false, message: "Produto nao permite venda fracionada." };
  }

  if (quantity > product.stock) {
    return { valid: false, message: "Estoque insuficiente para esta venda." };
  }

  if (!product.allowDiscount && discountPercent > 0) {
    return { valid: false, message: "Este produto nao permite desconto." };
  }

  if (discountPercent > product.maxDiscountPercent) {
    return {
      valid: false,
      message: `Desconto maximo permitido: ${product.maxDiscountPercent}%.`,
    };
  }

  if (product.controlledMedicine && !prescriptionInformed) {
    return {
      valid: false,
      message: "Medicamento controlado exige receita informada para o SNGPC mockado.",
    };
  }

  if (product.controlsBatch) {
    if (!batchId) {
      return { valid: false, message: "Selecione um lote antes de vender." };
    }

    const batch = product.batches.find((item) => item.id === batchId);

    if (!batch) {
      return { valid: false, message: "Lote nao encontrado para o produto." };
    }

    if (getBatchStatus(batch) === "expired") {
      return { valid: false, message: "Lote vencido nao pode ser vendido." };
    }

    if (quantity > batch.quantity) {
      return { valid: false, message: "Quantidade maior que o saldo do lote." };
    }
  }

  return { valid: true, message: "Item validado." };
}

export function summarizeItems(items: PreSaleItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.total, 0);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountTotal: Number((subtotal - total).toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

export function buildStockAlerts(products: Product[]): StockAlert[] {
  const alerts: StockAlert[] = [];

  products.forEach((product) => {
    if (product.stock <= product.minStock) {
      alerts.push({
        id: `${product.id}-low-stock`,
        productName: product.name,
        type: "low_stock",
        message: `Saldo ${product.stock} ${product.unit}; minimo ${product.minStock}.`,
      });
    }

    product.batches.forEach((batch) => {
      const status = getBatchStatus(batch);
      if (status === "near_expiry" || status === "expired") {
        alerts.push({
          id: `${product.id}-${batch.id}-${status}`,
          productName: product.name,
          type: status,
          message:
            status === "expired"
              ? `Lote ${batch.code} vencido.`
              : `Lote ${batch.code} vence em ${daysUntil(batch.expiryDate)} dias.`,
        });
      }
    });
  });

  return alerts;
}
