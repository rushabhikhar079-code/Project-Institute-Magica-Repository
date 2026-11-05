// ─── Mock Data for Payment Module ──────────────────────────────────────────────
// Realistic test data for frontend-only phase. This data does NOT persist across
// reloads and does NOT represent saved database records. Replace mock service
// calls with real API integration when backend endpoints are available.
// See api-contracts/ for the required backend endpoints.

import type {
  PaymentSchedule,
  FeeLine,
  Installment,
  PaymentReceipt,
  StudentSearchResult,
  OtherFee,
  SubjectFeeInfo,
  CourseFeeInfo,
} from "./paymentTypes";
import { createTaxConfig, calculateFeeLine, calculateNetAmount, calculateTaxAmount, round2 } from "./paymentCalculations";
import { FEES_TYPE } from "./paymentConstants";

// ─── Other Fees (matches existing /Common/other-fees response) ────────────────
export const mockOtherFees: OtherFee[] = [
  { of_code: 1, of_name: "Registration Fee", amount: 500, istaxable: 0, isincluding: 0, of_FrequencyName: "One Time" },
  { of_code: 2, of_name: "Library Fee", amount: 300, istaxable: 0, isincluding: 0, of_FrequencyName: "Monthly" },
  { of_code: 3, of_name: "Lab Fee", amount: 1200, istaxable: 1, isincluding: 0, of_FrequencyName: "One Time" },
  { of_code: 4, of_name: "Exam Fee", amount: 800, istaxable: 0, isincluding: 0, of_FrequencyName: "Adhoc" },
  { of_code: 5, of_name: "Sports Fee", amount: 400, istaxable: 0, isincluding: 0, of_FrequencyName: "One Time" },
];

// ─── Subject Fee Info (matches existing subject configuration) ─────────────────
export const mockSubjects: SubjectFeeInfo[] = [
  {
    subId: 101, subName: "Mathematics", courseName: "JEE Main",
    fees: 16000, taxable: true, includingTax: false, hsncode: "999293",
    feesType: "S", allowInstallment: true, maxInstallment: 6, adhocSub: 0, allowProrated: false,
  },
  {
    subId: 102, subName: "Physics", courseName: "JEE Main",
    fees: 14000, taxable: true, includingTax: false, hsncode: "999293",
    feesType: "S", allowInstallment: true, maxInstallment: 4, adhocSub: 0, allowProrated: false,
  },
  {
    subId: 103, subName: "Chemistry", courseName: "JEE Main",
    fees: 12000, taxable: false, includingTax: false, hsncode: "",
    feesType: "S", allowInstallment: true, maxInstallment: 3, adhocSub: 1, allowProrated: false,
  },
  {
    subId: 104, subName: "Biology", courseName: "NEET",
    fees: 15000, taxable: true, includingTax: true, hsncode: "999293",
    feesType: "S", allowInstallment: true, maxInstallment: 5, adhocSub: 0, allowProrated: true,
  },
];

// ─── Course Fee Info ───────────────────────────────────────────────────────────
export const mockCourses: CourseFeeInfo[] = [
  {
    courseId: 201, courseName: "JEE Main Full Course",
    courseFees: 42000, taxable: true, includingTax: false, hsncode: "999293",
    allowInstallment: true, maxInstallment: 6, adhocCourse: 0,
  },
  {
    courseId: 202, courseName: "NEET Full Course",
    courseFees: 38000, taxable: true, includingTax: true, hsncode: "999293",
    allowInstallment: true, maxInstallment: 4, adhocCourse: 0,
  },
];

// ─── Student Search Results (matches existing /Student/search_students) ────────
export const mockStudents: StudentSearchResult[] = [
  { RegNo: "1001", Name: "Aarav Sharma", PContact: "9876543210", EmailId: "aarav@example.com", RegNo_Manual: "IM2024001", RegDate: "15/01/2024", BranchId: 1, CourseNames: "JEE Main", SubjectNames: "Mathematics, Physics", Curriculum: "CBSE", Status: "Active" },
  { RegNo: "1002", Name: "Diya Patel", PContact: "9876543211", EmailId: "diya@example.com", RegNo_Manual: "IM2024002", RegDate: "20/01/2024", BranchId: 1, CourseNames: "NEET", SubjectNames: "Biology, Chemistry", Curriculum: "CBSE", Status: "Active" },
  { RegNo: "1003", Name: "Arjun Reddy", PContact: "9876543212", EmailId: "arjun@example.com", RegNo_Manual: "IM2024003", RegDate: "05/02/2024", BranchId: 1, CourseNames: "JEE Main", SubjectNames: "Mathematics, Physics, Chemistry", Curriculum: "ICSE", Status: "Active" },
  { RegNo: "1004", Name: "Ananya Gupta", PContact: "9876543213", EmailId: "ananya@example.com", RegNo_Manual: "IM2024004", RegDate: "10/02/2024", BranchId: 1, CourseNames: "NEET", SubjectNames: "Biology", Curriculum: "CBSE", Status: "Active" },
  { RegNo: "1005", Name: "Vivaan Singh", PContact: "9876543214", EmailId: "vivaan@example.com", RegNo_Manual: "IM2024005", RegDate: "15/03/2024", BranchId: 1, CourseNames: "JEE Main", SubjectNames: "Mathematics", Curriculum: "State Board", Status: "Active" },
];

