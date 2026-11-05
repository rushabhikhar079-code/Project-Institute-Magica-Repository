// ─── Edit Schedule Dialog ──────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { PaymentSchedule } from "../paymentTypes";
import { PaymentStatusBadge } from "../components/PaymentStatusBadge";

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
  const [globalDiscount, setGlobalDiscount] = useState(0);

  useEffect(() => {
    if (schedule) {
      setRemarks("");
      setGlobalDiscount(0);
    }
  }, [schedule]);

  if (!open || !schedule) return null;

  const isCompletedOrCancelled = schedule.status === "Completed" || schedule.status === "Cancelled";

  const handleSave = () => {
    onSave({ remarks });
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
          </div>

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
            onClick={handleSave}
            disabled={isCompletedOrCancelled}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
