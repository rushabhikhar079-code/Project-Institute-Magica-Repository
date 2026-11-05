// ─── Payment Module Service Layer ──────────────────────────────────────────────
//
// This service has TWO layers:
// 1. Real API calls — reuse existing backend endpoints where available
//    (student search, other-fees, installment templates).
// 2. Mock calls — for operations with no backend endpoint.
//    These return in-memory data and do NOT persist across reloads.
//
// When backend endpoints become available, replace the mock functions
// with real API calls. See api-contracts/ for the required contracts.

import api from "../../../services/api";
import type {
  PaymentSchedule,
  StudentSearchRequest,
  StudentSearchResponse,
  StudentSearchResult,
  OtherFee,
  SubjectFeeInfo,
  CourseFeeInfo,
  PaymentReceipt,
  PaymentRecordingForm,
  ScheduleCreationForm,
  PaymentLinkRequest,
  PaymentLinkResult,
  PaymentSearchRequest,
  PagedResponse,
  ApiResponse,
  Installment,
  AdjustmentOption,
} from "./paymentTypes";
import {
  getMockSchedules,
  setMockSchedules,
  getMockReceipts,
  setMockReceipts,
  mockStudents,
  mockOtherFees,
  mockSubjects,
  mockCourses,
  resetMockStore,
} from "./paymentMockData";
import {
  calculateScheduleTotals,
  calculateInstallmentOutstanding,
  calculateAdhocRemainingBalance,
  distributeEqually,
  round2,
} from "./paymentCalculations";

// ─── Simulated delay for mock calls ────────────────────────────────────────────
const mockDelay = (ms: number = 400): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ═══════════════════════════════════════════════════════════════════════════════
// REAL API CALLS (existing backend endpoints)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Student Search ────────────────────────────────────────────────────────────
// Reuses existing endpoint: POST /Student/search_students
export const searchStudents = async (
  payload: StudentSearchRequest,
): Promise<StudentSearchResponse> => {
  const response = await api.post("/Student/search_students", payload, {
    showLoader: false,
  });

  const data = response.data.data;
  return {
    ...data,
    items: (data.items ?? []).map((item: any): StudentSearchResult => ({
      RegNo: item.regNo ?? "",
      Name: item.name ?? "",
      PContact: item.pContact ?? "",
      EmailId: item.emailId ?? "",
      RegNo_Manual: item.regNo_Manual ?? "",
      RegDate: item.regDate ?? "",
      BranchId: item.branchId ?? 0,
      CourseNames: item.courseNames ?? "-",
      SubjectNames: item.subjectNames ?? "-",
    })),
  };
};

// ─── Other Fees ────────────────────────────────────────────────────────────────
// Reuses existing endpoint: GET /Common/other-fees?instituteId=&branchId=
export const getOtherFees = async (
  instituteId: number,
  branchId: number,
): Promise<OtherFee[]> => {
  const response = await api.get("/Common/other-fees", {
    params: { instituteId, branchId },
  });
  return response.data.data ?? [];
};

// ─── Subject Installment Template (interval days) ─────────────────────────────
// Reuses existing endpoint: POST /Subject/set-interval-days
export const generateSubjectIntervalTemplate = async (
  courseFee: number,
  maxInstallment: number,
  day: number,
  branchId: number,
): Promise<{ templates: { srNo: number; dayOfMonth: number; amount: number }[]; totalAmount: number }> => {
  const response = await api.post(
    "/Subject/set-interval-days",
    { CourseFee: courseFee, MaxInstallment: maxInstallment, Day: day, BranchId: branchId },
    { showLoader: false },
  );
  return response.data.data;
};