// ─── Mock Schedules ────────────────────────────────────────────────────────────
const createMockFeeLines = (): FeeLine[] => {
  const mathLine = calculateFeeLine(
    "Mathematics", 16000, 0,
    createTaxConfig(true, false, 0, "999293"),
    "Subject-101", "Subject", "101", FEES_TYPE.SUBJECTWISE,
  );
  const regLine = {
    ...calculateFeeLine(
      "Registration Fee", 500, 0,
      createTaxConfig(false, false, 0, ""),
      "OtherFee-1", "OtherFee", "1", FEES_TYPE.OTHER,
    ),
    frequency: mockOtherFees[0].of_FrequencyName,
  };
  const labLine = {
    ...calculateFeeLine(
      "Lab Fee", 1200, 0,
      createTaxConfig(true, false, 0, "999293"),
      "OtherFee-3", "OtherFee", "3", FEES_TYPE.OTHER,
    ),
    frequency: mockOtherFees[2].of_FrequencyName,
  };
  return [mathLine, regLine, labLine];
};

const createMockInstallments = (feeLines: FeeLine[]): Installment[] => {
  const total = feeLines.reduce((s, l) => s + l.netAmount, 0);
  const amounts = [round2(total / 3), round2(total / 3), round2(total - 2 * round2(total / 3))];

  return [
    {
      id: "inst-001", installmentNo: 1, installmentName: "Installment 1", dueDate: "15/01/2024",
      basicAmount: amounts[0], discountAmount: 0, taxPercentage: 0,
      taxAmount: 0, netAmount: amounts[0],
      paidAmount: round2(amounts[0] * 1.18), outstandingAmount: 0,
      outstandingWithoutTax: 0,
      status: "Paid", remarks: "First installment", receiptNo: "RCP001",
    },
    {
      id: "inst-002", installmentNo: 2, installmentName: "Installment 2", dueDate: "15/02/2024",
      basicAmount: amounts[1], discountAmount: 0, taxPercentage: 0,
      taxAmount: 0, netAmount: amounts[1],
      paidAmount: round2(amounts[1] * 0.5), outstandingAmount: round2(amounts[1] * 0.5),
      outstandingWithoutTax: round2(amounts[1] * 0.5),
      status: "PartiallyPaid", remarks: "",
    },
    {
      id: "inst-003", installmentNo: 3, installmentName: "Installment 3", dueDate: "15/03/2024",
      basicAmount: amounts[2], discountAmount: 0, taxPercentage: 0,
      taxAmount: 0, netAmount: amounts[2],
      paidAmount: 0, outstandingAmount: amounts[2],
      outstandingWithoutTax: round2(amounts[2]),
      status: "Pending", remarks: "",
    },
  ];
};

const createMockReceipts = (): PaymentReceipt[] => [
  {
    id: "rcp-001", receiptNo: "RCP001", manualReceiptNo: "M001",
    installmentId: "inst-001", installmentName: "Installment 1", studentName: "Aarav Sharma",
    paymentMethod: "Cash",
    amount: 7313.33, payDate: "14/01/2024", receiptDate: "14/01/2024",
    chequeNo: "", chequeDate: "", bank: "", branchAddr: "",
    remarks: "Cash payment", collectedBy: "Admin",
  },
  {
    id: "rcp-002", receiptNo: "RCP002", manualReceiptNo: "M002",
    installmentId: "inst-002", installmentName: "Installment 2", studentName: "Aarav Sharma",
    paymentMethod: "UPI",
    amount: 3656.67, payDate: "10/02/2024", receiptDate: "10/02/2024",
    chequeNo: "", chequeDate: "", bank: "", branchAddr: "",
    remarks: "Partial UPI payment", collectedBy: "Manager",
  },
];

const feeLines = createMockFeeLines();
const installments = createMockInstallments(feeLines);

const totalPayable = round2(feeLines.reduce((s, l) => s + l.netAmount, 0));
const totalPaid = round2(installments.reduce((s, i) => s + i.paidAmount, 0));

