import React, { useState, useEffect, useCallback } from "react";
import { Download, Edit, RefreshCw, Search, Trash2 } from "lucide-react";
import type { PaymentSchedule, PaymentReceipt } from "../paymentTypes";
import { getSchedulesMock, getReceiptsByScheduleMock, updateReceiptMock } from "../paymentService";
import { formatCurrency, round2 } from "../paymentCalculations";
import { ModifyReceiptDialog } from "../dialogs/ModifyReceiptDialog";

interface PaymentHistoryProps {
  branchId: number;
  onBack: () => void;
}

interface ReceiptRow {
  receipt: PaymentReceipt;
  schedule: PaymentSchedule;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ branchId }) => {
  const [allReceipts, setAllReceipts] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifyReceipt, setModifyReceipt] = useState<PaymentReceipt | null>(null);
  const [filterStudentName, setFilterStudentName] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterMethod, setFilterMethod] = useState("");

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
      const rows: ReceiptRow[] = [];
      for (const schedule of response.items) {
        const receipts = await getReceiptsByScheduleMock(schedule.id);
        receipts.forEach((receipt) => rows.push({ receipt, schedule }));
      }
      setAllReceipts(rows);
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

  const handleReset = () => {
    setFilterStudentName("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterMethod("");
  };

  const parseDate = (dateString: string): string => {
    const parts = dateString.split("/");
    return parts.length === 3 ? `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}` : dateString;
  };

  const filteredReceipts = allReceipts.filter(({ receipt, schedule }) => {
    if (filterMethod && receipt.paymentMethod !== filterMethod) return false;
    if (filterStudentName && !schedule.studentName.toLowerCase().includes(filterStudentName.toLowerCase())) return false;
    const paymentDate = parseDate(receipt.payDate);
    if (filterDateFrom && paymentDate < filterDateFrom) return false;
    if (filterDateTo && paymentDate > filterDateTo) return false;
    return true;
  });

  const totalCollected = round2(filteredReceipts.reduce((total, row) => total + row.receipt.amount, 0));

  const handleDelete = (receiptId: string) => {
    if (!window.confirm("Delete this mock receipt?")) return;
    setAllReceipts((rows) => rows.filter(({ receipt }) => receipt.id !== receiptId));
  };

  if (loading) {
    return <div className="pm-page"><div className="pm-loading">Loading payment history...</div></div>;
  }

  return (
    <div className="pm-page pm-history-page">
      <div className="pm-page__header">
        <div>
          <h1 className="pm-page__title">Payment History</h1>
          <p className="pm-page__subtitle">Showing transactions for {filterStudentName || "all students"}</p>
        </div>
      </div>

      <section className="pm-card pm-history-filter">
        <div className="pm-history-filter__title">FIND STUDENTS</div>
        <div className="pm-history-filter__grid">
          <div className="pm-form-group">
            <label className="pm-label">Student name</label>
            <div className="pm-input-with-icon"><input className="pm-input" placeholder="e.g .Rushabh" value={filterStudentName} onChange={(event) => setFilterStudentName(event.target.value)} /><Search /></div>
          </div>
          <div className="pm-form-group">
            <label className="pm-label">From</label>
            <input type="date" className="pm-input" value={filterDateFrom} onChange={(event) => setFilterDateFrom(event.target.value)} />
          </div>
          <div className="pm-form-group">
            <label className="pm-label">To</label>
            <input type="date" className="pm-input" value={filterDateTo} onChange={(event) => setFilterDateTo(event.target.value)} />
          </div>
          <div className="pm-form-group">
            <label className="pm-label">Payment Mode</label>
            <select className="pm-select" value={filterMethod} onChange={(event) => setFilterMethod(event.target.value)}>
              <option value="">All</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="BankTransfer">Bank Transfer</option>
              <option value="Online">Online</option>
            </select>
          </div>
          <div className="pm-history-filter__actions">
            <button type="button" className="pm-btn pm-btn--secondary" onClick={handleReset}><RefreshCw className="w-4 h-4" />Reset</button>
            <button type="button" className="pm-btn pm-btn--primary" onClick={() => fetchAllReceipts()}><Search className="w-4 h-4" />Search</button>
          </div>
        </div>
      </section>

      <section className="pm-card pm-history-table-card">
        <div className="pm-history-table__summary">{filteredReceipts.length} Transaction(s) · Total <strong>{formatCurrency(totalCollected)}</strong></div>
        <div className="pm-history-table__scroll">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Receipt/Reference</th>
                <th>Student Name</th>
                <th>Payment Date</th>
                <th>Payment Mode</th>
                <th>Amount</th>
                <th>Installment Name</th>
                <th>Installment</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map(({ receipt, schedule }) => {
                const installment = schedule.installments.find((item) => item.id === receipt.installmentId);
                return (
                  <tr key={receipt.id}>
                    <td className="pm-text-semibold">{receipt.manualReceiptNo || receipt.receiptNo}</td>
                    <td className="pm-text-semibold">{receipt.studentName || schedule.studentName}</td>
                    <td>{receipt.payDate}</td>
                    <td>{receipt.paymentMethod}</td>
                    <td className="pm-text-semibold">{formatCurrency(receipt.amount)}</td>
                    <td>{receipt.installmentName || "-"}</td>
                    <td>{installment ? `No ${installment.installmentNo}` : "-"}</td>
                    <td>{receipt.remarks || "-"}</td>
                    <td>
                      <div className="pm-history-actions">
                        <button type="button" className="pm-icon-btn" title="Modify Receipt" onClick={() => setModifyReceipt(receipt)}><Edit className="w-4 h-4" /></button>
                        <button type="button" className="pm-icon-btn" title="Print Receipt" onClick={() => window.print()}><Download className="w-4 h-4" /></button>
                        <button type="button" className="pm-icon-btn pm-icon-btn--danger" title="Delete Receipt" onClick={() => handleDelete(receipt.id)}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="pm-history-table__footer"><span>Showing 1–{filteredReceipts.length} of {filteredReceipts.length}</span><div className="pm-pagination__controls"><span className="pm-pagination__current">1</span><button type="button" className="pm-pagination__button" disabled>Next</button><button type="button" className="pm-pagination__button" disabled>Last</button><span className="pm-pagination__size">Page Size <select className="pm-select pm-select--pagination" defaultValue="10"><option value="10">10</option></select></span></div></div>
      </section>

      <div className="pm-mock-notice">Note: Receipt data is temporary mock data. It does not persist across page reloads.</div>

      <ModifyReceiptDialog open={!!modifyReceipt} receipt={modifyReceipt} onClose={() => setModifyReceipt(null)} onSave={handleModifyReceiptSave} />
    </div>
  );
};
