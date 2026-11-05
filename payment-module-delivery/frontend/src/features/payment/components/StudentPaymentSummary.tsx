// ─── Student Payment Summary Component ─────────────────────────────────────────
// Shows a per-student summary of fees, discounts, tax, and net payable.
import React from "react";
import type { PaymentSchedule } from "../paymentTypes";
import { formatCurrency } from "../paymentCalculations";
import { CURRENCY_SYMBOL } from "../paymentConstants";

interface StudentPaymentSummaryProps {
  schedule: PaymentSchedule;
}

export const StudentPaymentSummary: React.FC<StudentPaymentSummaryProps> = ({ schedule }) => {
  return (
    <div className="pm-card pm-student-summary">
      <div className="pm-student-summary__header">
        <h3 className="pm-student-summary__title">Student Payment Summary</h3>
      </div>
      <div className="pm-student-summary__info">
        <div className="pm-student-summary__field">
          <span className="pm-student-summary__label">Student Name</span>
          <span className="pm-student-summary__value">{schedule.studentName}</span>
        </div>
        <div className="pm-student-summary__field">
          <span className="pm-student-summary__label">Reg. No.</span>
          <span className="pm-student-summary__value">{schedule.studentRegNo}</span>
        </div>
        <div className="pm-student-summary__field">
          <span className="pm-student-summary__label">Contact</span>
          <span className="pm-student-summary__value">{schedule.studentMobile || "-"}</span>
        </div>
        <div className="pm-student-summary__field">
          <span className="pm-student-summary__label">Curriculum</span>
          <span className="pm-student-summary__value">{schedule.curriculum || "-"}</span>
        </div>
        <div className="pm-student-summary__field">
          <span className="pm-student-summary__label">Course</span>
          <span className="pm-student-summary__value">{schedule.courseName || "-"}</span>
        </div>
        <div className="pm-student-summary__field">
          <span className="pm-student-summary__label">Subject(s)</span>
          <span className="pm-student-summary__value">{schedule.subjectNames || "-"}</span>
        </div>
        <div className="pm-student-summary__field">
          <span className="pm-student-summary__label">Payment Type</span>
          <span className="pm-student-summary__value">
            {schedule.paymentType === "LumpSum" ? "Lump Sum" : schedule.paymentType}
          </span>
        </div>
      </div>

      <div className="pm-student-summary__fees">
        <table className="pm-table">
          <thead>
            <tr>
              <th>Fee Item</th>
              <th className="pm-text-right">Basic Amount</th>
              <th className="pm-text-right">Discount</th>
              <th className="pm-text-right">Tax</th>
              <th className="pm-text-right">Net Amount</th>
            </tr>
          </thead>
          <tbody>
            {schedule.feeLines.map((line) => (
              <tr key={line.id}>
                <td>{line.name}</td>
                <td className="pm-text-right">{formatCurrency(line.basicAmount)}</td>
                <td className="pm-text-right">
                  {line.discountAmount > 0 ? formatCurrency(line.discountAmount) : "-"}
                </td>
                <td className="pm-text-right">
                  {line.taxAmount > 0 ? formatCurrency(line.taxAmount) : "-"}
                </td>
                <td className="pm-text-right pm-text-semibold">{formatCurrency(line.netAmount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="pm-table__total-row">
              <td>Total</td>
              <td className="pm-text-right">
                {formatCurrency(schedule.feeLines.reduce((s, l) => s + l.basicAmount, 0))}
              </td>
              <td className="pm-text-right">{formatCurrency(schedule.totalDiscount)}</td>
              <td className="pm-text-right">{formatCurrency(schedule.totalTax)}</td>
              <td className="pm-text-right pm-text-semibold">
                {formatCurrency(schedule.totalNetAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="pm-student-summary__totals">
        <div className="pm-total-box">
          <span className="pm-total-box__label">Total Payable</span>
          <span className="pm-total-box__value pm-text-primary">
            {formatCurrency(schedule.totalPayable)}
          </span>
        </div>
        <div className="pm-total-box">
          <span className="pm-total-box__label">Total Paid</span>
          <span className="pm-total-box__value pm-text-success">
            {formatCurrency(schedule.totalPaid)}
          </span>
        </div>
        <div className="pm-total-box">
          <span className="pm-total-box__label">Outstanding</span>
          <span className="pm-total-box__value pm-text-danger">
            {formatCurrency(schedule.totalOutstanding)}
          </span>
        </div>
        <div className="pm-total-box">
          <span className="pm-total-box__label">Outstanding (excl. Tax)</span>
          <span className="pm-total-box__value pm-text-danger">
            {formatCurrency(schedule.totalOutstandingWithoutTax)}
          </span>
        </div>
      </div>
    </div>
  );
};
