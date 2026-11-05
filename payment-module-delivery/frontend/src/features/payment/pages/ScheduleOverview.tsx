// ─── Schedule Overview Page ────────────────────────────────────────────────────
// Shows the detail of a single payment schedule: fee lines, installments, receipts.
import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Edit, Send } from "lucide-react";
import type { PaymentSchedule, Installment, PaymentReceipt } from "../paymentTypes";
import { getScheduleByIdMock, getReceiptsByScheduleMock, updateInstallmentMock, updateScheduleMock, updateReceiptMock } from "../paymentService";
import { StudentDetailsBanner } from "../components/StudentDetailsBanner";
import { ScheduleTable } from "../components/ScheduleTable";
import { EditInstallmentDialog } from "../dialogs/EditInstallmentDialog";
import { EditScheduleDialog } from "../dialogs/EditScheduleDialog";
import { SendPaymentLinkDialog } from "../dialogs/SendPaymentLinkDialog";
import { ModifyReceiptDialog } from "../dialogs/ModifyReceiptDialog";
import { getReceiptColumns } from "../paymentColumns";
import { formatCurrency } from "../paymentCalculations";

interface ScheduleOverviewProps {
  scheduleId: string;
  onBack: () => void;
  onRecordPayment: (scheduleId: string, installmentId?: string) => void;
}

