// ─── Payment Module Calculations ───────────────────────────────────────────────
// Preserves existing backend formulas:
//   NetPayment = (Basic_Amt - Disc_Amt) + Tax_Amt
//   Outstanding = NetAmount - PaidAmount
//
// Installment distribution follows existing CreateInstallmentTemplateAsync:
//   Decimal mode: Math.Round(value, 2, MidpointRounding.AwayFromZero)
//   Last installment absorbs the rounding remainder.
//
// Per the approved two-decimal requirement, all calculations use
// Math.round(value * 100) / 100 (equivalent to AwayFromZero at 2 places).

import type {
  FeeLine,
  Installment,
  PaymentSchedule,
  TaxConfig,
  AdjustmentOption,
} from "./paymentTypes";
import { DEFAULT_TAX_PERCENTAGE } from "./paymentConstants";

// ─── Rounding (two decimal places, AwayFromZero) ───────────────────────────────
export const round2 = (value: number): number => {
  return Math.round(value * 100 + Number.EPSILON) / 100;
};

// ─── Tax Amount Calculation ────────────────────────────────────────────────────
// Preserves existing IncludingTax / ExcludingTax logic from course/subject config.
// If includingTax=true:  Tax_Amt = Basic_Amt - (Basic_Amt / (1 + Tax_Per/100))
// If includingTax=false: Tax_Amt = Basic_Amt * Tax_Per / 100
export const calculateTaxAmount = (
  basicAmount: number,
  discountAmount: number,
  taxConfig: TaxConfig,
): number => {
  if (!taxConfig.taxable || taxConfig.taxPercentage <= 0) return 0;

  const taxableBase = round2(basicAmount - discountAmount);
  const rate = taxConfig.taxPercentage / 100;

  if (taxConfig.includingTax) {
    // Tax is included in the basic amount
    return round2(taxableBase - round2(taxableBase / (1 + rate)));
  }
  // Tax is exclusive (added on top)
  return round2(taxableBase * rate);
};

// ─── Net Amount (existing formula) ─────────────────────────────────────────────
export const calculateNetAmount = (
  basicAmount: number,
  discountAmount: number,
  taxAmount: number,
): number => {
  return round2(round2(basicAmount - discountAmount) + taxAmount);
};

// ─── Fee Line Totals ───────────────────────────────────────────────────────────
export const calculateFeeLine = (
  name: string,
  basicAmount: number,
  discountAmount: number,
  taxConfig: TaxConfig,
  id?: string,
  type?: FeeLine["type"],
  code?: string,
  feesType?: string,
): FeeLine => {
  const taxAmount = calculateTaxAmount(basicAmount, discountAmount, taxConfig);
  const netAmount = calculateNetAmount(basicAmount, discountAmount, taxAmount);

  return {
    id: id || `${type}-${code}-${Date.now()}`,
    type: type || "Subject",
    code: code || "",
    name,
    basicAmount: round2(basicAmount),
    discountAmount: round2(discountAmount),
    taxConfig,
    taxAmount,
    netAmount,
    feesType,
  };
};

// ─── Total Payable (sum of all fee line net amounts) ───────────────────────────
export const calculateTotalPayable = (feeLines: FeeLine[]): number => {
  return round2(feeLines.reduce((sum, line) => sum + line.netAmount, 0));
};

// ─── Installment Equal Distribution ────────────────────────────────────────────
// Follows existing backend: all installments get equal share (rounded to 2 dp),
// last installment absorbs the remainder so the total matches exactly.
export const distributeEqually = (
  totalAmount: number,
  installmentCount: number,
): number[] => {
  if (installmentCount <= 0) return [];
  if (installmentCount === 1) return [round2(totalAmount)];

  const amounts: number[] = [];
  let distributed = 0;

  for (let i = 0; i < installmentCount - 1; i++) {
    const amount = round2(totalAmount / installmentCount);
    amounts.push(amount);
    distributed = round2(distributed + amount);
  }

  // Last installment absorbs the remainder
  const lastAmount = round2(totalAmount - distributed);
  amounts.push(lastAmount);

  return amounts;
};

// ─── Verify Installment Sum Matches Payable ────────────────────────────────────
export const verifyInstallmentSum = (
  installments: Installment[],
  totalPayable: number,
): boolean => {
  const sum = round2(
    installments.reduce((acc, inst) => acc + inst.netAmount, 0),
  );
  return sum === round2(totalPayable);
};

// ─── Adjustment: Distribute Difference Equally ─────────────────────────────────
export const adjustDistributeEqually = (
  installments: Installment[],
  difference: number,
  startIndex: number = 0,
): Installment[] => {
  const adjustable = installments.slice(startIndex);
  if (adjustable.length === 0) return installments;

  const perInstallment = round2(difference / adjustable.length);
  let remaining = round2(difference - perInstallment * (adjustable.length - 1));

  return installments.map((inst, idx) => {
    if (idx < startIndex) return inst;
    const isLast = idx === installments.length - 1;
    const addition = isLast ? remaining : perInstallment;
    remaining = round2(remaining - perInstallment);
    return {
      ...inst,
      basicAmount: round2(inst.basicAmount + addition),
      netAmount: round2(inst.netAmount + addition),
    };
  });
};

