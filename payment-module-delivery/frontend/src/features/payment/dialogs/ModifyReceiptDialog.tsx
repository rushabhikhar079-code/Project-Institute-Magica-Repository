import React, { useState, useEffect } from "react";
import { CalendarDays, FilePenLine, X } from "lucide-react";
import type { PaymentReceipt } from "../paymentTypes";
import { formatCurrency } from "../paymentCalculations";

interface ModifyReceiptDialogProps {
  open: boolean;
  receipt: PaymentReceipt | null;
  onClose: () => void;
  onSave: (updates: Partial<PaymentReceipt>) => void;
}

export const ModifyReceiptDialog: React.FC<ModifyReceiptDialogProps> = ({
  open,
  receipt,
  onClose,
  onSave,
}) => {
  const [receiptDate, setReceiptDate] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (receipt) {
      setReceiptDate(receipt.receiptDate ? receipt.receiptDate.split("/").reverse().join("-") : "");
      setReceiptNo(receipt.manualReceiptNo || receipt.receiptNo);
      setRemarks(receipt.remarks || "");
    }
  }, [receipt]);

  if (!open || !receipt) return null;

  const handleSave = () => {
    onSave({
      receiptDate: receiptDate ? new Date(receiptDate).toLocaleDateString("en-GB") : receipt.receiptDate,
      manualReceiptNo: receiptNo,
      remarks,
    });
  };

  return (
    <div className="pm-dialog-overlay" onClick={onClose}>
      <div className="pm-dialog pm-dialog--receipt" onClick={(event) => event.stopPropagation()}>
        <div className="pm-dialog__header">
          <div className="pm-dialog__heading"><FilePenLine className="w-5 h-5" /><h3 className="pm-dialog__title">Modify Payment Receipt Details</h3></div>
          <button type="button" className="pm-dialog__close" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="pm-dialog__body pm-receipt-dialog__body">
          <div className="pm-receipt-dialog__row"><span>Student Name</span><b>:</b><strong>{receipt.studentName || "-"}</strong></div>
          <div className="pm-receipt-dialog__row"><span>Receipt Date</span><b>:</b><label className="pm-date-input"><input type="date" value={receiptDate} onChange={(event) => setReceiptDate(event.target.value)} /><CalendarDays /></label></div>
          <div className="pm-receipt-dialog__row"><span>Paid Amount</span><b>:</b><strong className="pm-text-primary">{formatCurrency(receipt.amount)}</strong></div>
          <div className="pm-receipt-dialog__row"><span>Receipt No.</span><b>:</b><input className="pm-input" value={receiptNo} onChange={(event) => setReceiptNo(event.target.value)} /></div>
          <div className="pm-receipt-dialog__row pm-receipt-dialog__row--remarks"><span>Remarks</span><b>:</b><textarea className="pm-textarea" rows={2} value={remarks} onChange={(event) => setRemarks(event.target.value)} /></div>
        </div>
        <div className="pm-dialog__footer">
          <button type="button" className="pm-btn pm-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="pm-btn pm-btn--primary" onClick={handleSave}>Ok</button>
        </div>
      </div>
    </div>
  );
};
