// ─── Payment History Page ──────────────────────────────────────────────────────
// Shows all receipts/collections across all schedules, with filtering.
import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Edit } from "lucide-react";
import type { PaymentSchedule, PaymentReceipt } from "../paymentTypes";
import { getSchedulesMock, getReceiptsByScheduleMock, updateReceiptMock } from "../paymentService";
import { formatCurrency, round2 } from "../paymentCalculations";
import { ModifyReceiptDialog } from "../dialogs/ModifyReceiptDialog";

interface PaymentHistoryProps {
  branchId: number;
  onBack: () => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ branchId, onBack }) => {
  const [allReceipts, setAllReceipts] = useState<{ receipt: PaymentReceipt; schedule: PaymentSchedule }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifyReceipt, setModifyReceipt] = useState<PaymentReceipt | null>(null);
  const [filterMethod, setFilterMethod] = useState<string>("");

  const fetchAllReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSchedulesMock({
        studentName: "",
        regNo: "",
        paymentType: "",
        status: "",
        branchId,
        pageNumber: 1,
        pageSize: 100,
        sortBy: null,
        sortDirection: null,
      });
      const receiptMap: { receipt: PaymentReceipt; schedule: PaymentSchedule }[] = [];
      for (const schedule of response.items) {
        const receipts = await getReceiptsByScheduleMock(schedule.id);
        receipts.forEach((receipt) => {
          receiptMap.push({ receipt, schedule });
        });
      }
      setAllReceipts(receiptMap);
    } catch {
      setAllReceipts([]);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchAllReceipts();
  }, [fetchAllReceipts]);

  const handleModifyReceiptSave = async (updates: Partial<PaymentReceipt>) => {
    if (!modifyReceipt) return;
    await updateReceiptMock(modifyReceipt.id, updates);
    setModifyReceipt(null);
    fetchAllReceipts();
  };

  const filteredReceipts = filterMethod
    ? allReceipts.filter((r) => r.receipt.paymentMethod === filterMethod)
    : allReceipts;

  const totalCollected = round2(filteredReceipts.reduce((s, r) => s + r.receipt.amount, 0));

  if (loading) {
    return <div className="pm-page"><div className="pm-loading">Loading payment history...</div></div>;
  }

  return (
    <div className="pm-page">
      <div className="pm-page__header">
        <button type="button" className="pm-btn pm-btn--ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="pm-page__title">Payment History</h1>
      </div>

      <div className="pm-summary-cards">
        <div className="pm-card pm-summary-card">
          <div className="pm-summary-card__content">
            <span className="pm-summary-card__label">Total Collections</span>
            <span className="pm-summary-card__value pm-text-success">{formatCurrency(totalCollected)}</span>
          </div>
        </div>
        <div className="pm-card pm-summary-card">
          <div className="pm-summary-card__content">
            <span className="pm-summary-card__label">Total Receipts</span>
            <span className="pm-summary-card__value">{filteredReceipts.length}</span>
          </div>
        </div>
      </div>

      <div className="pm-card pm-filter-bar">
        <div className="pm-form-group" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
          <label className="pm-label" style={{ margin: 0 }}>Filter by Method:</label>
          <select
            className="pm-select"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <option value="">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="BankTransfer">Bank Transfer</option>
            <option value="Online">Online</option>
          </select>
        </div>
      </div>

      <div className="pm-card pm-data-table-card">
        {filteredReceipts.length === 0 ? (
          <div className="pm-empty-state">
            <p className="pm-empty-state__text">No payment receipts found.</p>
          </div>
        ) : (
          <table className="pm-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Reg. No.</th>
                <th>Receipt No.</th>
                <th>Method</th>
                <th className="pm-text-right">Amount</th>
                <th>Pay Date</th>
                <th>Bank</th>
                <th>Collected By</th>
                <th style={{ width: "80px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map(({ receipt, schedule }) => (
                <tr key={receipt.id}>
                  <td className="pm-text-semibold">{schedule.studentName}</td>
                  <td>{schedule.studentRegNo}</td>
                  <td>{receipt.manualReceiptNo || receipt.receiptNo}</td>
                  <td>{receipt.paymentMethod}</td>
                  <td className="pm-text-right pm-text-success pm-text-semibold">
                    {formatCurrency(receipt.amount)}
                  </td>
                  <td>{receipt.payDate}</td>
                  <td>{receipt.bank || "-"}</td>
                  <td>{receipt.collectedBy || "-"}</td>
                  <td>
                    <button
                      type="button"
                      className="pm-icon-btn"
                      onClick={() => setModifyReceipt(receipt)}
                      title="Modify Receipt"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pm-mock-notice">
        Note: Receipt data is temporary mock data. It does not persist across page reloads.
      </div>

      <ModifyReceiptDialog
        open={!!modifyReceipt}
        receipt={modifyReceipt}
        onClose={() => setModifyReceipt(null)}
        onSave={handleModifyReceiptSave}
      />
    </div>
  );
};
