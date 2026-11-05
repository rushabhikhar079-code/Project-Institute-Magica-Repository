// ─── Payment Module Constants ──────────────────────────────────────────────────
import type { PaymentType, PaymentMethod, InstallmentStatus, ScheduleStatus } from "./paymentTypes";

// ─── Brand Color (from existing project: #0F4C81) ──────────────────────────────
export const BRAND_COLOR = "#0F4C81";
export const BRAND_COLOR_LIGHT = "#e0eef5";
export const BRAND_COLOR_DARK = "#083b65";

// ─── Payment Types (only three approved) ───────────────────────────────────────
export const PAYMENT_TYPES: { value: PaymentType; label: string; description: string }[] = [
  {
    value: "LumpSum",
    label: "Lump Sum",
    description: "Single payment for the full payable amount",
  },
  {
    value: "Adhoc",
    label: "Adhoc",
    description: "Flexible collection with automatic balance carry-forward",
  },
  {
    value: "Installment",
    label: "Installment",
    description: "Custom installment schedule with manual dates and amounts",
  },
];

// Monthly and Quarterly are NOT separate payment types.
// They may appear as convenience options inside Installment creation only.

// ─── Payment Methods (union of existing mock values) ───────────────────────────
export const PAYMENT_METHODS: { value: PaymentMethod; label: string; requiresInstrument: boolean }[] = [
  { value: "Cash", label: "Cash", requiresInstrument: false },
  { value: "Cheque", label: "Cheque", requiresInstrument: true },
  { value: "UPI", label: "UPI", requiresInstrument: false },
  { value: "Card", label: "Card", requiresInstrument: false },
  { value: "BankTransfer", label: "Bank Transfer", requiresInstrument: true },
  { value: "Online", label: "Online", requiresInstrument: false },
];

// ─── Installment Status ────────────────────────────────────────────────────────
export const INSTALLMENT_STATUS: { value: InstallmentStatus; label: string; color: string }[] = [
  { value: "Pending", label: "Pending", color: "#6b7280" },
  { value: "PartiallyPaid", label: "Partially Paid", color: "#f59e0b" },
  { value: "Paid", label: "Paid", color: "#16a34a" },
  { value: "Overdue", label: "Overdue", color: "#dc2626" },
  { value: "Cancelled", label: "Cancelled", color: "#9ca3af" },
];

// ─── Schedule Status ───────────────────────────────────────────────────────────
export const SCHEDULE_STATUS: { value: ScheduleStatus; label: string; color: string }[] = [
  { value: "Draft", label: "Draft", color: "#6b7280" },
  { value: "Active", label: "Active", color: "#0F4C81" },
  { value: "Completed", label: "Completed", color: "#16a34a" },
  { value: "Cancelled", label: "Cancelled", color: "#9ca3af" },
];

// ─── Adjustment Options (from Adobe XD) ────────────────────────────────────────
export const ADJUSTMENT_OPTIONS = [
  { value: "DistributeEqually", label: "Settle difference equally in remaining installments" },
  { value: "InNext", label: "Settle difference in the next installment" },
  { value: "InLast", label: "Settle difference in the last installment" },
  { value: "InNewInstallment", label: "Settle difference in a new installment" },
  { value: "InsertNew", label: "Insert a new installment" },
] as const;

// ─── Fees Type codes (from existing backend) ───────────────────────────────────
export const FEES_TYPE = {
  SUBJECTWISE: "S",
  MONTHLY: "M",
  HOURLY: "H",
  OTHER: "Other",
} as const;

// ─── Other Fee Frequency (from existing backend) ───────────────────────────────
export const OTHER_FEE_FREQUENCY = {
  ONE_TIME: 1,
  MONTHLY: 2,
  ADHOC: 3,
} as const;

// ─── Default Tax Percentage ────────────────────────────────────────────────────
// NOTE: Tax_Per source API does not exist. This default is used only when the
// fee configuration does not carry a rate. The real rate must come from a
// backend API or course/subject configuration (see api-contracts/tax-percentage.md).
export const DEFAULT_TAX_PERCENTAGE = 0;

// ─── Currency ──────────────────────────────────────────────────────────────────
export const CURRENCY_SYMBOL = "₹";
export const DECIMAL_PLACES = 2;

// ─── Page Routes ───────────────────────────────────────────────────────────────
export const PAYMENT_ROUTES = {
  MANAGE_PAYMENTS: "payment/manage",
  SCHEDULE_OVERVIEW: "payment/schedules",
  CREATE_SCHEDULE: "payment/create-schedule",
  PAYMENT_RECORDING: "payment/record-payment",
  PAYMENT_HISTORY: "payment/history",
} as const;

// ─── Page Size Options ─────────────────────────────────────────────────────────
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;
