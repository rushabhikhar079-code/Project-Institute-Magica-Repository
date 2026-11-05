import React, { useState } from "react";
import { Bell, CalendarDays, CreditCard, CircleDollarSign, History } from "lucide-react";
import { getMockSchedules } from "../../frontend/src/features/payment/paymentMockData";
import { ManagePayments } from "../../frontend/src/features/payment/pages/ManagePayments";
import { ScheduleOverview } from "../../frontend/src/features/payment/pages/ScheduleOverview";
import { CreateSchedule } from "../../frontend/src/features/payment/pages/CreateSchedule";
import { PaymentRecording } from "../../frontend/src/features/payment/pages/PaymentRecording";
import { PaymentHistory } from "../../frontend/src/features/payment/pages/PaymentHistory";
import { EditInstallments } from "../../frontend/src/features/payment/pages/EditInstallments";
import { SubjectSelectionAlert } from "../../frontend/src/features/payment/components/SubjectSelectionAlert";

type PreviewPage =
  | "manage"
  | "schedule-overview"
  | "create-schedule"
  | "record-payment"
  | "history"
  | "edit-installments";

interface PreviewState {
  page: PreviewPage;
  scheduleId?: string;
  installmentId?: string;
}

const BRANCH_ID = 1;
const sampleScheduleId = getMockSchedules()[0]?.id ?? "sch-001";

export const PreviewApp: React.FC = () => {
  const [state, setState] = useState<PreviewState>({ page: "manage" });
  const [showAlert, setShowAlert] = useState(false);

  const navigate = (route: string, params?: Record<string, unknown>) => {
    if (route.includes("create-schedule")) {
      setState({ page: "create-schedule" });
    } else if (route.includes("edit-installments")) {
      setState({ page: "edit-installments", scheduleId: (params?.scheduleId as string) || sampleScheduleId });
    } else if (route.includes("record-payment")) {
      setState({
        page: "record-payment",
        scheduleId: (params?.scheduleId as string) || sampleScheduleId,
        installmentId: params?.installmentId as string | undefined,
      });
    } else if (route.includes("schedules")) {
      setState({ page: "schedule-overview", scheduleId: (params?.scheduleId as string) || sampleScheduleId });
    } else if (route.includes("history")) {
      setState({ page: "history" });
    } else {
      setState({ page: "manage" });
    }
  };

  const renderPage = () => {
    switch (state.page) {
      case "manage":
        return <ManagePayments branchId={BRANCH_ID} onNavigate={navigate} />;
      case "create-schedule":
        return (
          <CreateSchedule
            branchId={BRANCH_ID}
            onBack={() => setState({ page: "manage" })}
            onSaveAndPay={(id) => setState({ page: "record-payment", scheduleId: id })}
          />
        );
      case "schedule-overview":
        return (
          <ScheduleOverview
            scheduleId={state.scheduleId || sampleScheduleId}
            onBack={() => setState({ page: "manage" })}
            onRecordPayment={(scheduleId, installmentId) =>
              setState({ page: "record-payment", scheduleId, installmentId })
            }
          />
        );
      case "edit-installments":
        return (
          <EditInstallments
            scheduleId={state.scheduleId || sampleScheduleId}
            onBack={() => setState({ page: "schedule-overview", scheduleId: state.scheduleId || sampleScheduleId })}
            onRecordPayment={(scheduleId, installmentId) =>
              setState({ page: "record-payment", scheduleId, installmentId })
            }
          />
        );
      case "record-payment":
        return (
          <PaymentRecording
            scheduleId={state.scheduleId || sampleScheduleId}
            installmentId={state.installmentId}
            onBack={() => setState({ page: "schedule-overview", scheduleId: state.scheduleId || sampleScheduleId })}
            onRecorded={(scheduleId) => setState({ page: "schedule-overview", scheduleId })}
            onEditInstallments={(scheduleId) => setState({ page: "edit-installments", scheduleId })}
          />
        );
      case "history":
        return <PaymentHistory branchId={BRANCH_ID} onBack={() => setState({ page: "manage" })} />;
      default:
        return <ManagePayments branchId={BRANCH_ID} onNavigate={navigate} />;
    }
  };

  const navigationItems: { page: PreviewPage; label: string; icon: React.ReactNode }[] = [
    { page: "manage", label: "Manage Payment", icon: <CircleDollarSign /> },
    { page: "create-schedule", label: "Schedule Payment", icon: <CalendarDays /> },
    { page: "record-payment", label: "Payment", icon: <CreditCard /> },
    { page: "history", label: "History", icon: <History /> },
  ];

  const activePage = state.page === "schedule-overview" || state.page === "edit-installments"
    ? "create-schedule"
    : state.page;

  const pageTitle = state.page === "history" ? "Payment History" : "Manage Payment";
  const breadcrumb = state.page === "manage"
    ? ["Fee & Payments", "Active Payments"]
    : state.page === "history"
      ? ["Manage Payment", "Payment History"]
      : ["Manage Payment", "Schedule Payment"];

  return (
    <div className="preview-shell">
      <aside className="preview-sidebar">
        <a className="preview-sidebar__menu" href="#main-content">MENU</a>
        <nav className="preview-sidebar__nav" aria-label="Payment navigation">
          <button
            type="button"
            className={`preview-sidebar__parent ${activePage === "manage" ? "preview-sidebar__parent--active" : ""}`}
            onClick={() => setState({ page: "manage" })}
          >
            <CircleDollarSign />
            <span>Manage Payment</span>
            <span className="preview-sidebar__chevron">⌄</span>
          </button>
          <div className="preview-sidebar__children">
            {navigationItems.slice(1).map((item) => (
              <button
                key={item.page}
                type="button"
                className={`preview-sidebar__child ${activePage === item.page ? "preview-sidebar__child--active" : ""}`}
                onClick={() => setState({ page: item.page, scheduleId: sampleScheduleId })}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </aside>

      <main className="preview-main" id="main-content">
        <header className="preview-topbar">
          <span className="preview-topbar__title">{pageTitle}</span>
          <Bell className="preview-topbar__bell" />
        </header>
        <div className="preview-breadcrumb">
          <span>{breadcrumb[0]}</span>
          <span>/</span>
          <strong>{breadcrumb[1]}</strong>
        </div>
        {showAlert && state.page === "manage" && (
          <div className="preview-alert-wrap">
            <SubjectSelectionAlert
              visible={showAlert}
              message="Please select at least one subject or course to configure the payment schedule."
              onDismiss={() => setShowAlert(false)}
            />
          </div>
        )}
        <div className="preview-content">{renderPage()}</div>
      </main>
    </div>
  );
};
