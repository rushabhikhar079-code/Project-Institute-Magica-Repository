// ─── Payment Summary Panel Component ───────────────────────────────────────────
// Shows the calculated totals during schedule creation.
import React from "react";
import { formatCurrency, round2 } from "../paymentCalculations";
import type { FeeLine, Installment } from "../paymentTypes";

interface PaymentSummaryPanelProps {
  feeLines: FeeLine[];
  installments: Installment[];
  globalDiscount: number;
}

export const PaymentSummaryPanel: React.FC<PaymentSummaryPanelProps> = ({
  feeLines,
  installments,
  globalDiscount,
}) => {
  const totalBasic = round2(feeLines.reduce((s, l) => s + l.basicAmount, 0));
  const totalDiscount = round2(feeLines.reduce((s, l) => s + l.discountAmount, 0) + globalDiscount);
  const totalTax = round2(feeLines.reduce((s, l) => s + l.taxAmount, 0));
  const totalNet = round2(totalBasic - totalDiscount + totalTax);
  const installmentSum = round2(installments.reduce((s, i) => s + i.netAmount, 0));
  const difference = round2(totalNet - installmentSum);
  const isReconciled = difference === 0;

  return (
    <div className="pm-card pm-summary-panel">
      <h4 className="pm-summary-panel__title">Payment Summary</h4>
      <div className="pm-summary-panel__rows">
        <div className="pm-summary-panel__row">
          <span>Basic Amount</span>
          <span className="pm-text-semibold">{formatCurrency(totalBasic)}</span>
        </div>
        <div className="pm-summary-panel__row">
          <span>Discount</span>
          <span className="pm-text-semibold pm-text-danger">- {formatCurrency(totalDiscount)}</span>
        </div>
        <div className="pm-summary-panel__row">
          <span>Tax</span>
          <span className="pm-text-semibold">+ {formatCurrency(totalTax)}</span>
        </div>
        <div className="pm-summary-panel__row pm-summary-panel__row--total">
          <span>Total Net Payable</span>
          <span className="pm-text-semibold pm-text-primary" style={{ fontSize: "1.1rem" }}>
            {formatCurrency(totalNet)}
          </span>
        </div>
        <div className="pm-summary-panel__divider" />
        <div className="pm-summary-panel__row">
          <span>Installment Count</span>
          <span className="pm-text-semibold">{installments.length}</span>
        </div>
        <div className="pm-summary-panel__row">
          <span>Installment Sum</span>
          <span className="pm-text-semibold">{formatCurrency(installmentSum)}</span>
        </div>
        <div className="pm-summary-panel__row">
          <span>Difference</span>
          <span
            className="pm-text-semibold"
            style={{ color: isReconciled ? "#16a34a" : "#dc2626" }}
          >
            {formatCurrency(difference)}
          </span>
        </div>
        <div className="pm-summary-panel__status">
          {isReconciled ? (
            <span className="pm-text-success pm-text-sm">
              Schedule reconciles exactly with total payable.
            </span>
          ) : (
            <span className="pm-text-danger pm-text-sm">
              Schedule does not reconcile. Adjust installment amounts to match {formatCurrency(totalNet)}.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
