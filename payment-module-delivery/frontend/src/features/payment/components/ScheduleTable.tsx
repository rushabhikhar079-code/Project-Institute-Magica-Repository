// ─── Schedule Table Component ──────────────────────────────────────────────────
// Displays the installment schedule in a read-only table with edit actions.
import React from "react";
import { Edit, Plus } from "lucide-react";
import type { Installment } from "../paymentTypes";
import { formatCurrency } from "../paymentCalculations";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

interface ScheduleTableProps {
  installments: Installment[];
  onEditInstallment?: (installment: Installment) => void;
  onRecordPayment?: (installment: Installment) => void;
  scheduleStatus?: string;
  readOnly?: boolean;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  installments,
  onEditInstallment,
  onRecordPayment,
  scheduleStatus = "Active",
  readOnly = false,
}) => {
  if (installments.length === 0) {
    return (
      <div className="pm-empty-state">
        <p className="pm-empty-state__text">No installments in this schedule.</p>
      </div>
    );
  }

  const totalNet = installments.reduce((s, i) => s + i.netAmount, 0);
  const totalPaid = installments.reduce((s, i) => s + i.paidAmount, 0);
  const totalOutstanding = installments.reduce((s, i) => s + i.outstandingAmount, 0);

  return (
    <div className="pm-card pm-schedule-table">
      <table className="pm-table">
        <thead>
          <tr>
            <th style={{ width: "40px" }}>#</th>
            <th>Due Date</th>
            <th className="pm-text-right">Basic Amount</th>
            <th className="pm-text-right">Discount</th>
            <th className="pm-text-right">Tax</th>
            <th className="pm-text-right">Net Amount</th>
            <th className="pm-text-right">Paid</th>
            <th className="pm-text-right">Outstanding</th>
            <th>Status</th>
            {!readOnly && <th style={{ width: "100px" }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {installments.map((inst) => (
            <tr key={inst.id}>
              <td className="pm-text-center">{inst.installmentNo}</td>
              <td>{inst.dueDate || "-"}</td>
              <td className="pm-text-right">{formatCurrency(inst.basicAmount)}</td>
              <td className="pm-text-right">
                {inst.discountAmount > 0 ? formatCurrency(inst.discountAmount) : "-"}
              </td>
              <td className="pm-text-right">
                {inst.taxAmount > 0 ? formatCurrency(inst.taxAmount) : "-"}
              </td>
              <td className="pm-text-right pm-text-semibold">{formatCurrency(inst.netAmount)}</td>
              <td className="pm-text-right" style={{ color: inst.paidAmount > 0 ? "#16a34a" : undefined }}>
                {formatCurrency(inst.paidAmount)}
              </td>
              <td className="pm-text-right" style={{ color: inst.outstandingAmount > 0 ? "#dc2626" : "#16a34a" }}>
                {formatCurrency(inst.outstandingAmount)}
              </td>
              <td>
                <PaymentStatusBadge status={inst.status} type="installment" />
              </td>
              {!readOnly && (
                <td>
                  <div className="flex items-center justify-center gap-1">
                    {inst.status !== "Paid" && inst.status !== "Cancelled" && scheduleStatus === "Active" && (
                      <>
                        <button
                          type="button"
                          className="pm-icon-btn"
                          onClick={() => onEditInstallment?.(inst)}
                          title="Edit Installment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="pm-icon-btn"
                          onClick={() => onRecordPayment?.(inst)}
                          title="Record Payment"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {inst.status === "Paid" && (
                      <span className="pm-text-xs pm-text-muted">Locked</span>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="pm-table__total-row">
            <td colSpan={5}>Total</td>
            <td className="pm-text-right pm-text-semibold">{formatCurrency(totalNet)}</td>
            <td className="pm-text-right pm-text-success">{formatCurrency(totalPaid)}</td>
            <td className="pm-text-right pm-text-danger">{formatCurrency(totalOutstanding)}</td>
            <td colSpan={!readOnly ? 2 : 1}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
