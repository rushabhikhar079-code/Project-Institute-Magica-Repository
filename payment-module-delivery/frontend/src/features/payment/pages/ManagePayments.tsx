// ─── Manage Payments Page ──────────────────────────────────────────────────────
// Main dashboard showing summary cards and schedule list with search/filter.
import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import type { PaymentSchedule, PaymentSearchRequest } from "../paymentTypes";
import { getSchedulesMock, cancelScheduleMock } from "../paymentService";
import { PaymentSummaryCards } from "../components/PaymentSummaryCards";
import { PaymentSearchFilters } from "../components/PaymentSearchFilters";
import { getScheduleColumns } from "../paymentColumns";
import { round2 } from "../paymentCalculations";
import { SendPaymentLinkDialog } from "../dialogs/SendPaymentLinkDialog";

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
  const [sendLinkSchedule, setSendLinkSchedule] = useState<PaymentSchedule | null>(null);

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

  const handleView = (schedule: PaymentSchedule) => {
    onNavigate("payment/schedules", { scheduleId: schedule.id });
  };

  const handleEdit = (schedule: PaymentSchedule) => {
    onNavigate("payment/create-schedule", { scheduleId: schedule.id, mode: "edit" });
  };

  const handleRecordPayment = (schedule: PaymentSchedule) => {
    onNavigate("payment/record-payment", { scheduleId: schedule.id });
  };

  const handleSendLink = (schedule: PaymentSchedule) => {
    setSendLinkSchedule(schedule);
  };

  const handleCancel = async (schedule: PaymentSchedule) => {
    if (!window.confirm(`Cancel payment schedule for ${schedule.studentName}? This is a MOCK action.`)) return;
    await cancelScheduleMock(schedule.id);
    fetchSchedules();
  };

  // Summary totals
  const totalPayable = round2(schedules.reduce((s, sch) => s + sch.totalPayable, 0));
  const totalPaid = round2(schedules.reduce((s, sch) => s + sch.totalPaid, 0));
  const totalOutstanding = round2(schedules.reduce((s, sch) => s + sch.totalOutstanding, 0));
  const activeCount = schedules.filter((s) => s.status === "Active").length;

  const columns = getScheduleColumns({
    onView: handleView,
    onEdit: handleEdit,
    onRecordPayment: handleRecordPayment,
    onSendLink: handleSendLink,
    onCancel: handleCancel,
  });

  return (
    <div className="pm-page">
      <div className="pm-page__header">
        <div>
          <h1 className="pm-page__title">Manage Payments</h1>
          <p className="pm-page__subtitle">View and manage all payment schedules</p>
        </div>
        <button
          type="button"
          className="pm-btn pm-btn--primary"
          onClick={() => onNavigate("payment/create-schedule")}
        >
          <Plus className="w-4 h-4" />
          Create Schedule
        </button>
      </div>

      <PaymentSummaryCards
        totalPayable={totalPayable}
        totalPaid={totalPaid}
        totalOutstanding={totalOutstanding}
        activeSchedules={activeCount}
      />

      <PaymentSearchFilters onSearch={handleSearch} onReset={handleReset} branchId={branchId} />

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
          <div className="pm-pagination">
            <span className="pm-pagination__info">{totalCount} schedule(s) found</span>
          </div>
        )}
      </div>

      {/* Mock data notice */}
      <div className="pm-mock-notice">
        Note: Payment data shown is temporary mock data. It does not persist across page reloads.
        Backend CRUD APIs are required for permanent storage.
      </div>

      <SendPaymentLinkDialog
        open={!!sendLinkSchedule}
        schedule={sendLinkSchedule}
        onClose={() => setSendLinkSchedule(null)}
      />
    </div>
  );
};
