// ─── Schedule Overview Page ────────────────────────────────────────────────────
// Shows the detail of a single payment schedule: fee lines, installments, receipts.
import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Edit, Send } from "lucide-react";
import type { PaymentSchedule, Installment, PaymentReceipt } from "../paymentTypes";
import { getScheduleByIdMock, getReceiptsByScheduleMock, updateInstallmentMock, updateScheduleMock } from "../paymentService";
import { StudentPaymentSummary } from "../components/StudentPaymentSummary";
import { ScheduleTable } from "../components/ScheduleTable";
import { EditInstallmentDialog } from "../dialogs/EditInstallmentDialog";
import { EditScheduleDialog } from "../dialogs/EditScheduleDialog";
import { SendPaymentLinkDialog } from "../dialogs/SendPaymentLinkDialog";
import { ModifyReceiptDialog } from "../dialogs/ModifyReceiptDialog";
import { getReceiptColumns } from "../paymentColumns";

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
    // NOTE: Mock only — no backend receipt-editing API exists.
    const { updateReceiptMock } = await import("../paymentService");
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

      <StudentPaymentSummary schedule={schedule} />

      <div className="pm-section">
        <h3 className="pm-section__title">Installment Schedule</h3>
        <ScheduleTable
          installments={schedule.installments}
          onEditInstallment={(inst) => setEditInstallment(inst)}
          onRecordPayment={(inst) => onRecordPayment(schedule.id, inst.id)}
          scheduleStatus={schedule.status}
        />
      </div>

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
