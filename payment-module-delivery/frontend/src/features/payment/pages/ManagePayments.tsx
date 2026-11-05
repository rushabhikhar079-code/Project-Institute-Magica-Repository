// ─── Manage Payments Page ──────────────────────────────────────────────────────
// Main dashboard showing summary cards and schedule list with search/filter.
import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaymentSchedule, PaymentSearchRequest } from "../paymentTypes";
import { getSchedulesMock, cancelScheduleMock } from "../paymentService";
import { PaymentSummaryCards } from "../components/PaymentSummaryCards";
import { PaymentSearchFilters } from "../components/PaymentSearchFilters";
import { getScheduleColumns } from "../paymentColumns";
import { round2 } from "../paymentCalculations";

interface ManagePaymentsProps {
  branchId: number;
  onNavigate: (route: string, params?: Record<string, unknown>) => void;
}

export const ManagePayments: React.FC<ManagePaymentsProps> = ({ branchId, onNavigate }) => {
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchRequest, setSearchRequest] = useState<PaymentSearchRequest>({
    studentName: "",
    regNo: "",
    paymentType: "",
    status: "",
    branchId,
    pageNumber: 1,
    pageSize: 10,
    sortBy: null,
    sortDirection: null,
  });
  const [totalCount, setTotalCount] = useState(0);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSchedulesMock(searchRequest);
      setSchedules(response.items);
      setTotalCount(response.totalCount);
    } catch {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [searchRequest]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleSearch = (request: PaymentSearchRequest) => {
    setSearchRequest(request);
  };

  const handleReset = () => {
    setSearchRequest({
      studentName: "",
      regNo: "",
      paymentType: "",
      status: "",
      branchId,
      pageNumber: 1,
      pageSize: 10,
      sortBy: null,
      sortDirection: null,
    });
  };

  const handleSchedule = (schedule: PaymentSchedule) => {
    onNavigate("payment/create-schedule", { scheduleId: schedule.id, mode: "edit" });
  };

  const handleRecordPayment = (schedule: PaymentSchedule) => {
    onNavigate("payment/record-payment", { scheduleId: schedule.id });
  };

  const handleCancel = async (schedule: PaymentSchedule) => {
    if (!window.confirm(`Cancel payment schedule for ${schedule.studentName}? This is a MOCK action.`)) return;
    await cancelScheduleMock(schedule.id);
    fetchSchedules();
  };

  const totalPayable = round2(schedules.reduce((s, sch) => s + sch.totalPayable, 0));
  const totalPaid = round2(schedules.reduce((s, sch) => s + sch.totalPaid, 0));
  const totalOutstanding = round2(schedules.reduce((s, sch) => s + sch.totalOutstanding, 0));
  const pageCount = Math.max(1, Math.ceil(totalCount / searchRequest.pageSize));

  const handlePageChange = (pageNumber: number) => {
    setSearchRequest((current) => ({ ...current, pageNumber }));
  };

  const columns = getScheduleColumns({
    onCancel: handleCancel,
    onSchedule: handleSchedule,
    onPay: handleRecordPayment,
  });

  return (
    <div className="pm-page">
      <div className="pm-page__header">
        <div>
          <h1 className="pm-page__title">Manage Payments</h1>
          <p className="pm-page__subtitle">Manage student fee schedules and Payments</p>
        </div>
      </div>

      <PaymentSearchFilters onSearch={handleSearch} onReset={handleReset} branchId={branchId} />

      <PaymentSummaryCards
        totalPayable={totalPayable}
        totalPaid={totalPaid}
        totalOutstanding={totalOutstanding}
        activeSchedules={totalCount}
      />

      <div className="pm-card pm-data-table-card">
        {loading ? (
          <div className="pm-loading">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="pm-empty-state">
            <p className="pm-empty-state__text">No payment schedules found.</p>
          </div>
        ) : (
          <table className="pm-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width, textAlign: col.align || "left" }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  {columns.map((col) => (
                    <td key={`${schedule.id}-${col.key}`} style={{ textAlign: col.align || "left" }}>
                      {col.render(schedule)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalCount > 0 && (
          <div className="pm-pagination pm-pagination--manage">
            <span className="pm-pagination__info">Showing 1–{Math.min(searchRequest.pageSize, totalCount)} of {totalCount} sample records</span>
            <div className="pm-pagination__controls">
              <button type="button" className="pm-pagination__button" disabled={searchRequest.pageNumber === 1} onClick={() => handlePageChange(1)}>First</button>
              <button type="button" className="pm-pagination__button" disabled={searchRequest.pageNumber === 1} onClick={() => handlePageChange(searchRequest.pageNumber - 1)}><ChevronLeft className="w-4 h-4" />Previous</button>
              <span className="pm-pagination__current">{searchRequest.pageNumber}</span>
              <button type="button" className="pm-pagination__button" disabled={searchRequest.pageNumber >= pageCount} onClick={() => handlePageChange(searchRequest.pageNumber + 1)}>Next<ChevronRight className="w-4 h-4" /></button>
              <button type="button" className="pm-pagination__button" disabled={searchRequest.pageNumber >= pageCount} onClick={() => handlePageChange(pageCount)}>Last</button>
              <span className="pm-pagination__size">Page Size <select className="pm-select pm-select--pagination" value={searchRequest.pageSize} onChange={(event) => setSearchRequest((current) => ({ ...current, pageSize: Number(event.target.value), pageNumber: 1 }))}><option value={10}>10</option><option value={25}>25</option></select></span>
            </div>
          </div>
        )}
      </div>

      {/* Mock data notice */}
      <div className="pm-mock-notice">
        Note: Payment data shown is temporary mock data. It does not persist across page reloads.
        Backend CRUD APIs are required for permanent storage.
      </div>

    </div>
  );
};