export const mockSchedules: PaymentSchedule[] = [
  {
    id: "sch-001",
    studentId: "1001", studentName: "Aarav Sharma",
    studentRegNo: "1001", studentManualRegNo: "IM2024001", studentStatus: "Active", studentMobile: "9876543210",
    studentEmail: "aarav@example.com",
    branchId: 1, curriculum: "CBSE", courseName: "JEE Main",
    subjectNames: "Mathematics, Physics",
    paymentType: "Installment", status: "Draft",
    feeLines, installments,
    totalPayable, totalPaid,
    totalOutstanding: round2(totalPayable - totalPaid),
    totalOutstandingWithoutTax: round2(
      feeLines.reduce((s, l) => s + l.basicAmount - l.discountAmount, 0) - totalPaid,
    ),
    totalDiscount: 0,
    totalTax: round2(feeLines.reduce((s, l) => s + l.taxAmount, 0)),
    totalNetAmount: totalPayable,
    createdAt: "10/01/2024", updatedAt: "10/02/2024",
    createdBy: "Admin",
  },
  {
    id: "sch-002",
    studentId: "1002", studentName: "Diya Patel",
    studentRegNo: "1002", studentManualRegNo: "IM2024002", studentStatus: "Active", studentMobile: "9876543211",
    studentEmail: "diya@example.com",
    branchId: 1, curriculum: "CBSE", courseName: "NEET",
    subjectNames: "Biology",
    paymentType: "LumpSum", status: "Completed",
    feeLines: [calculateFeeLine("Biology", 15000, 0, createTaxConfig(true, true, 0, "999293"), "Subject-104", "Subject", "104", FEES_TYPE.SUBJECTWISE)],
    installments: [{
      id: "inst-101", installmentNo: 1, installmentName: "Lump Sum", dueDate: "20/01/2024",
      basicAmount: 15000, discountAmount: 0, taxPercentage: 0,
      taxAmount: 0, netAmount: 15000,
      paidAmount: 15000, outstandingAmount: 0, outstandingWithoutTax: 0,
      status: "Paid", remarks: "Full payment", receiptNo: "RCP010",
    }],
    totalPayable: 15000, totalPaid: 15000, totalOutstanding: 0,
    totalOutstandingWithoutTax: 0,
    totalDiscount: 0, totalTax: round2(15000 - 15000 / 1.18),
    totalNetAmount: 15000,
    createdAt: "20/01/2024", updatedAt: "20/01/2024",
    createdBy: "Admin",
  },
  {
    id: "sch-003",
    studentId: "1003", studentName: "Arjun Reddy",
    studentRegNo: "1003", studentManualRegNo: "IM2024003", studentStatus: "Active", studentMobile: "9876543212",
    studentEmail: "arjun@example.com",
    branchId: 1, curriculum: "ICSE", courseName: "JEE Main",
    subjectNames: "Mathematics, Physics",
    paymentType: "Adhoc", status: "Active",
    feeLines: [
      calculateFeeLine("Mathematics", 16000, 0, createTaxConfig(true, false, 0, "999293"), "Subject-101", "Subject", "101", FEES_TYPE.SUBJECTWISE),
      calculateFeeLine("Physics", 14000, 0, createTaxConfig(true, false, 0, "999293"), "Subject-102", "Subject", "102", FEES_TYPE.SUBJECTWISE),
    ],
    installments: [{
      id: "inst-201", installmentNo: 1, installmentName: "Adhoc-1", dueDate: "05/02/2024",
      basicAmount: 30000, discountAmount: 0, taxPercentage: 0,
      taxAmount: 0, netAmount: 30000,
      paidAmount: 20000, outstandingAmount: 15400, outstandingWithoutTax: 10000,
      status: "PartiallyPaid", remarks: "Adhoc partial payment",
      receiptNo: "RCP020",
    }],
    totalPayable: 30000, totalPaid: 20000, totalOutstanding: 10000,
    totalOutstandingWithoutTax: 10000,
    totalDiscount: 0, totalTax: 0, totalNetAmount: 30000,
    createdAt: "05/02/2024", updatedAt: "05/02/2024",
    createdBy: "Manager",
  },
];

const createManageSchedule = (
  base: PaymentSchedule,
  overrides: Partial<PaymentSchedule>,
): PaymentSchedule => ({
  ...base,
  ...overrides,
  feeLines: base.feeLines.map((line) => ({ ...line })),
  installments: base.installments.map((installment) => ({ ...installment })),
});

