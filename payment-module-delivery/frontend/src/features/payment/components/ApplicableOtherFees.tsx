import React, { useState } from "react";
import { formatCurrency, calculateFeeLine, createTaxConfig } from "../paymentCalculations";
import type { FeeLine, OtherFee } from "../paymentTypes";
import { FEES_TYPE } from "../paymentConstants";

interface ApplicableOtherFeesProps {
  fees: OtherFee[];
  selectedCodes: number[];
  onToggle: (code: number) => void;
  studentName: string;
}

const toFeeLine = (fee: OtherFee): FeeLine =>
  calculateFeeLine(
    fee.of_name,
    fee.amount,
    0,
    createTaxConfig(fee.istaxable === 1, fee.isincluding === 1, 18, ""),
    `OtherFee-${fee.of_code}`,
    "OtherFee",
    String(fee.of_code),
    FEES_TYPE.OTHER,
  );

export const ApplicableOtherFees: React.FC<ApplicableOtherFeesProps> = ({
  fees,
  selectedCodes,
  onToggle,
  studentName,
}) => {
  const [showAll, setShowAll] = useState(false);
  const feeLines = fees.map(toFeeLine);
  const visibleFees = showAll ? fees : fees.slice(0, 2);
  const selectedLines = feeLines.filter((line) => selectedCodes.includes(Number(line.code)));
  const selectedTotals = selectedLines.reduce(
    (totals, line) => ({
      basic: totals.basic + line.basicAmount,
      discount: totals.discount + line.discountAmount,
      net: totals.net + line.basicAmount - line.discountAmount,
      tax: totals.tax + line.taxAmount,
      total: totals.total + line.netAmount,
    }),
    { basic: 0, discount: 0, net: 0, tax: 0, total: 0 },
  );

  return (
    <section className="pm-card pm-other-fees">
      <div className="pm-other-fees__header">
        <h3 className="pm-form-section__title">APPLICABLE OTHER FEES</h3>
        <span>Showing {fees.length} Applicable Fees For {studentName.toUpperCase()}</span>
        <button type="button" className="pm-btn pm-btn--secondary pm-btn--sm" onClick={() => setShowAll((current) => !current)}>
          {showAll ? "Show Less" : "Show All Other Fees"}
        </button>
      </div>
      {fees.length === 0 ? (
        <p className="pm-empty-state__text">No other fees available for this branch.</p>
      ) : (
        <div className="pm-recording-table-wrap">
          <table className="pm-table pm-other-fees__table">
            <thead>
              <tr>
                <th>Other Fees</th>
                <th>Frequency</th>
                <th>Amount</th>
                <th>Discount</th>
                <th>Net</th>
                <th>Tax</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {visibleFees.map((fee, index) => {
                const line = feeLines[index];
                const isSelected = selectedCodes.includes(fee.of_code);
                return (
                  <tr key={fee.of_code} className={isSelected ? "pm-other-fees__row--selected" : ""}>
                    <td><label className="pm-checkbox-label"><input type="checkbox" checked={isSelected} onChange={() => onToggle(fee.of_code)} />{fee.of_name}</label></td>
                    <td>{fee.of_FrequencyName}</td>
                    <td>{formatCurrency(line.basicAmount)}</td>
                    <td>{formatCurrency(line.discountAmount)}</td>
                    <td>{formatCurrency(line.basicAmount - line.discountAmount)}</td>
                    <td>{formatCurrency(line.taxAmount)} {fee.istaxable === 1 && "(18%)"}</td>
                    <td className="pm-text-semibold">{formatCurrency(line.netAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="pm-table__total-row">
                <td>Selected Other Fees Total ({selectedLines.length} selected)</td>
                <td></td>
                <td>{formatCurrency(selectedTotals.basic)}</td>
                <td>{formatCurrency(selectedTotals.discount)}</td>
                <td>{formatCurrency(selectedTotals.net)}</td>
                <td>{formatCurrency(selectedTotals.tax)}</td>
                <td>{formatCurrency(selectedTotals.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
};
