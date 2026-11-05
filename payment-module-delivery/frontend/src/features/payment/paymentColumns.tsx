// ─── Payment Module Column Definitions ─────────────────────────────────────────
// Follows existing project pattern from features/students/admission/columns.tsx.
// Uses TableColumn type from components/common/DataTable.

import { Edit, Eye, Trash2, Send, Plus, Calendar, CreditCard } from "lucide-react";
import type { TableColumn } from "../../../../components/common/DataTable";
import type { PaymentSchedule, PaymentReceipt, Installment } from "./paymentTypes";
import { formatCurrency } from "./paymentCalculations";
import { BRAND_COLOR, BRAND_COLOR_LIGHT } from "./paymentConstants";

// ─── Status Badge Helper ───────────────────────────────────────────────────────
const StatusBadge = ({ status, color }: { status: string; color: string }) => (
  <span
    className="pm-badge"
    style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
  >
    {status}
  </span>
);

// ─── Schedule List Columns ─────────────────────────────────────────────────────
export interface ScheduleColumnProps {
  onView: (schedule: PaymentSchedule) => void;
  onEdit: (schedule: PaymentSchedule) => void;
  onRecordPayment: (schedule: PaymentSchedule) => void;
  onSendLink: (schedule: PaymentSchedule) => void;
  onCancel: (schedule: PaymentSchedule) => void;
  onSchedule: (schedule: PaymentSchedule) => void;
  onPay: (schedule: PaymentSchedule) => void;
}