const managePaymentSchedules: PaymentSchedule[] = [
  createManageSchedule(mockSchedules[0], {
    id: "sch-001", studentName: "Rushabh", studentRegNo: "REG/45", studentMobile: "84599865273",
    courseName: "IIT-JEE Foundation", status: "Draft", totalPayable: 6000, totalPaid: 0,
    totalOutstanding: 6000, totalOutstandingWithoutTax: 6000, totalNetAmount: 6000, totalTax: 0,
  }),
  createManageSchedule(mockSchedules[0], {
    id: "sch-002", studentName: "Rushabh", studentRegNo: "REG/45", studentMobile: "84599865273",
    courseName: "IIT-JEE Foundation", status: "Active", totalPayable: 6000, totalPaid: 0,
    totalOutstanding: 6000, totalOutstandingWithoutTax: 6000, totalNetAmount: 6000, totalTax: 0,
  }),
  createManageSchedule(mockSchedules[0], {
    id: "sch-003", studentName: "Rajesh", studentRegNo: "REG/45", studentMobile: "84599865273",
    courseName: "IIT-JEE Foundation", status: "Active", totalPayable: 6000, totalPaid: 0,
    totalOutstanding: 6000, totalOutstandingWithoutTax: 6000, totalNetAmount: 6000, totalTax: 0,
  }),
  createManageSchedule(mockSchedules[0], {
    id: "sch-004", studentName: "Priya", studentRegNo: "REG/45", studentMobile: "84599865273",
    courseName: "IIT-JEE Foundation", status: "Active", totalPayable: 6000, totalPaid: 0,
    totalOutstanding: 6000, totalOutstandingWithoutTax: 6000, totalNetAmount: 6000, totalTax: 0,
  }),
  createManageSchedule(mockSchedules[0], {
    id: "sch-005", studentName: "Ankul", studentRegNo: "REG/45", studentMobile: "84599865273",
    courseName: "IIT-JEE Foundation", status: "Active", totalPayable: 6000, totalPaid: 0,
    totalOutstanding: 6000, totalOutstandingWithoutTax: 6000, totalNetAmount: 6000, totalTax: 0,
  }),
  createManageSchedule(mockSchedules[0], {
    id: "sch-006", studentName: "Jayash", studentRegNo: "REG/45", studentMobile: "84599865273",
    courseName: "IIT-JEE Foundation", status: "Draft", totalPayable: 6000, totalPaid: 0,
    totalOutstanding: 6000, totalOutstandingWithoutTax: 6000, totalNetAmount: 6000, totalTax: 0,
  }),
  createManageSchedule(mockSchedules[0], {
    id: "sch-007", studentName: "Aditi", studentRegNo: "REG/46", studentMobile: "84599865274",
    courseName: "IIT-JEE Foundation", status: "Active", totalPayable: 6000, totalPaid: 0,
    totalOutstanding: 6000, totalOutstandingWithoutTax: 6000, totalNetAmount: 6000, totalTax: 0,
  }),
  createManageSchedule(mockSchedules[0], {
    id: "sch-008", studentName: "Karan", studentRegNo: "REG/47", studentMobile: "84599865275",
    courseName: "IIT-JEE Foundation", status: "Active", totalPayable: 6000, totalPaid: 0,
    totalOutstanding: 6000, totalOutstandingWithoutTax: 6000, totalNetAmount: 6000, totalTax: 0,
  }),
  createManageSchedule(mockSchedules[0], {
    id: "sch-009", studentName: "Meera", studentRegNo: "REG/48", studentMobile: "84599865276",
    courseName: "IIT-JEE Foundation", status: "Draft", totalPayable: 6000, totalPaid: 0,
    totalOutstanding: 6000, totalOutstandingWithoutTax: 6000, totalNetAmount: 6000, totalTax: 0,
  }),
  createManageSchedule(mockSchedules[0], {
    id: "sch-010", studentName: "Rohit", studentRegNo: "REG/49", studentMobile: "84599865277",
    courseName: "IIT-JEE Foundation", status: "Active", totalPayable: 6000, totalPaid: 0,
    totalOutstanding: 6000, totalOutstandingWithoutTax: 6000, totalNetAmount: 6000, totalTax: 0,
  }),
];

export const mockReceipts: PaymentReceipt[] = createMockReceipts();

// ─── In-memory store (resets on page reload) ───────────────────────────────────
let scheduleStore: PaymentSchedule[] = [...managePaymentSchedules];
let receiptStore: PaymentReceipt[] = [...mockReceipts];

export const resetMockStore = (): void => {
  scheduleStore = [...managePaymentSchedules];
  receiptStore = [...mockReceipts];
};

// ─── Mock Store Accessors ──────────────────────────────────────────────────────
export const getMockSchedules = (): PaymentSchedule[] => scheduleStore;
export const setMockSchedules = (schedules: PaymentSchedule[]): void => {
  scheduleStore = schedules;
};
export const getMockReceipts = (): PaymentReceipt[] => receiptStore;
export const setMockReceipts = (receipts: PaymentReceipt[]): void => {
  receiptStore = receipts;
};