export const ScheduleOverview: React.FC<ScheduleOverviewProps> = ({
  scheduleId,
  onBack,
  onRecordPayment,
}) => {
  const [schedule, setSchedule] = useState<PaymentSchedule | null>(null);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editInstallment, setEditInstallment] = useState<Installment | null>(null);
  const [editScheduleOpen, setEditScheduleOpen] = useState(false);
  const [sendLinkOpen, setSendLinkOpen] = useState(false);
  const [modifyReceipt, setModifyReceipt] = useState<PaymentReceipt | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const sch = await getScheduleByIdMock(scheduleId);
      setSchedule(sch);
      if (sch) {
        const rcpts = await getReceiptsByScheduleMock(scheduleId);
        setReceipts(rcpts);
      }
    } catch {
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditInstallmentSave = async (updates: Partial<Installment>) => {
    if (!schedule || !editInstallment) return;
    await updateInstallmentMock(schedule.id, editInstallment.id, updates);
    setEditInstallment(null);
    fetchData();
  };

  const handleEditScheduleSave = async (updates: Partial<PaymentSchedule>) => {
    if (!schedule) return;
    await updateScheduleMock(schedule.id, updates);
    setEditScheduleOpen(false);
    fetchData();
  };

  const handleModifyReceiptSave = async (updates: Partial<PaymentReceipt>) => {
    if (!modifyReceipt) return;
    await updateReceiptMock(modifyReceipt.id, updates);
    setModifyReceipt(null);
    fetchData();
  };

  const receiptColumns = getReceiptColumns({ onModify: (r) => setModifyReceipt(r) });

  if (loading) {
    return <div className="pm-page"><div className="pm-loading">Loading schedule...</div></div>;
  }

  if (!schedule) {
    return (
      <div className="pm-page">
        <div className="pm-empty-state">
          <p className="pm-empty-state__text">Schedule not found.</p>
          <button type="button" className="pm-btn pm-btn--primary" onClick={onBack}>
            Back to Manage Payments
          </button>
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
        <div className="pm-page__header-actions">
          <button
            type="button"
            className="pm-btn pm-btn--secondary"
            onClick={() => setEditScheduleOpen(true)}
            disabled={schedule.status === "Completed" || schedule.status === "Cancelled"}
          >
            <Edit className="w-4 h-4" />
            Edit Schedule
          </button>
          <button
            type="button"
            className="pm-btn pm-btn--secondary"
            onClick={() => setSendLinkOpen(true)}
          >
            <Send className="w-4 h-4" />
            Send Payment Link
          </button>
        </div>
      </div>

      <StudentDetailsBanner schedule={schedule} />

      <div className="pm-overview-grid">
        <section className="pm-section">
          <div className="pm-overview-section-heading"><h3 className="pm-section__title">INSTALLMENT</h3><button type="button" className="pm-btn pm-btn--secondary" onClick={() => schedule.installments.length > 0 && setEditInstallment(schedule.installments[0])}>Edit All Installments</button></div>
          <ScheduleTable
            installments={schedule.installments}
            onEditInstallment={(inst) => setEditInstallment(inst)}
            onRecordPayment={(inst) => onRecordPayment(schedule.id, inst.id)}
            scheduleStatus={schedule.status}
          />
        </section>
        <aside className="pm-overview-summary pm-section">
          <h3 className="pm-section__title">PAYMENT SUMMARY</h3>
          <div className="pm-overview-summary__group"><strong>COURSE FEES</strong><div><span>Amount</span><b>{formatCurrency(schedule.totalNetAmount)}</b></div><div><span>Discount</span><b>{formatCurrency(schedule.totalDiscount)}</b></div><div><span>Tax</span><b>{formatCurrency(schedule.totalTax)}</b></div><div><span>Total</span><b>{formatCurrency(schedule.totalPayable)}</b></div></div>
          <div className="pm-overview-summary__payable"><span>Total Payable</span><strong>{formatCurrency(schedule.totalPayable)}</strong></div>
        </aside>
      </div>

      <section className="pm-section pm-overview-fees"><div className="pm-overview-section-heading"><h3 className="pm-section__title">APPLICABLE OTHER FEES</h3><span>Showing {schedule.feeLines.filter((line) => line.type === "OtherFee").length} Applicable Fees For {schedule.studentName.toUpperCase()}</span><button type="button" className="pm-btn pm-btn--secondary">Show All Other Fees</button></div><table className="pm-table"><thead><tr><th>Other Fees</th><th>Frequency</th><th>Amount</th><th>Discount</th><th>Net</th><th>Tax</th><th>Total</th></tr></thead><tbody>{schedule.feeLines.filter((line) => line.type === "OtherFee").map((line) => <tr key={line.id}><td>{line.name}</td><td>{line.frequency || "-"}</td><td>{formatCurrency(line.basicAmount)}</td><td>{formatCurrency(line.discountAmount)}</td><td>{formatCurrency(line.basicAmount - line.discountAmount)}</td><td>{formatCurrency(line.taxAmount)}</td><td>{formatCurrency(line.netAmount)}</td></tr>)}</tbody></table></section>

      <div className="pm-section">
        <h3 className="pm-section__title">Payment Receipts</h3>
        {receipts.length === 0 ? (
          <div className="pm-card pm-empty-state">
            <p className="pm-empty-state__text">No receipts recorded yet.</p>
          </div>
        ) : (
          <div className="pm-card pm-data-table-card">
            <table className="pm-table">
              <thead>
                <tr>
                  {receiptColumns.map((col) => (
                    <th key={col.key} style={{ width: col.width, textAlign: col.align || "left" }}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id}>
                    {receiptColumns.map((col) => (
                      <td key={`${receipt.id}-${col.key}`} style={{ textAlign: col.align || "left" }}>
                        {col.render(receipt)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditInstallmentDialog
        open={!!editInstallment}
        installment={editInstallment}
        onClose={() => setEditInstallment(null)}
        onSave={handleEditInstallmentSave}
      />
      <EditScheduleDialog
        open={editScheduleOpen}
        schedule={schedule}
        onClose={() => setEditScheduleOpen(false)}
        onSave={handleEditScheduleSave}
      />
      <SendPaymentLinkDialog
        open={sendLinkOpen}
        schedule={schedule}
        onClose={() => setSendLinkOpen(false)}
      />
      <ModifyReceiptDialog
        open={!!modifyReceipt}
        receipt={modifyReceipt}
        onClose={() => setModifyReceipt(null)}
        onSave={handleModifyReceiptSave}
      />
    </div>
  );
};