// ─── Subject Installment Template (monthly) ───────────────────────────────────
// Reuses existing endpoint: POST /Subject/set-monthly-interval
export const generateSubjectMonthlyTemplate = async (
  courseFee: number,
  maxInstallment: number,
  day: number,
  branchId: number,
): Promise<{ templates: { srNo: number; dayOfMonth: number; amount: number }[]; totalAmount: number }> => {
  const response = await api.post(
    "/Subject/set-monthly-interval",
    { CourseFee: courseFee, MaxInstallment: maxInstallment, Day: day, BranchId: branchId },
    { showLoader: false },
  );
  return response.data.data;
};

// ─── Subject Payment Template ─────────────────────────────────────────────────
// Reuses existing endpoint: GET /Subject/get-payment-template/{subjectId}
export const getSubjectPaymentTemplate = async (
  subjectId: number,
): Promise<{ paymentTemplateId: number; templateDetails: { noOfDay: number; amount: number }[] } | null> => {
  try {
    const response = await api.get(`/Subject/get-payment-template/${subjectId}`, {
      showLoader: false,
    });
    return response.data.data;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK API CALLS (no backend endpoint exists yet)
// These use in-memory data and reset on page reload.
// Replace with real API calls when backend endpoints are available.
// See api-contracts/payment-crud.md for required contracts.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Mock: Search Students (fallback when API is unavailable) ─────────────────
export const searchStudentsMock = async (
  request: StudentSearchRequest,
): Promise<StudentSearchResponse> => {
  await mockDelay();
  let filtered = [...mockStudents];

  if (request.studentName) {
    filtered = filtered.filter((s) =>
      s.Name.toLowerCase().includes(request.studentName.toLowerCase()),
    );
  }
  if (request.reg) {
    filtered = filtered.filter(
      (s) => s.RegNo.includes(request.reg) || s.RegNo_Manual.includes(request.reg),
    );
  }
  if (request.phone) {
    filtered = filtered.filter((s) => s.PContact.includes(request.phone));
  }

  const totalCount = filtered.length;
  const start = (request.pageNumber - 1) * request.pageSize;
  const items = filtered.slice(start, start + request.pageSize);
  const totalPages = Math.ceil(totalCount / request.pageSize) || 1;

  return {
    items,
    totalCount,
    pageNumber: request.pageNumber,
    pageSize: request.pageSize,
    totalPages,
    hasPrevious: request.pageNumber > 1,
    hasNext: request.pageNumber < totalPages,
  };
};

// ─── Mock: Get Other Fees ──────────────────────────────────────────────────────
export const getOtherFeesMock = async (): Promise<OtherFee[]> => {
  await mockDelay();
  return [...mockOtherFees];
};

// ─── Mock: Get Subjects with Fee Info ──────────────────────────────────────────
export const getSubjectsMock = async (): Promise<SubjectFeeInfo[]> => {
  await mockDelay();
  return [...mockSubjects];
};

// ─── Mock: Get Courses with Fee Info ───────────────────────────────────────────
export const getCoursesMock = async (): Promise<CourseFeeInfo[]> => {
  await mockDelay();
  return [...mockCourses];
};

// ─── Mock: Get Payment Schedules (list) ───────────────────────────────────────
export const getSchedulesMock = async (
  request: PaymentSearchRequest,
): Promise<PagedResponse<PaymentSchedule>> => {
  await mockDelay();
  let filtered = [...getMockSchedules()];

  if (request.studentName) {
    filtered = filtered.filter((s) =>
      s.studentName.toLowerCase().includes(request.studentName.toLowerCase()),
    );
  }
  if (request.regNo) {
    filtered = filtered.filter((s) =>
      s.studentRegNo.toLowerCase().includes(request.regNo.toLowerCase()),
    );
  }
  if (request.contactNo) {
    filtered = filtered.filter((s) => s.studentMobile.includes(request.contactNo || ""));
  }
  if (request.curriculum) {
    filtered = filtered.filter((s) => s.curriculum === request.curriculum);
  }
  if (request.course) {
    filtered = filtered.filter((s) => s.courseName.includes(request.course));
  }
  if (request.subject) {
    filtered = filtered.filter((s) => s.subjectNames.includes(request.subject));
  }
  if (request.paymentType) {
    filtered = filtered.filter((s) => s.paymentType === request.paymentType);
  }
  if (request.status) {
    filtered = filtered.filter((s) => s.status === request.status);
  }

  const totalCount = filtered.length;
  const start = (request.pageNumber - 1) * request.pageSize;
  const items = filtered.slice(start, start + request.pageSize);
  const totalPages = Math.ceil(totalCount / request.pageSize) || 1;

  return {
    items,
    totalCount,
    pageNumber: request.pageNumber,
    pageSize: request.pageSize,
    totalPages,
    hasPrevious: request.pageNumber > 1,
    hasNext: request.pageNumber < totalPages,
  };
};

// ─── Mock: Get Schedule by ID ──────────────────────────────────────────────────
export const getScheduleByIdMock = async (id: string): Promise<PaymentSchedule | null> => {
  await mockDelay();
  return getMockSchedules().find((s) => s.id === id) ?? null;
};

// ─── Mock: Create Schedule ─────────────────────────────────────────────────────
export const createScheduleMock = async (
  form: ScheduleCreationForm,
): Promise<PaymentSchedule> => {
  await mockDelay(600);

  const schedule: PaymentSchedule = {
    id: `sch-${Date.now()}`,
    studentId: form.studentId,
    studentName: form.studentName,
    studentRegNo: form.studentRegNo,
    studentMobile: form.studentMobile,
    studentEmail: form.studentEmail,
    branchId: form.branchId,
    curriculum: "",
    courseName: form.selectedCourses.map((c) => c.courseName).join(", "),
    subjectNames: form.selectedSubjects.map((s) => s.subName).join(", "),
    paymentType: form.paymentType,
    status: "Active",
    feeLines: form.feeLines,
    installments: form.installments,
    remarks: form.remarks,
    totalPayable: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    totalOutstandingWithoutTax: 0,
    totalDiscount: 0,
    totalTax: 0,
    totalNetAmount: 0,
    createdAt: new Date().toLocaleDateString("en-GB"),
    updatedAt: new Date().toLocaleDateString("en-GB"),
    createdBy: "Current User",
  };

  const withTotals = calculateScheduleTotals(schedule);
  const updatedInstallments = withTotals.installments.map(calculateInstallmentOutstanding);
  const finalSchedule = { ...withTotals, installments: updatedInstallments };

  setMockSchedules([...getMockSchedules(), finalSchedule]);
  return finalSchedule;
};

// ─── Mock: Update Schedule ─────────────────────────────────────────────────────
export const updateScheduleMock = async (
  id: string,
  updates: Partial<PaymentSchedule>,
): Promise<PaymentSchedule | null> => {
  await mockDelay(500);
  const schedules = getMockSchedules();
  const idx = schedules.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  const updated = { ...schedules[idx], ...updates, updatedAt: new Date().toLocaleDateString("en-GB") };
  const withTotals = calculateScheduleTotals(updated);
  schedules[idx] = withTotals;
  setMockSchedules(schedules);
  return withTotals;
};

// ─── Mock: Update Installment ──────────────────────────────────────────────────
export const updateInstallmentMock = async (
  scheduleId: string,
  installmentId: string,
  updates: Partial<Installment>,
): Promise<PaymentSchedule | null> => {
  await mockDelay(400);
  const schedules = getMockSchedules();
  const schedule = schedules.find((s) => s.id === scheduleId);
  if (!schedule) return null;

  const installments = schedule.installments.map((inst) => {
    if (inst.id !== installmentId) return inst;
    const updated = { ...inst, ...updates };
    return calculateInstallmentOutstanding(updated);
  });

  const updatedSchedule = calculateScheduleTotals({
    ...schedule,
    installments,
    updatedAt: new Date().toLocaleDateString("en-GB"),
  });

  const idx = schedules.findIndex((s) => s.id === scheduleId);
  schedules[idx] = updatedSchedule;
  setMockSchedules(schedules);
  return updatedSchedule;
};

// ─── Mock: Apply Schedule Adjustment ───────────────────────────────────────────
export const applyAdjustmentMock = async (
  scheduleId: string,
  installmentId: string,
  option: AdjustmentOption,
  difference: number,
  newDueDate?: string,
): Promise<PaymentSchedule | null> => {
  await mockDelay(400);
  const schedules = getMockSchedules();
  const schedule = schedules.find((s) => s.id === scheduleId);
  if (!schedule) return null;

  const idx = schedule.installments.findIndex((i) => i.id === installmentId);
  if (idx === -1) return null;

  // Dynamic import to avoid circular dependency
  const { applyAdjustment } = await import("./paymentCalculations");
  const adjusted = applyAdjustment(schedule.installments, option, difference, idx, newDueDate);
  const renumbered = adjusted.map((inst, i) => ({ ...inst, installmentNo: i + 1 }));

  const updatedSchedule = calculateScheduleTotals({
    ...schedule,
    installments: renumbered,
    updatedAt: new Date().toLocaleDateString("en-GB"),
  });

  const sIdx = schedules.findIndex((s) => s.id === scheduleId);
  schedules[sIdx] = updatedSchedule;
  setMockSchedules(schedules);
  return updatedSchedule;
};

// ─── Mock: Record Payment ──────────────────────────────────────────────────────
export const recordPaymentMock = async (
  form: PaymentRecordingForm,
): Promise<{ schedule: PaymentSchedule; receipt: PaymentReceipt }> => {
  await mockDelay(600);

  const schedules = getMockSchedules();
  const schedule = schedules.find((s) => s.id === form.scheduleId);
  if (!schedule) throw new Error("Schedule not found");

  const receipt: PaymentReceipt = {
    id: `rcp-${Date.now()}`,
    receiptNo: form.receiptNo || `RCP${Date.now().toString().slice(-6)}`,
    manualReceiptNo: form.manualReceiptNo,
    installmentId: form.installmentId,
    installmentName: schedule.installments.find((i) => i.id === form.installmentId)?.installmentName || "",
    studentName: schedule.studentName,
    paymentMethod: form.paymentMethod,
    amount: round2(form.amountReceived),
    payDate: form.payDate,
    receiptDate: form.receiptDate || form.payDate,
    chequeNo: form.chequeNo,
    chequeDate: form.chequeDate,
    bank: form.bank,
    branchAddr: form.branchAddr,
    remarks: form.remarks,
    collectedBy: "Current User",
  };

  // Update installment
  const installments = schedule.installments.map((inst) => {
    if (inst.id !== form.installmentId) return inst;
    const newPaid = round2(inst.paidAmount + form.amountReceived);
    return calculateInstallmentOutstanding({
      ...inst,
      paidAmount: newPaid,
      receiptNo: receipt.receiptNo,
      manualReceiptNo: receipt.manualReceiptNo,
    });
  });

  // For Adhoc: auto-create next installment if balance remains
  let finalInstallments = installments;
  if (schedule.paymentType === "Adhoc") {
    const updatedSchedule = calculateScheduleTotals({ ...schedule, installments });
    const remaining = calculateAdhocRemainingBalance(updatedSchedule);
    if (remaining > 0) {
      const lastNo = Math.max(...installments.map((i) => i.installmentNo));
      const nextInstallment: Installment = {
        id: `inst-${Date.now()}`,
        installmentNo: lastNo + 1,
        installmentName: `Adhoc-${lastNo + 1}`,
        dueDate: new Date().toLocaleDateString("en-GB"),
        basicAmount: remaining,
        discountAmount: 0,
        taxPercentage: 0,
        taxAmount: 0,
        netAmount: remaining,
        paidAmount: 0,
        outstandingAmount: remaining,
        outstandingWithoutTax: remaining,
        status: "Pending",
        remarks: "Auto-created from Adhoc remaining balance",
      };
      finalInstallments = [...installments, nextInstallment];
    }
  }

  const updatedSchedule = calculateScheduleTotals({
    ...schedule,
    installments: finalInstallments,
    updatedAt: new Date().toLocaleDateString("en-GB"),
  });

  const sIdx = schedules.findIndex((s) => s.id === form.scheduleId);
  schedules[sIdx] = updatedSchedule;
  setMockSchedules(schedules);
  setMockReceipts([...getMockReceipts(), receipt]);

  return { schedule: updatedSchedule, receipt };
};

// ─── Mock: Cancel Schedule ─────────────────────────────────────────────────────
// NOTE: This is a MOCK cancel — no backend cancellation API exists.
// In production, this should call a backend soft-delete / reversal endpoint.
export const cancelScheduleMock = async (id: string): Promise<PaymentSchedule | null> => {
  await mockDelay(400);
  return updateScheduleMock(id, { status: "Cancelled" });
};

// ─── Mock: Get Receipts for Schedule ───────────────────────────────────────────
export const getReceiptsByScheduleMock = async (
  scheduleId: string,
): Promise<PaymentReceipt[]> => {
  await mockDelay(300);
  const schedule = getMockSchedules().find((s) => s.id === scheduleId);
  if (!schedule) return [];
  const installmentIds = new Set(schedule.installments.map((i) => i.id));
  return getMockReceipts().filter((r) => installmentIds.has(r.installmentId));
};

// ─── Mock: Update Receipt ──────────────────────────────────────────────────────
// NOTE: No backend API exists for editing receipts. Mock only.
export const updateReceiptMock = async (
  receiptId: string,
  updates: Partial<PaymentReceipt>,
): Promise<PaymentReceipt | null> => {
  await mockDelay(400);
  const receipts = getMockReceipts();
  const idx = receipts.findIndex((r) => r.id === receiptId);
  if (idx === -1) return null;
  receipts[idx] = { ...receipts[idx], ...updates };
  setMockReceipts(receipts);
  return receipts[idx];
};

// ─── Mock: Send Payment Link ───────────────────────────────────────────────────
// Email service is functional in the backend (SMTP).
// WhatsApp send is NOT functional (Gupshup whitelist only, send is TODO).
// Payment-link generation does NOT exist (no payment gateway).
// This mock NEVER returns delivered=true unless a real backend confirms delivery.
export const sendPaymentLinkMock = async (
  request: PaymentLinkRequest,
): Promise<PaymentLinkResult> => {
  await mockDelay(500);

  if (request.channel === "Email") {
    // Email backend (EmailService.cs) is functional with SMTP.
    // However, no payment-link URL can be generated (no payment gateway).
    // A real email can be sent but without a clickable payment link.
    // Report as not delivered until backend endpoint + gateway are wired.
    return {
      success: false,
      channel: "Email",
      message: "Email service exists but payment-link generation requires a payment gateway integration. The email was not sent.",
      delivered: false,
    };
  }

  if (request.channel === "WhatsApp") {
    // WhatsApp backend (WhatsAppService.cs) only does Gupshup whitelist.
    // Message send is a TODO. Not delivered.
    return {
      success: false,
      channel: "WhatsApp",
      message: "WhatsApp message sending is not implemented (Gupshup send API is a TODO). The message was not delivered.",
      delivered: false,
    };
  }

  return {
    success: false,
    channel: request.channel,
    message: "Unknown channel.",
    delivered: false,
  };
};

// ─── Mock: Reset Store (for testing) ───────────────────────────────────────────
export const resetMockData = (): void => {
  resetMockStore();
};

// ─── Exported type for external use ────────────────────────────────────────────
export type {
  PaymentSchedule,
  PaymentReceipt,
  PaymentSearchRequest,
  PagedResponse,
  ApiResponse,
};