export const getScheduleColumns = ({
  onView,
  onEdit,
  onRecordPayment,
  onSendLink,
  onCancel,
  onSchedule,
  onPay,
}: ScheduleColumnProps): TableColumn<PaymentSchedule>[] => [
  {
    key: "actions",
    header: "Actions",
    width: "220px",
    align: "center",
    sortable: false,
    render: (schedule: PaymentSchedule) => (
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onView(schedule); }}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: BRAND_COLOR }}
          title="View Schedule"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(schedule); }}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: BRAND_COLOR }}
          title="Edit Schedule"
          disabled={schedule.status === "Completed" || schedule.status === "Cancelled"}
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSchedule(schedule); }}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: BRAND_COLOR }}
          title="Edit Installments"
          disabled={schedule.status === "Cancelled"}
        >
          <Calendar className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPay(schedule); }}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: BRAND_COLOR }}
          title="Pay"
          disabled={schedule.status === "Cancelled"}
        >
          <CreditCard className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRecordPayment(schedule); }}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: BRAND_COLOR }}
          title="Record Payment"
          disabled={schedule.status === "Cancelled"}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSendLink(schedule); }}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: BRAND_COLOR }}
          title="Send Payment Link"
        >
          <Send className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCancel(schedule); }}
          className="p-1.5 rounded-lg transition-colors text-red-600 hover:bg-red-50"
          title="Cancel Schedule"
          disabled={schedule.status === "Completed" || schedule.status === "Cancelled"}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  },
  {
    key: "studentName",
    header: "Student Name",
    sortable: true,
    sortKey: "studentName",
    render: (schedule: PaymentSchedule) => schedule.studentName || "-",
  },
  {
    key: "studentRegNo",
    header: "Reg. No.",
    sortable: true,
    sortKey: "studentRegNo",
    render: (schedule: PaymentSchedule) => schedule.studentRegNo || "-",
  },
  {
    key: "studentMobile",
    header: "Contact",
    sortable: false,
    render: (schedule: PaymentSchedule) => schedule.studentMobile || "-",
  },
  {
    key: "curriculum",
    header: "Curriculum",
    sortable: false,
    render: (schedule: PaymentSchedule) => schedule.curriculum || "-",
  },
  {
    key: "courseName",
    header: "Course",
    sortable: true,
    sortKey: "courseName",
    render: (schedule: PaymentSchedule) => schedule.courseName || "-",
  },
  {
    key: "subjectNames",
    header: "Subject(s)",
    sortable: false,
    render: (schedule: PaymentSchedule) => schedule.subjectNames || "-",
  },
  {
    key: "paymentType",
    header: "Payment Type",
    sortable: true,
    sortKey: "paymentType",
    render: (schedule: PaymentSchedule) => {
      const labels: Record<string, string> = {
        LumpSum: "Lump Sum",
        Adhoc: "Adhoc",
        Installment: "Installment",
      };
      return labels[schedule.paymentType] || schedule.paymentType;
    },
  },
  {
    key: "totalPayable",
    header: "Total Payable",
    sortable: true,
    sortKey: "totalPayable",
    align: "right",
    render: (schedule: PaymentSchedule) => formatCurrency(schedule.totalPayable),
  },
  {
    key: "totalPaid",
    header: "Paid",
    sortable: true,
    sortKey: "totalPaid",
    align: "right",
    render: (schedule: PaymentSchedule) => (
      <span style={{ color: "#16a34a" }}>{formatCurrency(schedule.totalPaid)}</span>
    ),
  },
  {
    key: "totalOutstanding",
    header: "Outstanding",
    sortable: true,
    sortKey: "totalOutstanding",
    align: "right",
    render: (schedule: PaymentSchedule) => (
      <span style={{ color: schedule.totalOutstanding > 0 ? "#dc2626" : "#16a34a" }}>
        {formatCurrency(schedule.totalOutstanding)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    sortKey: "status",
    render: (schedule: PaymentSchedule) => {
      const colors: Record<string, string> = {
        Draft: "#6b7280",
        Active: "#0F4C81",
        Completed: "#16a34a",
        Cancelled: "#9ca3af",
      };
      return <StatusBadge status={schedule.status} color={colors[schedule.status] || "#6b7280"} />;
    },
  },
];

// ─── Installment Columns ───────────────────────────────────────────────────────
export interface InstallmentColumnProps {
  onEdit: (installment: Installment) => void;
  onRecordPayment: (installment: Installment) => void;
  scheduleStatus: string;
}

export const getInstallmentColumns = ({
  onEdit,
  onRecordPayment,
  scheduleStatus,
}: InstallmentColumnProps): TableColumn<Installment>[] => [
  {
    key: "installmentNo",
    header: "#",
    width: "50px",
    align: "center",
    sortable: false,
    render: (inst: Installment) => inst.installmentNo,
  },
  {
    key: "installmentName",
    header: "Name",
    sortable: false,
    render: (inst: Installment) => inst.installmentName || `Installment ${inst.installmentNo}`,
  },
  {
    key: "dueDate",
    header: "Due Date",
    sortable: true,
    sortKey: "dueDate",
    render: (inst: Installment) => inst.dueDate || "-",
  },
  {
    key: "basicAmount",
    header: "Basic Amount",
    align: "right",
    sortable: true,
    sortKey: "basicAmount",
    render: (inst: Installment) => formatCurrency(inst.basicAmount),
  },
  {
    key: "discountAmount",
    header: "Discount",
    align: "right",
    sortable: false,
    render: (inst: Installment) =>
      inst.discountAmount > 0 ? formatCurrency(inst.discountAmount) : "-",
  },
  {
    key: "taxAmount",
    header: "Tax",
    align: "right",
    sortable: false,
    render: (inst: Installment) =>
      inst.taxAmount > 0 ? formatCurrency(inst.taxAmount) : "-",
  },
  {
    key: "netAmount",
    header: "Net Amount",
    align: "right",
    sortable: true,
    sortKey: "netAmount",
    render: (inst: Installment) => <strong>{formatCurrency(inst.netAmount)}</strong>,
  },
  {
    key: "paidAmount",
    header: "Paid",
    align: "right",
    sortable: false,
    render: (inst: Installment) => (
      <span style={{ color: inst.paidAmount > 0 ? "#16a34a" : "#6b7280" }}>
        {formatCurrency(inst.paidAmount)}
      </span>
    ),
  },
  {
    key: "outstandingAmount",
    header: "Outstanding",
    align: "right",
    sortable: false,
    render: (inst: Installment) => (
      <span style={{ color: inst.outstandingAmount > 0 ? "#dc2626" : "#16a34a" }}>
        {formatCurrency(inst.outstandingAmount)}
      </span>
    ),
  },
  {
    key: "outstandingWithoutTax",
    header: "Outstanding (excl. Tax)",
    align: "right",
    sortable: false,
    render: (inst: Installment) => (
      <span style={{ color: inst.outstandingWithoutTax > 0 ? "#dc2626" : "#16a34a" }}>
        {formatCurrency(inst.outstandingWithoutTax)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    sortKey: "status",
    render: (inst: Installment) => {
      const colors: Record<string, string> = {
        Pending: "#6b7280",
        PartiallyPaid: "#f59e0b",
        Paid: "#16a34a",
        Overdue: "#dc2626",
        Cancelled: "#9ca3af",
      };
      return <StatusBadge status={inst.status} color={colors[inst.status] || "#6b7280"} />;
    },
  },
  {
    key: "actions",
    header: "Actions",
    width: "100px",
    align: "center",
    sortable: false,
    render: (inst: Installment) => (
      <div className="flex items-center justify-center gap-1">
        {inst.status !== "Paid" && inst.status !== "Cancelled" && scheduleStatus === "Active" && (
          <>
            <button
              type="button"
              onClick={() => onEdit(inst)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: BRAND_COLOR }}
              title="Edit Installment"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onRecordPayment(inst)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: BRAND_COLOR }}
              title="Record Payment"
            >
              <Plus className="w-4 h-4" />
            </button>
          </>
        )}
        {inst.status === "Paid" && (
          <span className="text-xs text-gray-400">Locked</span>
        )}
      </div>
    ),
  },
];

