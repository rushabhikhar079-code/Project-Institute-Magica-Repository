// ─── Applicable Other Fees Component ───────────────────────────────────────────
// Displays and selects other fees applicable to a student's payment schedule.
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
  if (fees.length === 0) {
    return (
      <div className="pm-card pm-other-fees">
        <h4 className="pm-other-fees__title">Applicable Other Fees</h4>
        <p className="pm-empty-state__text">No other fees available for this branch.</p>
      </div>
    );
  }

  return (
    <div className="pm-card pm-other-fees">
      <h4 className="pm-other-fees__title">Applicable Other Fees</h4>
      <div className="pm-other-fees__list">
        {fees.map((fee) => {
          const isSelected = selectedCodes.includes(fee.of_code);
          return (
            <label
              key={fee.of_code}
              className={`pm-other-fees__item ${isSelected ? "pm-other-fees__item--selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(fee.of_code)}
                className="pm-checkbox"
              />
              <div className="pm-other-fees__info">
                <span className="pm-other-fees__name">{fee.of_name}</span>
                <span className="pm-other-fees__freq">{fee.of_FrequencyName}</span>
              </div>
              <div className="pm-other-fees__amount">
                <span className="pm-text-semibold">{formatCurrency(fee.amount)}</span>
                {fee.istaxable === 1 && (
                  <span className="pm-other-fees__tax-badge">
                    {fee.isincluding === 1 ? "Inc. Tax" : "Excl. Tax"}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
