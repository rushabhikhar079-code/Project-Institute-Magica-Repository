// ─── Installment Configuration Component ───────────────────────────────────────
// Used in CreateSchedule page. Allows:
// - Choosing number of installments
// - Equal distribution (button)
// - Manual amount entry per installment
// - Manual due date entry per installment
// - Adding/removing installments
// - XD adjustment options
// - Reset Installments, Save & Pay, Adjustment Amount, Total Payable
import React, { useState, useCallback } from "react";
import { Plus, Trash2, RotateCcw, CreditCard, Save } from "lucide-react";
import type { Installment, AdjustmentOption } from "../paymentTypes";
import { distributeEqually, round2, formatCurrency } from "../paymentCalculations";
import { ADJUSTMENT_OPTIONS } from "../paymentConstants";

interface InstallmentConfigurationProps {
  installments: Installment[];
  totalPayable: number;
  onChange: (installments: Installment[]) => void;
  paymentType: "LumpSum" | "Adhoc" | "Installment";
  onSave?: () => void;
  onSaveAndPay?: () => void;
}

export const InstallmentConfiguration: React.FC<InstallmentConfigurationProps> = ({
  installments,
  totalPayable,
  onChange,
  paymentType,
  onSave,
  onSaveAndPay,
}) => {
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [selectedInstallmentIdx, setSelectedInstallmentIdx] = useState<number | null>(null);
  const [adjustmentOption, setAdjustmentOption] = useState<AdjustmentOption>("DistributeEqually");
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [newDueDate, setNewDueDate] = useState<string>("");

  const isLumpSum = paymentType === "LumpSum";
  const isAdhoc = paymentType === "Adhoc";

  // ─── Reset Installments ────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    const count = installments.length;
    if (count === 0) return;
    const amounts = distributeEqually(totalPayable, count);
    const updated = installments.map((inst, idx) => ({
      ...inst,
      basicAmount: amounts[idx],
      discountAmount: 0,
      netAmount: amounts[idx],
      outstandingAmount: amounts[idx],
      outstandingWithoutTax: amounts[idx],
    }));
    onChange(updated);
  }, [installments, totalPayable, onChange]);

  // ─── Equal Distribution ───────────────────────────────────────────────────
  const handleDistributeEqually = useCallback(() => {
    const count = installments.length;
    if (count === 0) return;
    const amounts = distributeEqually(totalPayable, count);

    const updated = installments.map((inst, idx) => ({
      ...inst,
      basicAmount: amounts[idx],
      netAmount: amounts[idx],
      outstandingAmount: amounts[idx],
    }));
    onChange(updated);
  }, [installments, totalPayable, onChange]);

  // ─── Add Installment ──────────────────────────────────────────────────────
  const handleAddInstallment = useCallback(() => {
    const newNo = installments.length + 1;
    const newInstallment: Installment = {
      id: `inst-${Date.now()}`,
      installmentNo: newNo,
      installmentName: `Installment ${newNo}`,
      dueDate: "",
      basicAmount: 0,
      discountAmount: 0,
      taxPercentage: 0,
      taxAmount: 0,
      netAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      outstandingWithoutTax: 0,
      status: "Pending",
      remarks: "",
    };
    onChange([...installments, newInstallment]);
  }, [installments, onChange]);

  // ─── Remove Installment ───────────────────────────────────────────────────
  const handleRemoveInstallment = useCallback(
    (id: string) => {
      if (installments.length <= 1) return;
      const filtered = installments.filter((i) => i.id !== id);
      const renumbered = filtered.map((inst, idx) => ({
        ...inst,
        installmentNo: idx + 1,
      }));
      onChange(renumbered);
    },
    [installments, onChange],
  );

  // ─── Update Installment Field ─────────────────────────────────────────────
  const handleUpdateField = useCallback(
    (id: string, field: keyof Installment, value: string | number) => {
      const updated = installments.map((inst) => {
        if (inst.id !== id) return inst;
        const updatedInst = { ...inst, [field]: value };
        if (field === "basicAmount" || field === "discountAmount") {
          updatedInst.netAmount = round2(
            round2(updatedInst.basicAmount - updatedInst.discountAmount) + updatedInst.taxAmount,
          );
          updatedInst.outstandingAmount = round2(updatedInst.netAmount - updatedInst.paidAmount);
        }
        return updatedInst;
      });
      onChange(updated);
    },
    [installments, onChange],
  );

  // ─── Apply Adjustment ─────────────────────────────────────────────────────
  const handleApplyAdjustment = useCallback(() => {
    if (selectedInstallmentIdx === null) return;
    const diff = round2(adjustmentAmount);

    let updated = [...installments];

    switch (adjustmentOption) {
      case "DistributeEqually": {
        const perInst = round2(diff / (updated.length - selectedInstallmentIdx - 1 || 1));
        updated = updated.map((inst, idx) => {
          if (idx <= selectedInstallmentIdx) return inst;
          return {
            ...inst,
            basicAmount: round2(inst.basicAmount + perInst),
            netAmount: round2(inst.netAmount + perInst),
            outstandingAmount: round2(inst.outstandingAmount + perInst),
          };
        });
        break;
      }
      case "InNext": {
        const nextIdx = selectedInstallmentIdx + 1;
        if (nextIdx < updated.length) {
          updated[nextIdx] = {
            ...updated[nextIdx],
            basicAmount: round2(updated[nextIdx].basicAmount + diff),
            netAmount: round2(updated[nextIdx].netAmount + diff),
            outstandingAmount: round2(updated[nextIdx].outstandingAmount + diff),
          };
        }
        break;
      }
      case "InLast": {
        const lastIdx = updated.length - 1;
        updated[lastIdx] = {
          ...updated[lastIdx],
          basicAmount: round2(updated[lastIdx].basicAmount + diff),
          netAmount: round2(updated[lastIdx].netAmount + diff),
          outstandingAmount: round2(updated[lastIdx].outstandingAmount + diff),
        };
        break;
      }
      case "InNewInstallment":
      case "InsertNew": {
        const newInst: Installment = {
          id: `inst-${Date.now()}`,
          installmentNo: updated.length + 1,
          installmentName: `Installment ${updated.length + 1}`,
          dueDate: newDueDate || "",
          basicAmount: diff,
          discountAmount: 0,
          taxPercentage: 0,
          taxAmount: 0,
          netAmount: diff,
          paidAmount: 0,
          outstandingAmount: diff,
          outstandingWithoutTax: diff,
          status: "Pending",
          remarks: "Inserted via adjustment",
        };
        updated = [...updated, newInst];
        break;
      }
    }

    const renumbered = updated.map((inst, idx) => ({ ...inst, installmentNo: idx + 1 }));
    onChange(renumbered);
    setShowAdjustment(false);
    setSelectedInstallmentIdx(null);
    setAdjustmentAmount(0);
    setNewDueDate("");
  }, [selectedInstallmentIdx, adjustmentOption, adjustmentAmount, newDueDate, installments, onChange]);

  const sumNet = round2(installments.reduce((s, i) => s + i.netAmount, 0));
  const sumMatch = sumNet === round2(totalPayable);

  if (isLumpSum || isAdhoc) {
    return (
      <div className="pm-card pm-installment-config">
        <div className="pm-installment-config__header">
          <h4 className="pm-installment-config__title">
            {isLumpSum ? "Lump Sum Payment" : "Adhoc Payment"}
          </h4>
          <p className="pm-installment-config__subtitle">
            {isLumpSum
              ? "Single payment for the full payable amount"
              : "Flexible collection — remaining balance auto-carries forward as the next installment"}
          </p>
        </div>
        <div className="pm-installment-config__single">
          <div className="pm-form-group">
            <label className="pm-label">Due Date</label>
            <input
              type="date"
              className="pm-input"
              value={installments[0]?.dueDate ? installments[0].dueDate.split("/").reverse().join("-") : ""}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value).toLocaleDateString("en-GB") : "";
                handleUpdateField(installments[0]?.id, "dueDate", date);
              }}
            />
          </div>
          <div className="pm-form-group">
            <label className="pm-label">Amount ({formatCurrency(totalPayable)})</label>
            <input
              type="number"
              className="pm-input"
              step="0.01"
              value={installments[0]?.basicAmount || 0}
              onChange={(e) => handleUpdateField(installments[0]?.id, "basicAmount", parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-card pm-installment-config">
      <div className="pm-installment-config__header">
        <h4 className="pm-installment-config__title">Custom Installment Schedule</h4>
        <p className="pm-installment-config__subtitle">
          Choose the number of installments, set custom due dates and amounts, or distribute equally.
          Monthly and Quarterly are convenience options — they do not restrict manual editing.
        </p>
      </div>

      <div className="pm-installment-config__toolbar">
        <button
          type="button"
          className="pm-btn pm-btn--secondary"
          onClick={handleDistributeEqually}
        >
          Distribute Equally
        </button>
        <button
          type="button"
          className="pm-btn pm-btn--ghost"
          onClick={handleReset}
          title="Reset to equal distribution"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Installments
        </button>
        <button
          type="button"
          className="pm-btn pm-btn--secondary"
          onClick={handleAddInstallment}
        >
          <Plus className="w-4 h-4" />
          Add Installment
        </button>
        <div className="pm-installment-config__summary">
          <span className="pm-installment-config__total-label">Total Payable:</span>
          <span className="pm-installment-config__total-value">{formatCurrency(totalPayable)}</span>
          <span className={`pm-installment-config__total ${sumMatch ? "pm-text-success" : "pm-text-danger"}`}>
            Sum: {formatCurrency(sumNet)}
          </span>
          {sumMatch ? (
            <span className="pm-text-success pm-text-sm">Reconciled</span>
          ) : (
            <span className="pm-text-danger pm-text-sm">
              Difference: {formatCurrency(round2(totalPayable - sumNet))}
            </span>
          )}
        </div>
      </div>

      <div className="pm-installment-config__table">
        <table className="pm-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>#</th>
              <th style={{ width: "160px" }}>Due Date</th>
              <th style={{ width: "140px" }}>Basic Amount</th>
              <th style={{ width: "120px" }}>Discount</th>
              <th style={{ width: "120px" }}>Net Amount</th>
              <th style={{ width: "40px" }}></th>
            </tr>
          </thead>
          <tbody>
            {installments.map((inst) => (
              <tr key={inst.id}>
                <td className="pm-text-center">{inst.installmentNo}</td>
                <td>
                  <input
                    type="date"
                    className="pm-input pm-input--sm"
                    value={inst.dueDate ? inst.dueDate.split("/").reverse().join("-") : ""}
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value).toLocaleDateString("en-GB")
                        : "";
                      handleUpdateField(inst.id, "dueDate", date);
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="pm-input pm-input--sm"
                    step="0.01"
                    min="0"
                    value={inst.basicAmount}
                    onChange={(e) =>
                      handleUpdateField(inst.id, "basicAmount", parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="pm-input pm-input--sm"
                    step="0.01"
                    min="0"
                    value={inst.discountAmount}
                    onChange={(e) =>
                      handleUpdateField(inst.id, "discountAmount", parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td className="pm-text-right pm-text-semibold">{formatCurrency(inst.netAmount)}</td>
                <td className="pm-text-center">
                  {installments.length > 1 && (
                    <button
                      type="button"
                      className="pm-icon-btn pm-icon-btn--danger"
                      onClick={() => handleRemoveInstallment(inst.id)}
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjustment Options */}
      <div className="pm-installment-config__adjustment">
        <button
          type="button"
          className="pm-btn pm-btn--ghost"
          onClick={() => setShowAdjustment(!showAdjustment)}
        >
          Show Adjustment Options
        </button>

        {showAdjustment && (
          <div className="pm-adjustment-panel">
            <h5 className="pm-adjustment-panel__title">Schedule Adjustment</h5>
            <div className="pm-adjustment-panel__row">
              <div className="pm-form-group">
                <label className="pm-label">Installment</label>
                <select
                  className="pm-select"
                  value={selectedInstallmentIdx ?? ""}
                  onChange={(e) => setSelectedInstallmentIdx(Number(e.target.value))}
                >
                  <option value="">Select installment</option>
                  {installments.map((inst, idx) => (
                    <option key={inst.id} value={idx}>
                      #{inst.installmentNo} - {formatCurrency(inst.netAmount)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pm-form-group">
                <label className="pm-label">Adjustment Option</label>
                <select
                  className="pm-select"
                  value={adjustmentOption}
                  onChange={(e) => setAdjustmentOption(e.target.value as AdjustmentOption)}
                >
                  {ADJUSTMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pm-form-group">
                <label className="pm-label">Adjustment Amount</label>
                <input
                  type="number"
                  className="pm-input"
                  step="0.01"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              {(adjustmentOption === "InNewInstallment" || adjustmentOption === "InsertNew") && (
                <div className="pm-form-group">
                  <label className="pm-label">New Installment Due Date</label>
                  <input
                    type="date"
                    className="pm-input"
                    value={newDueDate ? newDueDate.split("/").reverse().join("-") : ""}
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value).toLocaleDateString("en-GB")
                        : "";
                      setNewDueDate(date);
                    }}
                  />
                </div>
              )}
              <button
                type="button"
                className="pm-btn pm-btn--primary"
                onClick={handleApplyAdjustment}
                disabled={selectedInstallmentIdx === null}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save & Save & Pay Actions */}
      {(onSave || onSaveAndPay) && (
        <div className="pm-installment-config__save-actions">
          {onSave && (
            <button type="button" className="pm-btn pm-btn--primary" onClick={onSave}>
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
          {onSaveAndPay && (
            <button type="button" className="pm-btn pm-btn--primary" onClick={onSaveAndPay}>
              <CreditCard className="w-4 h-4" />
              Save & Pay
            </button>
          )}
        </div>
      )}
    </div>
  );
};