// ─── Receipt Columns ───────────────────────────────────────────────────────────
export interface ReceiptColumnProps {
  onModify: (receipt: PaymentReceipt) => void;
}

export const getReceiptColumns = ({
  onModify,
}: ReceiptColumnProps): TableColumn<PaymentReceipt>[] => [
  {
    key: "receiptNo",
    header: "Receipt No.",
    sortable: true,
    sortKey: "receiptNo",
    render: (r: PaymentReceipt) => r.manualReceiptNo || r.receiptNo,
  },
  {
    key: "studentName",
    header: "Student Name",
    sortable: true,
    sortKey: "studentName",
    render: (r: PaymentReceipt) => r.studentName || "-",
  },
  {
    key: "installmentName",
    header: "Installment",
    sortable: false,
    render: (r: PaymentReceipt) => r.installmentName || "-",
  },
  {
    key: "paymentMethod",
    header: "Method",
    sortable: true,
    sortKey: "paymentMethod",
    render: (r: PaymentReceipt) => r.paymentMethod,
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    sortable: true,
    sortKey: "amount",
    render: (r: PaymentReceipt) => formatCurrency(r.amount),
  },
  {
    key: "payDate",
    header: "Pay Date",
    sortable: true,
    sortKey: "payDate",
    render: (r: PaymentReceipt) => r.payDate || "-",
  },
  {
    key: "receiptDate",
    header: "Receipt Date",
    sortable: true,
    sortKey: "receiptDate",
    render: (r: PaymentReceipt) => r.receiptDate || "-",
  },
  {
    key: "bank",
    header: "Bank",
    sortable: false,
    render: (r: PaymentReceipt) => r.bank || "-",
  },
  {
    key: "remarks",
    header: "Remarks",
    sortable: false,
    render: (r: PaymentReceipt) => r.remarks || "-",
  },
  {
    key: "collectedBy",
    header: "Collected By",
    sortable: false,
    render: (r: PaymentReceipt) => r.collectedBy || "-",
  },
  {
    key: "actions",
    header: "Actions",
    width: "80px",
    align: "center",
    sortable: false,
    render: (r: PaymentReceipt) => (
      <button
        type="button"
        onClick={() => onModify(r)}
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: BRAND_COLOR }}
        title="Modify Receipt"
      >
        <Edit className="w-4 h-4" />
      </button>
    ),
  },
];
