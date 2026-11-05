// ─── Edit Installments Page (XD Screen 2) ─────────────────────────────────────
// Full installment table editing view. Allows inline editing of due dates,
// amounts, discounts, and remarks for all installments in a schedule.
// Paid installments are locked. Includes Save and Save & Pay actions.
import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Save, CreditCard, RotateCcw } from "lucide-react";
import type { PaymentSchedule, Installment } from "../paymentTypes";
import { getScheduleByIdMock, updateInstallmentMock, updateScheduleMock } from "../paymentService";
import { formatCurrency, round2, distributeEqually } from "../paymentCalculations";
import { StudentDetailsBanner } from "../components/StudentDetailsBanner";

interface EditInstallmentsProps {
  scheduleId: string;
  onBack: () => void;
  onRecordPayment: (scheduleId: string, installmentId?: string) => void;
}

export const EditInstallments: React.FC<EditInstallmentsProps> = ({
  scheduleId,
  onBack,
  onRecordPayment,
}) => {
  const [schedule, setSchedule] = useState<PaymentSchedule | null>(null);
  const [editingInstallments, setEditingInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const sch = await getScheduleByIdMock(scheduleId);
      setSchedule(sch);
      if (sch) {
        setEditingInstallments(sch.installments.map((i) => ({ ...i })));
      }
    } catch {
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleFieldChange = (id: string, field: keyof Installment, value: string | number) => {
    setEditingInstallments((prev) =>
      prev.map((inst) => {
        if (inst.id !== id) return inst;
        if (inst.status === "Paid" || inst.status === "Cancelled") return inst;
        const updated = { ...inst, [field]: value };
        if (field === "basicAmount" || field === "discountAmount") {
          updated.netAmount = round2(
            round2(updated.basicAmount - updated.discountAmount) + updated.taxAmount,
          );
          updated.outstandingAmount = round2(updated.netAmount - updated.paidAmount);
          updated.outstandingWithoutTax = round2(
            round2(updated.basicAmount - updated.discountAmount) - updated.paidAmount,
          );
        }
        return updated;
      }),
    );
  };

  const handleReset = () => {
    if (!schedule) return;
    const total = schedule.totalPayable;
    const count = editingInstallments.length;
    const amounts = distributeEqually(total, count);
    setEditingInstallments((prev) =>
      prev.map((inst, idx) => ({
        ...inst,
        basicAmount: amounts[idx],
        discountAmount: 0,
        netAmount: amounts[idx],
        outstandingAmount: round2(amounts[idx] - inst.paidAmount),
        outstandingWithoutTax: round2(amounts[idx] - inst.paidAmount),
      })),
    );
  };

  const handleSave = async () => {
    if (!schedule) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      for (const inst of editingInstallments) {
        const original = schedule.installments.find((i) => i.id === inst.id);
        if (!original) continue;
        const hasChanges =
          original.dueDate !== inst.dueDate ||
          original.basicAmount !== inst.basicAmount ||
          original.discountAmount !== inst.discountAmount ||
          original.remarks !== inst.remarks;
        if (hasChanges) {
          await updateInstallmentMock(schedule.id, inst.id, {
            dueDate: inst.dueDate,
            basicAmount: inst.basicAmount,
            discountAmount: inst.discountAmount,
            remarks: inst.remarks,
            netAmount: inst.netAmount,
            outstandingAmount: inst.outstandingAmount,
            outstandingWithoutTax: inst.outstandingWithoutTax,
          });
        }
      }
      setSuccess("All installment changes saved successfully.");
      await fetchSchedule();
    } catch {
      setError("Failed to save installment changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPay = async () => {
    await handleSave();
    if (schedule) {
      const firstOutstanding = editingInstallments.find(
        (i) => i.outstandingAmount > 0 && i.status !== "Cancelled" && i.status !== "Paid",
      );
      onRecordPayment(schedule.id, firstOutstanding?.id);
    }
  };

  if (loading) {
    return <div className="pm-page"><div className="pm-loading">Loading installments...</div></div>;
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

  const isLocked = schedule.status === "Completed" || schedule.status === "Cancelled";

  return (
    <div className="pm-page">
      <div className="pm-page__header">
        <button type="button" className="pm-btn pm-btn--ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="pm-page__title">Edit Installments</h1>
      </div>

      {error && <div className="pm-error-banner">{error}</div>}
      {success && <div className="pm-success-banner">{success}</div>}

      <StudentDetailsBanner schedule={schedule} />

      <div className="pm-card pm-edit-installments">
        <div className="pm-edit-installments__toolbar">
          <h3 className="pm-section__title">Installment Schedule</h3>
          <div className="pm-edit-installments__actions">
            <button
              type="button"
              className="pm-btn pm-btn--ghost"
              onClick={handleReset}
              disabled={isLocked}
              title="Reset all installments to equal distribution"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Installments
            </button>
          </div>
        </div>

        {isLocked && (
          <div className="pm-dialog__notice pm-dialog__notice--warning">
            This schedule is {schedule.status}. Installment editing is locked.
          </div>
        )}

        <div className="pm-edit-installments__table">
          <table className="pm-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th style={{ width: "120px" }}>Name</th>
                <th style={{ width: "150px" }}>Due Date</th>
                <th style={{ width: "140px" }}>Basic Amount</th>
                <th style={{ width: "120px" }}>Discount</th>
                <th style={{ width: "120px" }}>Tax</th>
                <th style={{ width: "120px" }}>Net Amount</th>
                <th style={{ width: "100px" }}>Paid</th>
                <th style={{ width: "120px" }}>Outstanding</th>
                <th style={{ width: "80px" }}>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {editingInstallments.map((inst) => {
                const isPaid = inst.status === "Paid" || inst.status === "Cancelled";
                return (
                  <tr key={inst.id} className={isPaid ? "pm-row--locked" : ""}>
                    <td className="pm-text-center">{inst.installmentNo}</td>
                    <td>{inst.installmentName || `Installment ${inst.installmentNo}`}</td>
                    <td>
                      <input
                        type="date"
                        className="pm-input pm-input--sm"
                        value={inst.dueDate ? inst.dueDate.split("/").reverse().join("-") : ""}
                        disabled={isPaid}
                        onChange={(e) => {
                          const date = e.target.value
                            ? new Date(e.target.value).toLocaleDateString("en-GB")
                            : "";
                          handleFieldChange(inst.id, "dueDate", date);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="pm-input pm-input--sm"
                        step="0.01"
                        min="0"
                        value={inst.basicAmount}
                        disabled={isPaid}
                        onChange={(e) =>
                          handleFieldChange(inst.id, "basicAmount", parseFloat(e.target.value) || 0)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="pm-input pm-input--sm"
                        step="0.01"
                        min="0"
                        value={inst.discountAmount}
                        disabled={isPaid}
                        onChange={(e) =>
                          handleFieldChange(inst.id, "discountAmount", parseFloat(e.target.value) || 0)
                        }
                      />
                    </td>
                    <td className="pm-text-right">{formatCurrency(inst.taxAmount)}</td>
                    <td className="pm-text-right pm-text-semibold">{formatCurrency(inst.netAmount)}</td>
                    <td className="pm-text-right pm-text-success">{formatCurrency(inst.paidAmount)}</td>
                    <td className="pm-text-right pm-text-danger">{formatCurrency(inst.outstandingAmount)}</td>
                    <td>
                      <span className="pm-badge" style={{
                        backgroundColor: inst.status === "Paid" ? "#16a34a15" : inst.status === "PartiallyPaid" ? "#f59e0b15" : "#6b728015",
                        color: inst.status === "Paid" ? "#16a34a" : inst.status === "PartiallyPaid" ? "#f59e0b" : "#6b7280",
                      }}>
                        {inst.status}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="pm-input pm-input--sm"
                        value={inst.remarks}
                        disabled={isPaid}
                        onChange={(e) => handleFieldChange(inst.id, "remarks", e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pm-edit-installments__footer">
          <button type="button" className="pm-btn pm-btn--secondary" onClick={onBack}>
            Cancel
          </button>
          <button
            type="button"
            className="pm-btn pm-btn--primary"
            onClick={handleSave}
            disabled={saving || isLocked}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="pm-btn pm-btn--primary"
            onClick={handleSaveAndPay}
            disabled={saving || isLocked}
          >
            <CreditCard className="w-4 h-4" />
            Save & Pay
          </button>
        </div>
      </div>

      <div className="pm-mock-notice">
        Note: Installment edits are temporary mock data. They do not persist across page reloads.
      </div>
    </div>
  );
};
