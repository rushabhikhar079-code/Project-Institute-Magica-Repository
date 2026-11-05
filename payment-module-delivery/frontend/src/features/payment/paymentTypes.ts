// ─── Payment Module Types ─────────────────────────────────────────────────────
// Based on existing backend tables: payment, payment_installments,
// installments_received, payments_received, refund, otherfees, direct_payment.
// Preserves existing field naming conventions (Basic_Amt, Disc_Amt, Tax_Amt, Tax_Per).

// ─── Payment Types (approved: only three) ─────────────────────────────────────
export type PaymentType = "LumpSum" | "Adhoc" | "Installment";

// ─── Payment Method (from existing mock UI + receipt schema) ──────────────────
export type PaymentMethod = "Cash" | "Cheque" | "UPI" | "Card" | "BankTransfer" | "Online";

// ─── Schedule / Installment Status ─────────────────────────────────────────────
// Existing SQL: paid = receipt_no IS NOT NULL; outstanding = receipt_no IS NULL
export type InstallmentStatus = "Pending" | "PartiallyPaid" | "Paid" | "Overdue" | "Cancelled";

export type ScheduleStatus = "Draft" | "Active" | "Completed" | "Cancelled";

// ─── Adjustment Options (from Adobe XD) ────────────────────────────────────────
export type AdjustmentOption =
  | "DistributeEqually"
  | "InNext"
  | "InLast"
  | "InNewInstallment"
  | "InsertNew";

// ─── Tax Configuration (from existing course/subject flags) ────────────────────
export interface TaxConfig {
  taxable: boolean;
  includingTax: boolean;
  taxPercentage: number; // Tax_Per — stored on payment records; source requires backend API
  hsncode: string;
}

// ─── Fee Line (course, subject, or other fee) ──────────────────────────────────
export interface FeeLine {
  id: string;
  type: "Course" | "Subject" | "OtherFee";
  code: string; // subId, courseId, or of_code
  name: string;
  basicAmount: number; // Basic_Amt
  discountAmount: number; // Disc_Amt
  taxConfig: TaxConfig;
  taxAmount: number; // Tax_Amt — computed
  netAmount: number; // (Basic_Amt - Disc_Amt) + Tax_Amt
  feesType?: string; // 'S', 'M', 'H', 'Other'
}

// ─── Installment Row (maps to payment_installments table) ──────────────────────
export interface Installment {
  id: string;
  installmentNo: number; // Installment_No
  dueDate: string; // Installment_Date (dd/MM/yyyy)
  basicAmount: number; // Basic_Amt
  discountAmount: number; // Disc_Amt
  taxPercentage: number; // Tax_Per
  taxAmount: number; // Tax_Amt
  netAmount: number; // (Basic_Amt - Disc_Amt) + Tax_Amt
  paidAmount: number; // sum of received amounts
  outstandingAmount: number; // netAmount - paidAmount
  status: InstallmentStatus;
  remarks: string; // Remarks
  receiptNo?: string; // Receipt_No from installments_received
  manualReceiptNo?: string; // Manual_ReceiptNo
}

// ─── Receipt / Collection (maps to installments_received / payments_received) ──
export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  manualReceiptNo: string;
  installmentId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  payDate: string; // Pay_Date (dd/MM/yyyy)
  chequeNo: string; // Cheque_No
  chequeDate: string; // Cheque_Date
  bank: string; // Bank
  branchAddr: string; // Branch_Addr
  remarks: string;
  collectedBy: string;
}

// ─── Payment Schedule (maps to payment table) ──────────────────────────────────
export interface PaymentSchedule {
  id: string;
  studentId: string; // Stud_Id (RegNo)
  studentName: string;
  studentRegNo: string;
  studentMobile: string;
  studentEmail: string;
  branchId: number;
  paymentType: PaymentType;
  status: ScheduleStatus;
  feeLines: FeeLine[];
  installments: Installment[];
  totalPayable: number; // sum of fee line net amounts
  totalPaid: number;
  totalOutstanding: number;
  totalDiscount: number;
  totalTax: number;
  totalNetAmount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ─── Student Search (reuses existing /Student/search_students) ─────────────────
export interface StudentSearchRequest {
  listType: "Registration" | "Enquiry" | "";
  studentName: string;
  reg: string;
  phone: string;
  regFrDate: string;
  regToDate: string;
  status: number;
  branchId: number;
  pageNumber: number;
  pageSize: number;
  sortBy: string | null;
  sortDirection: "asc" | "desc" | null;
}

export interface StudentSearchResult {
  RegNo: string;
  Name: string;
  PContact: string;
  EmailId: string;
  RegNo_Manual: string;
  RegDate: string;
  BranchId: number;
  CourseNames: string;
  SubjectNames: string;
}

export interface StudentSearchResponse {
  items: StudentSearchResult[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// ─── Other Fee (reuses existing /Common/other-fees) ────────────────────────────
export interface OtherFee {
  of_code: number;
  of_name: string;
  amount: number;
  istaxable: number;
  isincluding: number;
  of_FrequencyName: string;
}

// ─── Subject Fee Info (from existing course/subject configuration) ─────────────
export interface SubjectFeeInfo {
  subId: number;
  subName: string;
  courseName: string;
  fees: number;
  taxable: boolean;
  includingTax: boolean;
  hsncode: string;
  feesType: string;
  allowInstallment: boolean;
  maxInstallment: number;
  adhocSub: number;
  allowProrated: boolean;
}

// ─── Course Fee Info ───────────────────────────────────────────────────────────
export interface CourseFeeInfo {
  courseId: number;
  courseName: string;
  courseFees: number;
  taxable: boolean;
  includingTax: boolean;
  hsncode: string;
  allowInstallment: boolean;
  maxInstallment: number;
  adhocCourse: number;
}

// ─── Payment Link (Email / WhatsApp) ───────────────────────────────────────────
export interface PaymentLinkRequest {
  scheduleId: string;
  channel: "Email" | "WhatsApp";
  recipient: string;
  studentName: string;
  amount: number;
}

export interface PaymentLinkResult {
  success: boolean;
  channel: "Email" | "WhatsApp";
  message: string;
  delivered: boolean; // false = not actually sent (backend dependency)
}

// ─── Schedule Creation Form Data ───────────────────────────────────────────────
export interface ScheduleCreationForm {
  studentId: string;
  studentName: string;
  studentRegNo: string;
  studentMobile: string;
  studentEmail: string;
  branchId: number;
  paymentType: PaymentType;
  selectedSubjects: SubjectFeeInfo[];
  selectedCourses: CourseFeeInfo[];
  selectedOtherFees: OtherFee[];
  globalDiscount: number;
  installments: Installment[];
  remarks: string;
}

// ─── Payment Recording Form ────────────────────────────────────────────────────
export interface PaymentRecordingForm {
  scheduleId: string;
  installmentId: string;
  amountReceived: number;
  paymentMethod: PaymentMethod;
  payDate: string;
  receiptNo: string;
  manualReceiptNo: string;
  chequeNo: string;
  chequeDate: string;
  bank: string;
  branchAddr: string;
  remarks: string;
}

// ─── API Response wrapper (matches existing ApiResponse<T>) ────────────────────
export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  timeStamp: string;
  error: string | null;
  data: T;
}

// ─── Pagination (matches existing PaginationRequest / PagedResponse<T>) ────────
export interface PaymentSearchRequest {
  studentName: string;
  regNo: string;
  paymentType: PaymentType | "";
  status: ScheduleStatus | "";
  branchId: number;
  pageNumber: number;
  pageSize: number;
  sortBy: string | null;
  sortDirection: "asc" | "desc" | null;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
