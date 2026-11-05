// ─── Edit Installment Dialog ───────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Installment } from "../paymentTypes";
import { formatCurrency, round2 } from "../paymentCalculations";

interface EditInstallmentDialogProps {
  open: boolean;
  installment: Installment | null;
  onClose: () => void;
  onSave: (updates: Partial<Installment>) => void;
}

export const EditInstallmentDialog: React.FC<EditInstallmentDialogProps> = ({
  open,
  installment,
  onClose,
  onSave,
}) => {
  const [dueDate, setDueDate] = useState("");
  const [basicAmount, setBasicAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (installment) {
      setDueDate(installment.dueDate ? installment.dueDate.split("/").reverse().join("-") : "");
      setBasicAmount(installment.basicAmount);
      setDiscountAmount(installment.discountAmount);
      setRemarks(installment.remarks || "");
    }
  }, [installment]);

  if (!open || !installment) return null;

  const isPaid = installment.status === "Paid";

  const handleSave = () => {
    const parsedDate = dueDate ? new Date(dueDate).toLocaleDateString("en-GB") : "";
    const taxAmount = round2(
      round2(basicAmount - discountAmount) * (installment.taxPercentage / 100),
    );
    const netAmount = round2(round2(basicAmount - discountAmount) + taxAmount);

    onSave({
      dueDate: parsedDate,
      basicAmount: round2(basicAmount),
      discountAmount: round2(discountAmount),
      taxAmount,
      netAmount,
      outstandingAmount: round2(netAmount - installment.paidAmount),
      remarks,
    });
  };

  return (
    <div className="pm-dialog-overlay" onClick={onClose}>
      <div className="pm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pm-dialog__header">
          <h3 className="pm-dialog__title">Edit Installment #{installment.installmentNo}</h3>
          <button type="button" className="pm-dialog__close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pm-dialog__body">
          {isPaid && (
            <div className="pm-dialog__notice pm-dialog__notice--warning">
              This installment is fully paid. Only receipt details can be modified, not the schedule.
            </div>
          )}

          <div className="pm-dialog__form-row">
            <div className="pm-form-group">
              <label className="pm-label">Due Date</label>
              <input
                type="date"
                className="pm-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isPaid}
              />
            </div>
            <div className="pm-form-group">
              <label className="pm-label">Basic Amount</label>
              <input
                type="number"
                className="pm-input"
                step="0.01"
                min="0"
                value={basicAmount}
                onChange={(e) => setBasicAmount(parseFloat(e.target.value) || 0)}
                disabled={isPaid}
              />
            </div>
          </div>

          <div className="pm-dialog__form-row">
            <div className="pm-form-group">
              <label className="pm-label">Discount</label>
              <input
                type="number"
                className="pm-input"
                step="0.01"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                disabled={isPaid}
              />
            </div>
            <div className="pm-form-group">
              <label className="pm-label">Tax Amount</label>
              <input
                type="text"
                className="pm-input pm-input--readonly"
                value={formatCurrency(
                  round2(round2(basicAmount - discountAmount) * (installment.taxPercentage / 100)),
                )}
                readOnly
              />
            </div>
          </div>

          <div className="pm-form-group">
            <label className="pm-label">Remarks</label>
            <textarea
              className="pm-textarea"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <div className="pm-dialog__footer">
          <button type="button" className="pm-btn pm-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="pm-btn pm-btn--primary"
            onClick={handleSave}
            disabled={isPaid}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
