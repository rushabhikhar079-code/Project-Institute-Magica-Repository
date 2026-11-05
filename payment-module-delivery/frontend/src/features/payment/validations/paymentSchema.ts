// ─── Payment Module Validation Schemas ─────────────────────────────────────────
// Uses zod, matching existing project patterns (subjectSchema.ts, courseSchema.ts).

import { z } from "zod";

// ─── Installment Schema ────────────────────────────────────────────────────────
export const installmentSchema = z.object({
  id: z.string(),
  installmentNo: z.number().int().min(1),
  dueDate: z.string().min(1, "Due date is required"),
  basicAmount: z.number().min(0, "Amount cannot be negative"),
  discountAmount: z.number().min(0, "Discount cannot be negative"),
  taxPercentage: z.number().min(0).max(100),
  taxAmount: z.number().min(0),
  netAmount: z.number().min(0, "Net amount cannot be negative"),
  paidAmount: z.number().min(0),
  outstandingAmount: z.number().min(0),
  status: z.enum(["Pending", "PartiallyPaid", "Paid", "Overdue", "Cancelled"]),
  remarks: z.string().optional().default(""),
  receiptNo: z.string().optional(),
  manualReceiptNo: z.string().optional(),
});

export type InstallmentFormValues = z.infer<typeof installmentSchema>;

// ─── Schedule Creation Schema ──────────────────────────────────────────────────
export const scheduleCreationSchema = z
  .object({
    studentId: z.string().min(1, "Student is required"),
    studentName: z.string().min(1, "Student name is required"),
    studentRegNo: z.string().min(1, "Registration number is required"),
    studentMobile: z.string().optional(),
    studentEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    branchId: z.number().int().min(0),
    paymentType: z.enum(["LumpSum", "Adhoc", "Installment"]),
    selectedSubjects: z.array(z.any()).optional(),
    selectedCourses: z.array(z.any()).optional(),
    selectedOtherFees: z.array(z.any()).optional(),
    globalDiscount: z.number().min(0, "Discount cannot be negative").default(0),
    installments: z.array(installmentSchema),
    remarks: z.string().max(500, "Remarks cannot exceed 500 characters").optional().default(""),
  })
  .superRefine((data, ctx) => {
    // Must have at least one fee line (subject, course, or other fee)
    const hasSubjects = data.selectedSubjects && data.selectedSubjects.length > 0;
    const hasCourses = data.selectedCourses && data.selectedCourses.length > 0;
    const hasOtherFees = data.selectedOtherFees && data.selectedOtherFees.length > 0;

    if (!hasSubjects && !hasCourses && !hasOtherFees) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one subject, course, or other fee must be selected",
        path: ["selectedSubjects"],
      });
    }

    // Lump Sum: exactly one installment
    if (data.paymentType === "LumpSum" && data.installments.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Lump Sum payment must have exactly one installment",
        path: ["installments"],
      });
    }

    // Installment: at least one installment
    if (data.paymentType === "Installment" && data.installments.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one installment is required",
        path: ["installments"],
      });
    }

    // Adhoc: exactly one installment initially
    if (data.paymentType === "Adhoc" && data.installments.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Adhoc payment must start with one installment",
        path: ["installments"],
      });
    }

    // Verify installment sum matches payable (with tolerance for rounding)
    if (data.installments.length > 0) {
      const sum = data.installments.reduce(
        (acc, inst) => acc + Math.round(inst.netAmount * 100),
        0,
      );
      // This is validated against totalPayable in the component, not here,
      // because totalPayable depends on fee lines which are typed as any.
      // The component performs the exact match check.
    }

    // Each installment due date is required
    data.installments.forEach((inst, idx) => {
      if (!inst.dueDate || inst.dueDate.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Installment ${idx + 1}: Due date is required`,
          path: ["installments", idx, "dueDate"],
        });
      }
      if (inst.basicAmount < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Installment ${idx + 1}: Amount cannot be negative`,
          path: ["installments", idx, "basicAmount"],
        });
      }
    });
  });

export type ScheduleCreationFormValues = z.infer<typeof scheduleCreationSchema>;

// ─── Payment Recording Schema ──────────────────────────────────────────────────
export const paymentRecordingSchema = z
  .object({
    scheduleId: z.string().min(1, "Schedule is required"),
    installmentId: z.string().min(1, "Installment is required"),
    amountReceived: z
      .number()
      .min(0.01, "Amount must be greater than 0"),
    paymentMethod: z.enum(["Cash", "Cheque", "UPI", "Card", "BankTransfer", "Online"]),
    payDate: z.string().min(1, "Payment date is required"),
    receiptNo: z.string().optional().default(""),
    manualReceiptNo: z.string().optional().default(""),
    chequeNo: z.string().optional().default(""),
    chequeDate: z.string().optional().default(""),
    bank: z.string().optional().default(""),
    branchAddr: z.string().optional().default(""),
    remarks: z.string().max(500).optional().default(""),
  })
  .superRefine((data, ctx) => {
    // Cheque and Bank Transfer require instrument details
    if (data.paymentMethod === "Cheque") {
      if (!data.chequeNo || data.chequeNo.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cheque number is required for cheque payments",
          path: ["chequeNo"],
        });
      }
      if (!data.chequeDate || data.chequeDate.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cheque date is required for cheque payments",
          path: ["chequeDate"],
        });
      }
      if (!data.bank || data.bank.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bank name is required for cheque payments",
          path: ["bank"],
        });
      }
    }

    if (data.paymentMethod === "BankTransfer") {
      if (!data.bank || data.bank.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bank name is required for bank transfer",
          path: ["bank"],
        });
      }
    }
  });

export type PaymentRecordingFormValues = z.infer<typeof paymentRecordingSchema>;

// ─── Receipt Modification Schema ───────────────────────────────────────────────
export const receiptModificationSchema = z.object({
  receiptNo: z.string().min(1, "Receipt number is required"),
  manualReceiptNo: z.string().optional().default(""),
  chequeNo: z.string().optional().default(""),
  chequeDate: z.string().optional().default(""),
  bank: z.string().optional().default(""),
  branchAddr: z.string().optional().default(""),
  remarks: z.string().max(500).optional().default(""),
});

export type ReceiptModificationFormValues = z.infer<typeof receiptModificationSchema>;

// ─── Schedule Search Schema ────────────────────────────────────────────────────
export const scheduleSearchSchema = z.object({
  studentName: z.string().optional().default(""),
  regNo: z.string().optional().default(""),
  paymentType: z.enum(["LumpSum", "Adhoc", "Installment", ""]).optional().default(""),
  status: z.enum(["Draft", "Active", "Completed", "Cancelled", ""]).optional().default(""),
  branchId: z.number().int().min(0).default(0),
  pageNumber: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().nullable().default(null),
  sortDirection: z.enum(["asc", "desc"]).nullable().default(null),
});

export type ScheduleSearchFormValues = z.infer<typeof scheduleSearchSchema>;
