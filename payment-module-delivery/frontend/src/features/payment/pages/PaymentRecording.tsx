import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Edit3, Link2, Save, Send } from "lucide-react";
import type { FeeLine, Installment, PaymentMethod, PaymentRecordingForm, PaymentSchedule } from "../paymentTypes";
import { getScheduleByIdMock, recordPaymentMock, sendPaymentLinkMock } from "../paymentService";
import { PAYMENT_METHODS } from "../paymentConstants";
import { formatCurrency, round2 } from "../paymentCalculations";
import { StudentDetailsBanner } from "../components/StudentDetailsBanner";

interface PaymentRecordingProps {
  scheduleId: string;
  installmentId?: string;
  onBack: () => void;
  onRecorded: (scheduleId: string) => void;
  onEditInstallments: (scheduleId: string) => void;
}

const toInputDate = (value: string): string => {
  if (!value) return "";
  if (value.includes("/")) return value.split("/").reverse().join("-");
  return value;
};

const toDisplayDate = (value: string): string =>
  value ? new Date(value).toLocaleDateString("en-GB") : "";

const feeTotal = (lines: FeeLine[]): number =>
  round2(lines.reduce((sum, line) => sum + line.netAmount, 0));

export const PaymentRecording: React.FC<PaymentRecordingProps> = ({
  scheduleId,
  installmentId,
  onBack,
  onRecorded,
  onEditInstallments,
}) => {
  const [schedule, setSchedule] = useState<PaymentSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notificationResult, setNotificationResult] = useState<string | null>(null);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState(installmentId || "");
  const [amountReceived, setAmountReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptNo, setReceiptNo] = useState("");
  const [manualReceiptNo, setManualReceiptNo] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [bank, setBank] = useState("");
  const [branchAddr, setBranchAddr] = useState("");
  const [remarks, setRemarks] = useState("");
  const [sendNotification, setSendNotification] = useState(false);
  const [sendPaymentLink, setSendPaymentLink] = useState(false);
  const [showAllOtherFees, setShowAllOtherFees] = useState(false);
  const [selectedOtherFeeIds, setSelectedOtherFeeIds] = useState<string[]>([]);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const loadedSchedule = await getScheduleByIdMock(scheduleId);
      setSchedule(loadedSchedule);
      if (loadedSchedule) {
        const target = installmentId
          ? loadedSchedule.installments.find((item) => item.id === installmentId)
          : loadedSchedule.installments.find((item) => item.outstandingAmount > 0 && item.status !== "Cancelled");
        if (target) {
          setSelectedInstallmentId(target.id);
          setAmountReceived(target.outstandingAmount);
        }
        setSelectedOtherFeeIds(
          loadedSchedule.feeLines.filter((line) => line.type === "OtherFee").map((line) => line.id),
        );
        setRemarks(loadedSchedule.remarks || "");
      }
    } catch {
      setSchedule(null);
      setError("Failed to load payment details.");
    } finally {
      setLoading(false);
    }
  }, [installmentId, scheduleId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const selectedInstallment: Installment | undefined = schedule?.installments.find(
    (item) => item.id === selectedInstallmentId,
  );

  const courseFeeLines = useMemo(
    () => schedule?.feeLines.filter((line) => line.type !== "OtherFee") ?? [],
    [schedule],
  );
  const otherFeeLines = useMemo(
    () => schedule?.feeLines.filter((line) => line.type === "OtherFee") ?? [],
    [schedule],
  );
  const visibleOtherFees = showAllOtherFees ? otherFeeLines : otherFeeLines.slice(0, 2);
  const selectedOtherFees = otherFeeLines.filter((line) => selectedOtherFeeIds.includes(line.id));
  const selectedOtherFeesTotal = feeTotal(selectedOtherFees);
  const courseFeesTotal = feeTotal(courseFeeLines);

  const handleInstallmentChange = (id: string) => {
    setSelectedInstallmentId(id);
    const installment = schedule?.installments.find((item) => item.id === id);
    if (installment) setAmountReceived(installment.outstandingAmount);
  };

  const toggleOtherFee = (id: string) => {
    setSelectedOtherFeeIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setNotificationResult(null);
    if (!schedule || !selectedInstallment) {
      setError("Please select an installment.");
      return;
    }
    if (amountReceived <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }
    if (amountReceived > selectedInstallment.outstandingAmount && !window.confirm("The amount is greater than the outstanding balance. Record anyway?")) {
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
        installmentId: selectedInstallment.id,
        amountReceived: round2(amountReceived),
        paymentMethod,
        payDate: toDisplayDate(payDate),
        receiptDate: toDisplayDate(receiptDate),
        receiptNo,
        manualReceiptNo,
        chequeNo,
        chequeDate: toDisplayDate(chequeDate),
        bank,
        branchAddr,
        remarks,
        sendNotification,
        sendPaymentLink,
      };
      const result = await recordPaymentMock(form);
      setSuccess(`Payment of ${formatCurrency(amountReceived)} recorded successfully.`);
      if (sendNotification || sendPaymentLink) {
        const linkResult = await sendPaymentLinkMock({
          scheduleId,
          channel: "WhatsApp",
          recipient: schedule.studentMobile,
          studentName: schedule.studentName,
          amount: result.schedule.totalOutstanding,
        });
        setNotificationResult(linkResult.message);
      }
      await fetchSchedule();
      window.setTimeout(() => onRecorded(scheduleId), 900);
    } catch {
      setError("Failed to record payment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="pm-page"><div className="pm-loading">Loading payment details...</div></div>;
  if (!schedule) return <div className="pm-page"><div className="pm-empty-state"><p className="pm-empty-state__text">Schedule not found.</p><button type="button" className="pm-btn pm-btn--primary" onClick={onBack}>Back</button></div></div>;

  return (
    <div className="pm-page pm-recording-page">
      <div className="pm-recording-page__topbar">
        <button type="button" className="pm-btn pm-btn--ghost" onClick={onBack}>← Back To Payment</button>
        <button type="button" className="pm-btn pm-btn--secondary" onClick={() => onEditInstallments(schedule.id)}><Edit3 /> Edit All Installments</button>
      </div>
      {error && <div className="pm-error-banner">{error}</div>}
      {success && <div className="pm-success-banner">{success}</div>}
      {notificationResult && <div className="pm-dialog__notice pm-dialog__notice--info">{notificationResult}</div>}
      <StudentDetailsBanner schedule={schedule} />

      <div className="pm-recording-layout">
        <div className="pm-recording-layout__main">
          <section className="pm-recording-card">
            <div className="pm-recording-card__heading"><h3>INSTALLMENT</h3><button type="button" className="pm-btn pm-btn--secondary" onClick={() => onEditInstallments(schedule.id)}>Edit All Installments</button></div>
            <div className="pm-recording-table-wrap">
              <table className="pm-table pm-recording-table">
                <thead><tr><th>No.</th><th>Name</th><th>Date</th><th>Amount</th><th>Discount</th><th>Net</th><th>Tax</th><th>Total</th><th>Actions</th></tr></thead>
                <tbody>{schedule.installments.map((item) => <tr key={item.id} className={item.id === selectedInstallmentId ? "is-selected" : ""}>
                  <td><input type="checkbox" checked={item.id === selectedInstallmentId} onChange={() => handleInstallmentChange(item.id)} aria-label={`Select ${item.installmentName}`} /></td>
                  <td>{String(item.installmentNo).padStart(2, "0")}<span className="pm-recording-table__name">{item.installmentName}</span></td>
                  <td>{item.dueDate || "-"}</td><td>{formatCurrency(item.basicAmount)}</td><td>{formatCurrency(item.discountAmount)}</td><td>{formatCurrency(item.netAmount)}</td><td>{formatCurrency(item.taxAmount)}</td><td className="pm-text-semibold">{formatCurrency(item.netAmount)}</td>
                  <td><button type="button" className="pm-icon-btn" title="Select installment" onClick={() => handleInstallmentChange(item.id)}><Edit3 /></button></td>
                </tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="pm-recording-card">
            <div className="pm-recording-card__heading"><h3>APPLICABLE OTHER FEES</h3><span>Showing {otherFeeLines.length} Applicable Fees For {schedule.studentName.toUpperCase()}</span><button type="button" className="pm-btn pm-btn--secondary" onClick={() => setShowAllOtherFees((value) => !value)}>{showAllOtherFees ? "Show Less" : "Show All Other Fees"}</button></div>
            <div className="pm-recording-table-wrap"><table className="pm-table pm-recording-table"><thead><tr><th>Other Fees</th><th>Frequency</th><th>Amount</th><th>Discount</th><th>Net</th><th>Tax</th><th>Total</th></tr></thead><tbody>{visibleOtherFees.map((line) => <tr key={line.id}><td><input type="checkbox" checked={selectedOtherFeeIds.includes(line.id)} onChange={() => toggleOtherFee(line.id)} /> {line.name}</td><td>One Time</td><td>{formatCurrency(line.basicAmount)}</td><td>{formatCurrency(line.discountAmount)}</td><td>{formatCurrency(line.basicAmount - line.discountAmount)}</td><td>{formatCurrency(line.taxAmount)}</td><td>{formatCurrency(line.netAmount)}</td></tr>)}</tbody><tfoot><tr className="pm-table__total-row"><td colSpan={2}>Selected Other Fees Total ({selectedOtherFees.length} selected)</td><td colSpan={4}></td><td>{formatCurrency(selectedOtherFeesTotal)}</td></tr></tfoot></table></div>
          </section>

          <section className="pm-recording-card">
            <div className="pm-recording-card__heading"><h3>PAYMENT DETAILS</h3></div>
            <div className="pm-recording-fields">
              <label className="pm-form-group"><span className="pm-label">Payment method</span><select className="pm-select" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>{PAYMENT_METHODS.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}</select></label>
              <label className="pm-form-group"><span className="pm-label">Reference/Transaction Number</span><input className="pm-input" value={receiptNo} onChange={(event) => setReceiptNo(event.target.value)} placeholder="e.g.12347625" /></label>
              <label className="pm-form-group"><span className="pm-label">Amount Received</span><input className="pm-input" type="number" min="0" value={amountReceived} onChange={(event) => setAmountReceived(Number(event.target.value) || 0)} /></label>
              {paymentMethod === "Cheque" && <label className="pm-form-group"><span className="pm-label">Cheque No.</span><input className="pm-input" value={chequeNo} onChange={(event) => setChequeNo(event.target.value)} /></label>}
            </div>
          </section>

          <section className="pm-recording-card"><div className="pm-recording-card__heading"><h3>REMARKS</h3></div><textarea className="pm-textarea" rows={3} value={remarks} onChange={(event) => setRemarks(event.target.value)} placeholder="Optional notes" /></section>
        </div>

        <aside className="pm-recording-summary">
          <div className="pm-recording-card__heading"><h3>PAYMENT SUMMARY</h3></div>
          <label className="pm-form-group"><span className="pm-label">Receipt Date</span><span className="pm-date-input"><input type="date" value={receiptDate} onChange={(event) => setReceiptDate(event.target.value)} /><CalendarDays /></span></label>
          <label className="pm-form-group"><span className="pm-label">Receipt Number</span><input className="pm-input" value={manualReceiptNo} onChange={(event) => setManualReceiptNo(event.target.value)} placeholder="Receipt number" /></label>
          <div className="pm-recording-summary__group"><h4>COURSE FEES</h4><div><span>Amount</span><strong>{formatCurrency(courseFeesTotal)}</strong></div><div><span>Discount</span><strong>{formatCurrency(schedule.totalDiscount)}</strong></div><div><span>Tax</span><strong>{formatCurrency(schedule.totalTax)}</strong></div><div><span>Total</span><strong>{formatCurrency(courseFeesTotal)}</strong></div></div>
          <div className="pm-recording-summary__group"><h4>OTHER FEES</h4><div><span>Selected</span><strong>{formatCurrency(selectedOtherFeesTotal)}</strong></div><div><span>Total</span><strong>{formatCurrency(selectedOtherFeesTotal)}</strong></div></div>
          <div className="pm-recording-summary__total"><span>Total Payable</span><strong>{formatCurrency(round2(courseFeesTotal + selectedOtherFeesTotal))}</strong></div>
          <label className="pm-checkbox-label"><input type="checkbox" checked={sendNotification} onChange={(event) => setSendNotification(event.target.checked)} />Send Notification on save</label>
          <button type="button" className="pm-btn pm-btn--primary pm-recording-summary__save" onClick={handleSave} disabled={saving}><Save />{saving ? "Saving..." : "Save"}</button>
          <div className="pm-recording-summary__actions"><button type="button" className="pm-btn pm-btn--warning" onClick={() => setSendPaymentLink(true)}><Link2 /> Send Payment Link</button><button type="button" className="pm-btn pm-btn--danger" onClick={onBack}>× Cancel</button></div>
          {sendPaymentLink && <div className="pm-dialog__notice pm-dialog__notice--info"><button type="button" className="pm-btn pm-btn--primary pm-btn--sm" onClick={handleSave}><Send /> Confirm Send</button></div>}
        </aside>
      </div>
    </div>
  );
};