// ─── Adjustment: In Next Installment ───────────────────────────────────────────
export const adjustInNext = (
  installments: Installment[],
  difference: number,
  currentIndex: number,
): Installment[] => {
  const nextIndex = currentIndex + 1;
  if (nextIndex >= installments.length) return installments;

  return installments.map((inst, idx) => {
    if (idx !== nextIndex) return inst;
    return {
      ...inst,
      basicAmount: round2(inst.basicAmount + difference),
      netAmount: round2(inst.netAmount + difference),
    };
  });
};

// ─── Adjustment: In Last Installment ───────────────────────────────────────────
export const adjustInLast = (
  installments: Installment[],
  difference: number,
): Installment[] => {
  if (installments.length === 0) return installments;
  const lastIdx = installments.length - 1;

  return installments.map((inst, idx) => {
    if (idx !== lastIdx) return inst;
    return {
      ...inst,
      basicAmount: round2(inst.basicAmount + difference),
      netAmount: round2(inst.netAmount + difference),
    };
  });
};

// ─── Adjustment: In New Installment ────────────────────────────────────────────
export const adjustInNewInstallment = (
  installments: Installment[],
  difference: number,
  dueDate: string,
): Installment[] => {
  const newNo = installments.length + 1;
  const newInstallment: Installment = {
    id: `inst-${Date.now()}`,
    installmentNo: newNo,
    dueDate,
    basicAmount: round2(difference),
    discountAmount: 0,
    taxPercentage: 0,
    taxAmount: 0,
    netAmount: round2(difference),
    paidAmount: 0,
    outstandingAmount: round2(difference),
    status: "Pending",
    remarks: "",
  };

  return [...installments, newInstallment];
};

// ─── Apply Adjustment ──────────────────────────────────────────────────────────
export const applyAdjustment = (
  installments: Installment[],
  option: AdjustmentOption,
  difference: number,
  currentIndex: number,
  newDueDate?: string,
): Installment[] => {
  switch (option) {
    case "DistributeEqually":
      return adjustDistributeEqually(installments, difference, currentIndex + 1);
    case "InNext":
      return adjustInNext(installments, difference, currentIndex);
    case "InLast":
      return adjustInLast(installments, difference);
    case "InNewInstallment":
      return adjustInNewInstallment(installments, difference, newDueDate || "");
    case "InsertNew":
      return adjustInNewInstallment(installments, difference, newDueDate || "");
    default:
      return installments;
  }
};

// ─── Schedule Totals ───────────────────────────────────────────────────────────
export const calculateScheduleTotals = (schedule: PaymentSchedule): PaymentSchedule => {
  const totalPayable = calculateTotalPayable(schedule.feeLines);
  const totalPaid = round2(
    schedule.installments.reduce((sum, inst) => sum + inst.paidAmount, 0),
  );
  const totalOutstanding = round2(totalPayable - totalPaid);
  const totalDiscount = round2(
    schedule.feeLines.reduce((sum, line) => sum + line.discountAmount, 0),
  );
  const totalTax = round2(
    schedule.feeLines.reduce((sum, line) => sum + line.taxAmount, 0),
  );
  const totalNetAmount = round2(
    schedule.feeLines.reduce((sum, line) => sum + line.netAmount, 0),
  );

  return {
    ...schedule,
    totalPayable,
    totalPaid,
    totalOutstanding,
    totalDiscount,
    totalTax,
    totalNetAmount,
  };
};

// ─── Adhoc Remaining Balance ───────────────────────────────────────────────────
// After a partial collection, the remaining balance becomes the next Adhoc installment.
export const calculateAdhocRemainingBalance = (schedule: PaymentSchedule): number => {
  return round2(schedule.totalPayable - schedule.totalPaid);
};

// ─── Installment Outstanding ───────────────────────────────────────────────────
export const calculateInstallmentOutstanding = (inst: Installment): Installment => {
  const outstanding = round2(inst.netAmount - inst.paidAmount);
  let status = inst.status;

  if (outstanding <= 0 && inst.paidAmount > 0) {
    status = "Paid";
  } else if (inst.paidAmount > 0 && outstanding > 0) {
    status = "PartiallyPaid";
  } else if (outstanding > 0 && inst.paidAmount === 0) {
    // Keep existing status (Pending or Overdue) — don't override
    if (status !== "Cancelled") status = status === "Overdue" ? "Overdue" : "Pending";
  }

  return {
    ...inst,
    outstandingAmount: outstanding,
    status,
  };
};

// ─── Format Currency ───────────────────────────────────────────────────────────
export const formatCurrency = (amount: number, symbol: string = "₹"): string => {
  return `${symbol}${round2(amount).toFixed(2)}`;
};

// ─── Tax Config Helper ─────────────────────────────────────────────────────────
export const createTaxConfig = (
  taxable: boolean,
  includingTax: boolean,
  taxPercentage: number = DEFAULT_TAX_PERCENTAGE,
  hsncode: string = "",
): TaxConfig => ({
  taxable,
  includingTax,
  taxPercentage,
  hsncode,
});
