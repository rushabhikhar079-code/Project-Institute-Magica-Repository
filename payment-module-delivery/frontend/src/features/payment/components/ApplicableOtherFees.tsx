// ─── Applicable Other Fees Component ───────────────────────────────────────────
import React from "react";
import { formatCurrency } from "../paymentCalculations";
import type { OtherFee } from "../paymentTypes";

interface ApplicableOtherFeesProps {
  fees: OtherFee[];
  selectedCodes: number[];
  onToggle: (code: number) => void;
}

export const ApplicableOtherFees: React.FC<ApplicableOtherFeesProps> = ({
  fees,
  selectedCodes,
  onToggle,
}) => {
  const selectedTotal = fees
    .filter((fee) => selectedCodes.includes(fee.of_code))
    .reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <section className="pm-card pm-other-fees">
      <div className="pm-form-section__header">
        <h3 className="pm-form-section__title">APPLICABLE OTHER FEES</h3>
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
                <th>Tax</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => {
                const isSelected = selectedCodes.includes(fee.of_code);
                return (
                  <tr key={fee.of_code} className={isSelected ? "pm-other-fees__row--selected" : ""}>
                    <td>{fee.of_name}</td>
                    <td>{fee.of_FrequencyName}</td>
                    <td>{formatCurrency(fee.amount)}</td>
                    <td>{fee.istaxable === 1 ? (fee.isincluding === 1 ? "Inc. Tax" : "Excl. Tax") : "No Tax"}</td>
                    <td>
                      <label className="pm-checkbox-label">
                        <input type="checkbox" checked={isSelected} onChange={() => onToggle(fee.of_code)} />
                        <span>{isSelected ? "Selected" : "Select"}</span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="pm-table__total-row">
                <td colSpan={4}>Selected Other Fees Total</td>
                <td>{formatCurrency(selectedTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
};
