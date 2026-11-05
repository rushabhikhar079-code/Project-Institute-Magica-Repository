// ─── Edit Schedule Dialog (XD Screen 10) ───────────────────────────────────────
// Allows editing schedule-level properties: change date, discount, payable,
// settle difference options, and remarks. Done button to apply changes.
import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import type { PaymentSchedule, AdjustmentOption } from "../paymentTypes";
import { PaymentStatusBadge } from "../components/PaymentStatusBadge";
import { ADJUSTMENT_OPTIONS } from "../paymentConstants";
import { formatCurrency, round2 } from "../paymentCalculations";

interface EditScheduleDialogProps {
  open: boolean;
  schedule: PaymentSchedule | null;
  onClose: () => void;
  onSave: (updates: Partial<PaymentSchedule>) => void;
}

export const EditScheduleDialog: React.FC<EditScheduleDialogProps> = ({
  open,
  schedule,
  onClose,
  onSave,
}) => {
  const [remarks, setRemarks] = useState("");
  const [changeDate, setChangeDate] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [changeDiscount, setChangeDiscount] = useState(false);
  const [newDiscount, setNewDiscount] = useState(0);
  const [changePayable, setChangePayable] = useState(false);
  const [newTotalPayable, setNewTotalPayable] = useState(0);
  const [settleDifferenceOption, setSettleDifferenceOption] = useState<AdjustmentOption>("DistributeEqually");

  useEffect(() => {
    if (schedule) {
      setRemarks(schedule.feeLines[0]?.remarks || "");
      setChangeDate(false);
      setNewDueDate("");
      setChangeDiscount(false);
      setNewDiscount(0);
      setChangePayable(false);
      setNewTotalPayable(schedule.totalPayable);
      setSettleDifferenceOption("DistributeEqually");
    }
  }, [schedule]);

  if (!open || !schedule) return null;

  const isCompletedOrCancelled = schedule.status === "Completed" || schedule.status === "Cancelled";

  const currentPayable = schedule.totalPayable;
  const difference = changePayable ? round2(newTotalPayable - currentPayable) : 0;

  const handleDone = () => {
    const updates: Partial<PaymentSchedule> = { remarks };
    if (changePayable) {
      updates.totalPayable = round2(newTotalPayable);
    }
    onSave(updates);
  };

  return (
    <div className="pm-dialog-overlay" onClick={onClose}>
      <div className="pm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pm-dialog__header">
          <h3 className="pm-dialog__title">Edit Schedule</h3>
          <button type="button" className="pm-dialog__close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pm-dialog__body">
          {isCompletedOrCancelled && (
            <div className="pm-dialog__notice pm-dialog__notice--warning">
              This schedule is {schedule.status}. Schedule modifications are locked.
              Receipt-detail modifications may still be permitted through the receipt dialog.
            </div>
          )}

          <div className="pm-dialog__info-grid">
            <div className="pm-dialog__info-item">
              <span className="pm-label">Student</span>
              <span className="pm-text-semibold">{schedule.studentName}</span>
            </div>
            <div className="pm-dialog__info-item">
              <span className="pm-label">Reg. No.</span>
              <span className="pm-text-semibold">{schedule.studentRegNo}</span>
            </div>
            <div className="pm-dialog__info-item">
              <span className="pm-label">Payment Type</span>
              <span className="pm-text-semibold">
                {schedule.paymentType === "LumpSum" ? "Lump Sum" : schedule.paymentType}
              </span>
            </div>
            <div className="pm-dialog__info-item">
              <span className="pm-label">Status</span>
              <PaymentStatusBadge status={schedule.status} type="schedule" />
            </div>
            <div className="pm-dialog__info-item">
              <span className="pm-label">Current Payable</span>
              <span className="pm-text-semibold">{formatCurrency(schedule.totalPayable)}</span>
            </div>
            <div className="pm-dialog__info-item">
              <span className="pm-label">Outstanding</span>
              <span className="pm-text-semibold pm-text-danger">{formatCurrency(schedule.totalOutstanding)}</span>
            </div>
          </div>

          {/* Change Date */}
          <div className="pm-edit-schedule__section">
            <label className="pm-checkbox-label">
              <input
                type="checkbox"
                checked={changeDate}
                onChange={(e) => setChangeDate(e.target.checked)}
                disabled={isCompletedOrCancelled}
              />
              Change Due Date
            </label>
            {changeDate && (
              <div className="pm-form-group">
                <label className="pm-label">New Due Date</label>
                <input
                  type="date"
                  className="pm-input"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  disabled={isCompletedOrCancelled}
                />
              </div>
            )}
          </div>

          {/* Change Discount */}
          <div className="pm-edit-schedule__section">
            <label className="pm-checkbox-label">
              <input
                type="checkbox"
                checked={changeDiscount}
                onChange={(e) => setChangeDiscount(e.target.checked)}
                disabled={isCompletedOrCancelled}
              />
              Change Discount
            </label>
            {changeDiscount && (
              <div className="pm-form-group">
                <label className="pm-label">New Discount Amount</label>
                <input
                  type="number"
                  className="pm-input"
                  step="0.01"
                  min="0"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(parseFloat(e.target.value) || 0)}
                  disabled={isCompletedOrCancelled}
                />
              </div>
            )}
          </div>

          {/* Change Payable */}
          <div className="pm-edit-schedule__section">
            <label className="pm-checkbox-label">
              <input
                type="checkbox"
                checked={changePayable}
                onChange={(e) => setChangePayable(e.target.checked)}
                disabled={isCompletedOrCancelled}
              />
              Change Total Payable
            </label>
            {changePayable && (
              <>
                <div className="pm-form-group">
                  <label className="pm-label">New Total Payable</label>
                  <input
                    type="number"
                    className="pm-input"
                    step="0.01"
                    min="0"
                    value={newTotalPayable}
                    onChange={(e) => setNewTotalPayable(parseFloat(e.target.value) || 0)}
                    disabled={isCompletedOrCancelled}
                  />
                </div>
                {difference !== 0 && (
                  <div className="pm-edit-schedule__difference">
                    <span className="pm-label">Difference:</span>
                    <span className={difference > 0 ? "pm-text-danger" : "pm-text-success"}>
                      {formatCurrency(Math.abs(difference))} {difference > 0 ? "increase" : "decrease"}
                    </span>
                  </div>
                )}
                {difference !== 0 && (
                  <div className="pm-form-group">
                    <label className="pm-label">Settle Difference</label>
                    <select
                      className="pm-select"
                      value={settleDifferenceOption}
                      onChange={(e) => setSettleDifferenceOption(e.target.value as AdjustmentOption)}
                      disabled={isCompletedOrCancelled}
                    >
                      {ADJUSTMENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Remarks */}
          <div className="pm-form-group">
            <label className="pm-label">Schedule Remarks</label>
            <textarea
              className="pm-textarea"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add or update schedule remarks..."
              disabled={isCompletedOrCancelled}
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
            onClick={handleDone}
            disabled={isCompletedOrCancelled}
          >
            <Check className="w-4 h-4" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
