// ─── Modify Receipt Dialog ─────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { PaymentReceipt } from "../paymentTypes";
import { PAYMENT_METHODS } from "../paymentConstants";
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
  const [manualReceiptNo, setManualReceiptNo] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [bank, setBank] = useState("");
  const [branchAddr, setBranchAddr] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (receipt) {
      setManualReceiptNo(receipt.manualReceiptNo || "");
      setChequeNo(receipt.chequeNo || "");
      setChequeDate(receipt.chequeDate ? receipt.chequeDate.split("/").reverse().join("-") : "");
      setBank(receipt.bank || "");
      setBranchAddr(receipt.branchAddr || "");
      setRemarks(receipt.remarks || "");
    }
  }, [receipt]);

  if (!open || !receipt) return null;

  const requiresInstrument = receipt.paymentMethod === "Cheque" || receipt.paymentMethod === "BankTransfer";

  const handleSave = () => {
    onSave({
      manualReceiptNo,
      chequeNo,
      chequeDate: chequeDate ? new Date(chequeDate).toLocaleDateString("en-GB") : "",
      bank,
      branchAddr,
      remarks,
    });
  };

  return (
    <div className="pm-dialog-overlay" onClick={onClose}>
      <div className="pm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pm-dialog__header">
          <h3 className="pm-dialog__title">Modify Receipt Details</h3>
          <button type="button" className="pm-dialog__close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pm-dialog__body">
          <div className="pm-dialog__info-grid">
            <div className="pm-dialog__info-item">
              <span className="pm-label">Receipt No.</span>
              <span className="pm-text-semibold">{receipt.receiptNo}</span>
            </div>
            <div className="pm-dialog__info-item">
              <span className="pm-label">Amount</span>
              <span className="pm-text-semibold">{formatCurrency(receipt.amount)}</span>
            </div>
            <div className="pm-dialog__info-item">
              <span className="pm-label">Method</span>
              <span className="pm-text-semibold">{receipt.paymentMethod}</span>
            </div>
            <div className="pm-dialog__info-item">
              <span className="pm-label">Pay Date</span>
              <span className="pm-text-semibold">{receipt.payDate}</span>
            </div>
          </div>

          <div className="pm-form-group">
            <label className="pm-label">Manual Receipt No.</label>
            <input
              type="text"
              className="pm-input"
              value={manualReceiptNo}
              onChange={(e) => setManualReceiptNo(e.target.value)}
            />
          </div>

          {requiresInstrument && (
            <>
              <div className="pm-dialog__form-row">
                <div className="pm-form-group">
                  <label className="pm-label">Cheque / Transaction No.</label>
                  <input
                    type="text"
                    className="pm-input"
                    value={chequeNo}
                    onChange={(e) => setChequeNo(e.target.value)}
                  />
                </div>
                <div className="pm-form-group">
                  <label className="pm-label">Cheque Date</label>
                  <input
                    type="date"
                    className="pm-input"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="pm-dialog__form-row">
                <div className="pm-form-group">
                  <label className="pm-label">Bank</label>
                  <input
                    type="text"
                    className="pm-input"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                  />
                </div>
                <div className="pm-form-group">
                  <label className="pm-label">Branch Address</label>
                  <input
                    type="text"
                    className="pm-input"
                    value={branchAddr}
                    onChange={(e) => setBranchAddr(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

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
          <button type="button" className="pm-btn pm-btn--primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
