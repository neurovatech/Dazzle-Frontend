/**
 * COD Charge & Grand Total Calculation Utility
 *
 * Handles the two-step formula where COD charge percentage is evaluated
 * against the base amount and then adjusted against the resulting grand total:
 *
 * Example:
 * Product price : 405,244
 * Delivery Fee  : 110
 * Base Total    : 405,354
 *
 * Step 1:
 *   cod1 = Math.floor(405,354 * 1%) = 4,053
 *   initialGrandTotal = 405,354 + Math.round(405,354 * 1%) + fixed = 409,408
 *
 * Step 2:
 *   cod2 = Math.floor(409,408 * 1%) = 4,094 (actual COD charge)
 *   diff = cod2 - cod1 = 4,094 - 4,053 = 41
 *   finalGrandTotal = initialGrandTotal + diff = 409,408 + 41 = 409,449
 *   roundOff = finalGrandTotal - (baseTotal + cod2 + fixed) = 1
 */

export interface CodCalculationResult {
  codCharge: number;
  grandTotal: number;
  roundOff: number;
  initialGrandTotal: number;
  diff: number;
}

export function calculateCodDetails(
  baseTotal: number,
  codPercentage: number = 1,
  fixedCharge: number = 0
): CodCalculationResult {
  if (baseTotal <= 0) {
    return { codCharge: 0, grandTotal: 0, roundOff: 0, initialGrandTotal: 0, diff: 0 };
  }

  const pct = codPercentage > 0 ? codPercentage : 1;
  const cod1 = Math.floor((baseTotal * pct) / 100);
  const initialGrandTotal = baseTotal + Math.round((baseTotal * pct) / 100) + fixedCharge;
  const cod2 = Math.floor((initialGrandTotal * pct) / 100);
  const diff = cod2 - cod1;
  const grandTotal = initialGrandTotal + diff;
  const codCharge = cod2 + fixedCharge;
  const roundOff = grandTotal - (baseTotal + codCharge);

  return {
    codCharge,
    grandTotal,
    roundOff,
    initialGrandTotal,
    diff,
  };
}

export function getOrderCorrectTotal(order: {
  grandTotal?: number;
  subTotal?: number;
  productPrice?: number;
  deliveryFee?: number;
  discount?: number;
  codCharge?: number;
  total?: number;
  totalNumber?: number;
  paymentType?: string;
  isCashOnDelivery?: boolean;
}): {
  correctTotal: number;
  codCharge: number;
  roundOff: number;
} {
  const subTotal = order.subTotal ?? 0;
  const deliveryFee = order.deliveryFee ?? 0;
  const productPrice = order.productPrice ?? 0;
  const discount = order.discount ?? 0;
  const rawCod = order.codCharge ?? 0;

  // Resolve base amount for COD:
  // In the API, subTotal is stored as productPrice + deliveryFee (e.g. 405,244 + 110 = 405,354).
  // When productPrice > 0, base is productPrice + deliveryFee - discount (405,354).
  // If productPrice is absent, subTotal is already the base amount.
  let base = 0;
  if (productPrice > 0) {
    base = productPrice + deliveryFee - discount;
  } else if (subTotal > 0) {
    base = subTotal - discount;
  } else {
    base = order.totalNumber || (order.total ? Number(order.total) : 0) || 0;
  }

  const isCod =
    order.paymentType === "COD" ||
    !!order.isCashOnDelivery ||
    rawCod > 0;

  if (isCod && base > 0) {
    const pct = rawCod > 0 && base > 0 ? Math.max(1, Math.round((rawCod / base) * 100)) : 1;
    const calc = calculateCodDetails(base, pct);

    return {
      correctTotal: calc.grandTotal,
      codCharge: calc.codCharge,
      roundOff: calc.roundOff,
    };
  }

  const fallback =
    (order.grandTotal ?? (base + rawCod)) ||
    order.totalNumber ||
    (order.total ? Number(order.total) : 0) ||
    base;

  return {
    correctTotal: fallback,
    codCharge: rawCod,
    roundOff: 0,
  };
}
