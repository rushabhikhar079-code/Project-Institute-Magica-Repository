import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, FilePenLine, X } from "lucide-react";
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

  useEffect(() => {
    if (!installment) return;
    setDueDate(installment.dueDate ? installment.dueDate.split("/").reverse().join("-") : "");
    setBasicAmount(installment.basicAmount);
    setDiscountAmount(installment.discountAmount);
  }, [installment]);

  const taxAmount = useMemo(() => {
    if (!installment) return 0;
    return round2(round2(basicAmount - discountAmount) * (installment.taxPercentage / 100));
  }, [basicAmount, discountAmount, installment]);

  if (!open || !installment) return null;

  const netAmount = round2(basicAmount - discountAmount);
  const totalAmount = round2(netAmount + taxAmount);
  const handleSave = () => {
    onSave({
      dueDate: dueDate ? new Date(dueDate).toLocaleDateString("en-GB") : "",
      basicAmount: round2(basicAmount),
      discountAmount: round2(discountAmount),
      taxAmount,
      netAmount: totalAmount,
      outstandingAmount: round2(totalAmount - installment.paidAmount),
      outstandingWithoutTax: round2(netAmount - installment.paidAmount),
    });
  };

  return (
    <div className="pm-dialog-overlay" onClick={onClose}>
      <div className="pm-dialog pm-edit-installment-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="pm-dialog__header">
          <div className="pm-dialog__heading">
            <FilePenLine className="w-5 h-5" />
            <h3 className="pm-dialog__title">Edit Installment</h3>
          </div>
          <button type="button" className="pm-dialog__close" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="pm-dialog__body pm-edit-installment-dialog__body">
          <div className="pm-dialog__notice pm-dialog__notice--info">
            Update installment details below and click save.
          </div>
          <div className="pm-edit-installment-dialog__table-wrap">
            <table className="pm-table pm-edit-installment-dialog__table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Discount</th>
                  <th>Net</th>
                  <th>Tax</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{installment.installmentNo}</td>
                  <td>
                    <label className="pm-date-input">
                      <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
                      <CalendarDays />
                    </label>
                  </td>
                  <td><input className="pm-input" type="number" min="0" value={basicAmount} onChange={(event) => setBasicAmount(Number(event.target.value) || 0)} /></td>
                  <td><input className="pm-input" type="number" min="0" value={discountAmount} onChange={(event) => setDiscountAmount(Number(event.target.value) || 0)} /></td>
                  <td>{formatCurrency(netAmount)}</td>
                  <td>{formatCurrency(taxAmount)}</td>
                  <td><strong>{formatCurrency(totalAmount)}</strong></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Total</td>
                  <td>{formatCurrency(basicAmount)}</td>
                  <td>{formatCurrency(discountAmount)}</td>
                  <td>{formatCurrency(netAmount)}</td>
                  <td>{formatCurrency(taxAmount)}</td>
                  <td>{formatCurrency(totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="pm-edit-installment-dialog__totals">
            <div>Total Amount : <strong>{formatCurrency(totalAmount)}</strong></div>
            <div>Remaining Amount : <strong>{formatCurrency(totalAmount - installment.paidAmount)}</strong></div>
            <div>Paid Amount : <strong className="pm-text-success">{formatCurrency(installment.paidAmount)}</strong></div>
            <div>Remaining Amount : <strong className="pm-text-danger">{formatCurrency(totalAmount - installment.paidAmount)}</strong></div>
          </div>
        </div>
        <div className="pm-dialog__footer">
          <button type="button" className="pm-btn pm-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="pm-btn pm-btn--primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};
