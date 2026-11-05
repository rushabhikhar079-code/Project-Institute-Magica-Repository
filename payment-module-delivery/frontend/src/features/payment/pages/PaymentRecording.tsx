// ─── Payment Recording Page ────────────────────────────────────────────────────
// Records a payment collection against an installment.
// Supports: Cash, Cheque, UPI, Card, Bank Transfer, Online.
// For Adhoc: after partial collection, remaining balance auto-becomes next installment.
import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Save } from "lucide-react";
import type { PaymentSchedule, Installment, PaymentRecordingForm, PaymentMethod } from "../paymentTypes";
import { getScheduleByIdMock, recordPaymentMock } from "../paymentService";
import { PAYMENT_METHODS } from "../paymentConstants";
import { formatCurrency, round2 } from "../paymentCalculations";
import { StudentPaymentSummary } from "../components/StudentPaymentSummary";

interface PaymentRecordingProps {
  scheduleId: string;
  installmentId?: string;
  onBack: () => void;
  onRecorded: (scheduleId: string) => void;
}

export const PaymentRecording: React.FC<PaymentRecordingProps> = ({
  scheduleId,
  installmentId,
  onBack,
  onRecorded,
}) => {
  const [schedule, setSchedule] = useState<PaymentSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string>("");
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptNo, setReceiptNo] = useState("");
  const [manualReceiptNo, setManualReceiptNo] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [bank, setBank] = useState("");
  const [branchAddr, setBranchAddr] = useState("");
  const [remarks, setRemarks] = useState("");

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const sch = await getScheduleByIdMock(scheduleId);
      setSchedule(sch);
      if (sch) {
        // Auto-select installment if provided, or first outstanding
        const target = installmentId
          ? sch.installments.find((i) => i.id === installmentId)
          : sch.installments.find((i) => i.outstandingAmount > 0 && i.status !== "Cancelled");
        if (target) {
          setSelectedInstallmentId(target.id);
          setAmountReceived(target.outstandingAmount);
        }
      }
    } catch {
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  }, [scheduleId, installmentId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const selectedInstallment: Installment | undefined = schedule?.installments.find(
    (i) => i.id === selectedInstallmentId,
  );

  const requiresInstrument = paymentMethod === "Cheque" || paymentMethod === "BankTransfer";

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!schedule || !selectedInstallment) {
      setError("Please select an installment.");
      return;
    }

    if (amountReceived <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (amountReceived > selectedInstallment.outstandingAmount) {
      const proceed = window.confirm(
        `Amount (${formatCurrency(amountReceived)}) exceeds outstanding balance (${formatCurrency(selectedInstallment.outstandingAmount)}). Record anyway?`,
      );
      if (!proceed) return;
    }

    if (requiresInstrument && !bank.trim()) {
      setError("Bank name is required for this payment method.");
      return;
    }

    if (paymentMethod === "Cheque" && !chequeNo.trim()) {
      setError("Cheque number is required for cheque payments.");
      return;
    }

    setSaving(true);
    try {
      const form: PaymentRecordingForm = {
        scheduleId,
        installmentId: selectedInstallmentId,
        amountReceived: round2(amountReceived),
        paymentMethod,
        payDate: payDate ? new Date(payDate).toLocaleDateString("en-GB") : "",
        receiptNo,
        manualReceiptNo,
        chequeNo,
        chequeDate: chequeDate ? new Date(chequeDate).toLocaleDateString("en-GB") : "",
        bank,
        branchAddr,
        remarks,
      };

      const result = await recordPaymentMock(form);

      if (schedule.paymentType === "Adhoc" && result.schedule.totalOutstanding > 0) {
        setSuccess(
          `Payment of ${formatCurrency(amountReceived)} recorded. Remaining balance of ${formatCurrency(result.schedule.totalOutstanding)} has been auto-created as the next Adhoc installment.`,
        );
      } else {
        setSuccess(`Payment of ${formatCurrency(amountReceived)} recorded successfully.`);
      }

      // Refresh schedule
      await fetchSchedule();

      setTimeout(() => onRecorded(scheduleId), 2000);
    } catch {
      setError("Failed to record payment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="pm-page"><div className="pm-loading">Loading schedule...</div></div>;
  }

  if (!schedule) {
    return (
      <div className="pm-page">
        <div className="pm-empty-state">
          <p className="pm-empty-state__text">Schedule not found.</p>
          <button type="button" className="pm-btn pm-btn--primary" onClick={onBack}>Back</button>
        </div>
      </div>
    );
  }

  if (schedule.status === "Cancelled") {
    return (
      <div className="pm-page">
        <div className="pm-page__header">
          <button type="button" className="pm-btn pm-btn--ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <div className="pm-card pm-empty-state">
          <p className="pm-empty-state__text">This schedule is cancelled. Payments cannot be recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-page">
      <div className="pm-page__header">
        <button type="button" className="pm-btn pm-btn--ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="pm-page__title">Record Payment</h1>
      </div>

      {error && <div className="pm-error-banner">{error}</div>}
      {success && <div className="pm-success-banner">{success}</div>}

      <StudentPaymentSummary schedule={schedule} />

      <div className="pm-card pm-recording-form">
        <h3 className="pm-recording-form__title">Payment Details</h3>

        {/* Installment Selection */}
        <div className="pm-form-group">
          <label className="pm-label">Select Installment</label>
          <select
            className="pm-select"
            value={selectedInstallmentId}
            onChange={(e) => {
              setSelectedInstallmentId(e.target.value);
              const inst = schedule.installments.find((i) => i.id === e.target.value);
              if (inst) setAmountReceived(inst.outstandingAmount);
            }}
          >
            <option value="">Select an installment</option>
            {schedule.installments
              .filter((i) => i.status !== "Paid" && i.status !== "Cancelled")
              .map((inst) => (
                <option key={inst.id} value={inst.id}>
                  #{inst.installmentNo} - Due: {inst.dueDate} - Outstanding: {formatCurrency(inst.outstandingAmount)}
                </option>
              ))}
          </select>
        </div>

        {selectedInstallment && (
          <div className="pm-recording-form__installment-info">
            <div className="pm-recording-form__info-item">
              <span className="pm-label">Installment No.</span>
              <span className="pm-text-semibold">#{selectedInstallment.installmentNo}</span>
            </div>
            <div className="pm-recording-form__info-item">
              <span className="pm-label">Net Amount</span>
              <span className="pm-text-semibold">{formatCurrency(selectedInstallment.netAmount)}</span>
            </div>
            <div className="pm-recording-form__info-item">
              <span className="pm-label">Paid</span>
              <span className="pm-text-success pm-text-semibold">{formatCurrency(selectedInstallment.paidAmount)}</span>
            </div>
            <div className="pm-recording-form__info-item">
              <span className="pm-label">Outstanding</span>
              <span className="pm-text-danger pm-text-semibold">{formatCurrency(selectedInstallment.outstandingAmount)}</span>
            </div>
          </div>
        )}

        <div className="pm-dialog__form-row">
          <div className="pm-form-group">
            <label className="pm-label">Amount Received *</label>
            <input
              type="number"
              className="pm-input"
              step="0.01"
              min="0"
              value={amountReceived}
              onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="pm-form-group">
            <label className="pm-label">Payment Method *</label>
            <select
              className="pm-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pm-dialog__form-row">
          <div className="pm-form-group">
            <label className="pm-label">Payment Date *</label>
            <input
              type="date"
              className="pm-input"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
            />
          </div>
          <div className="pm-form-group">
            <label className="pm-label">Manual Receipt No.</label>
            <input
              type="text"
              className="pm-input"
              value={manualReceiptNo}
              onChange={(e) => setManualReceiptNo(e.target.value)}
              placeholder="Optional manual receipt number"
            />
          </div>
        </div>

        {requiresInstrument && (
          <>
            <div className="pm-dialog__form-row">
              <div className="pm-form-group">
                <label className="pm-label">
                  {paymentMethod === "Cheque" ? "Cheque No. *" : "Transaction Ref."}
                </label>
                <input
                  type="text"
                  className="pm-input"
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                />
              </div>
              {paymentMethod === "Cheque" && (
                <div className="pm-form-group">
                  <label className="pm-label">Cheque Date</label>
                  <input
                    type="date"
                    className="pm-input"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="pm-dialog__form-row">
              <div className="pm-form-group">
                <label className="pm-label">Bank {requiresInstrument ? "*" : ""}</label>
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

        {/* Adhoc notice */}
        {schedule.paymentType === "Adhoc" && (
          <div className="pm-dialog__notice pm-dialog__notice--info">
            For Adhoc payments, any remaining balance after this collection will automatically
            become the next Adhoc installment. No new charge is added.
          </div>
        )}

        <div className="pm-recording-form__actions">
          <button type="button" className="pm-btn pm-btn--secondary" onClick={onBack}>
            Cancel
          </button>
          <button
            type="button"
            className="pm-btn pm-btn--primary"
            onClick={handleSave}
            disabled={saving || !selectedInstallmentId || amountReceived <= 0}
          >
            <Save className="w-4 h-4" />
            {saving ? "Recording..." : "Record Payment"}
          </button>
        </div>
      </div>

      <div className="pm-mock-notice">
        Note: This is a MOCK payment recording. The data will not persist across page reloads.
        A backend collection API is required for permanent storage.
      </div>
    </div>
  );
};
