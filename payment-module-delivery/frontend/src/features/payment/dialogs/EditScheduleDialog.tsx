import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleDollarSign, Percent, X } from "lucide-react";
import type { PaymentSchedule, AdjustmentOption } from "../paymentTypes";
import { ADJUSTMENT_OPTIONS } from "../paymentConstants";
import { formatCurrency, round2 } from "../paymentCalculations";

interface EditScheduleDialogProps {
  open: boolean;
  schedule: PaymentSchedule | null;
  onClose: () => void;
  onSave: (updates: Partial<PaymentSchedule>) => void;
}

export const EditScheduleDialog: React.FC<EditScheduleDialogProps> = ({ open, schedule, onClose, onSave }) => {
  const [remarks, setRemarks] = useState("");
  const [changeDate, setChangeDate] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [changeDiscount, setChangeDiscount] = useState(false);
  const [newDiscount, setNewDiscount] = useState(0);
  const [changePayable, setChangePayable] = useState(true);
  const [newTotalPayable, setNewTotalPayable] = useState(0);
  const [settleDifferenceOption, setSettleDifferenceOption] = useState<AdjustmentOption>("DistributeEqually");

  useEffect(() => {
    if (!schedule) return;
    setRemarks(schedule.feeLines[0]?.remarks || "");
    setChangeDate(false);
    setNewDueDate("");
    setChangeDiscount(false);
    setNewDiscount(schedule.totalDiscount);
    setChangePayable(true);
    setNewTotalPayable(schedule.totalPayable);
    setSettleDifferenceOption("DistributeEqually");
  }, [schedule]);

  const currentInstallment = useMemo(
    () => schedule?.installments.find((installment) => installment.outstandingAmount > 0) || schedule?.installments[0],
    [schedule],
  );

  if (!open || !schedule) return null;

  const currentPayable = schedule.totalPayable;
  const difference = changePayable ? round2(newTotalPayable - currentPayable) : 0;
  const handleDone = () => {
    const updates: Partial<PaymentSchedule> = {};
    if (changeDate && newDueDate) {
      updates.installments = schedule.installments.map((installment, index) =>
        index === 0 ? { ...installment, dueDate: new Date(newDueDate).toLocaleDateString("en-GB") } : installment,
      );
    }
    if (changeDiscount) updates.totalDiscount = round2(newDiscount);
    if (changePayable) updates.totalPayable = round2(newTotalPayable);
    if (remarks) updates.feeLines = schedule.feeLines.map((line, index) => index === 0 ? { ...line, remarks } : line);
    onSave(updates);
  };

  const optionLabel = (option: AdjustmentOption): string =>
    ADJUSTMENT_OPTIONS.find((item) => item.value === option)?.label || option;

  return (
    <div className="pm-dialog-overlay" onClick={onClose}>
      <div className="pm-dialog pm-edit-schedule-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="pm-dialog__header">
          <div className="pm-dialog__heading">
            <CalendarDays className="w-5 h-5" />
            <div><h3 className="pm-dialog__title">Edit Schedule</h3><p className="pm-dialog__subtitle">Update the payment schedule and choose how to adjust the amounts.</p></div>
          </div>
          <button type="button" className="pm-dialog__close" onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="pm-dialog__body pm-edit-schedule-dialog__body">
          <div className="pm-edit-schedule-dialog__choices">
            <label className={changeDate ? "is-selected" : ""}><input type="radio" checked={changeDate} onChange={() => { setChangeDate(true); setChangeDiscount(false); setChangePayable(false); }} /><CalendarDays /> <span>Change Date</span></label>
            <label className={changeDiscount ? "is-selected" : ""}><input type="radio" checked={changeDiscount} onChange={() => { setChangeDate(false); setChangeDiscount(true); setChangePayable(false); }} /><Percent /> <span>Change Discount</span></label>
            <label className={changePayable ? "is-selected" : ""}><input type="radio" checked={changePayable} onChange={() => { setChangeDate(false); setChangeDiscount(false); setChangePayable(true); }} /><CircleDollarSign /> <span>Change Payable Amount</span></label>
          </div>

          <section className="pm-edit-schedule-dialog__summary">
            <h4>PAYMENT SCHEDULE SUMMARY</h4>
            <table className="pm-table">
              <thead><tr><th>Installment</th><th>Amount</th><th>Discount</th><th>Net</th><th>Tax ({currentInstallment?.taxPercentage || 0}%)</th><th>Total</th></tr></thead>
              <tbody>
                <tr><td>Total Outstanding</td><td>{formatCurrency(schedule.totalOutstandingWithoutTax)}</td><td>{formatCurrency(schedule.totalDiscount)}</td><td>{formatCurrency(schedule.totalOutstandingWithoutTax)}</td><td>{formatCurrency(schedule.totalTax)}</td><td><strong>{formatCurrency(schedule.totalOutstanding)}</strong></td></tr>
                <tr><td>Current Installment</td><td>{formatCurrency(currentInstallment?.basicAmount || 0)}</td><td>{formatCurrency(currentInstallment?.discountAmount || 0)}</td><td>{formatCurrency(currentInstallment?.outstandingWithoutTax || 0)}</td><td>{formatCurrency(currentInstallment?.taxAmount || 0)}</td><td><strong>{formatCurrency(currentInstallment?.outstandingAmount || 0)}</strong></td></tr>
                <tr><td>Payment</td><td>{formatCurrency(currentInstallment?.basicAmount || 0)}</td><td>{formatCurrency(currentInstallment?.discountAmount || 0)}</td><td>{formatCurrency(currentInstallment?.outstandingWithoutTax || 0)}</td><td>{formatCurrency(currentInstallment?.taxAmount || 0)}</td><td><input className="pm-input" type="number" value={newTotalPayable} onChange={(event) => setNewTotalPayable(Number(event.target.value) || 0)} disabled={!changePayable} /></td></tr>
              </tbody>
            </table>
          </section>

          <div className="pm-edit-schedule-dialog__lower">
            <section className="pm-edit-schedule-dialog__remarks"><h4>REMARKS</h4><textarea className="pm-textarea" rows={4} placeholder="e.g. the student etc etc..." value={remarks} onChange={(event) => setRemarks(event.target.value)} /><span>0 / 500 characters</span></section>
            <section className="pm-edit-schedule-dialog__adjustment"><h4>SELECT ADJUSTMENT TYPE</h4>{ADJUSTMENT_OPTIONS.slice(0, 5).map((option, index) => <label key={option.value}><input type="radio" name="adjustment" checked={settleDifferenceOption === option.value} onChange={() => setSettleDifferenceOption(option.value)} /><span>{index === 0 ? optionLabel(option.value) : option.label}</span></label>)}</section>
          </div>
          {changePayable && difference !== 0 && <div className={difference > 0 ? "pm-dialog__notice pm-dialog__notice--error" : "pm-dialog__notice pm-dialog__notice--success"}>Adjustment difference: {formatCurrency(Math.abs(difference))}</div>}
        </div>
        <div className="pm-dialog__footer"><button type="button" className="pm-btn pm-btn--secondary" onClick={onClose}>Cancel</button><button type="button" className="pm-btn pm-btn--primary" onClick={handleDone}>Done</button></div>
      </div>
    </div>
  );
};
