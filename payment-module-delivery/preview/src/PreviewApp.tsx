import React, { useState } from "react";
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarClock,
  CreditCard,
  History,
  Receipt,
  Bell,
} from "lucide-react";
import type { PaymentSchedule, PaymentReceipt } from "../../frontend/src/features/payment/paymentTypes";
import { getScheduleByIdMock } from "../../frontend/src/features/payment/paymentService";
import { getMockSchedules } from "../../frontend/src/features/payment/paymentMockData";

import { ManagePayments } from "../../frontend/src/features/payment/pages/ManagePayments";
import { ScheduleOverview } from "../../frontend/src/features/payment/pages/ScheduleOverview";
import { CreateSchedule } from "../../frontend/src/features/payment/pages/CreateSchedule";
import { PaymentRecording } from "../../frontend/src/features/payment/pages/PaymentRecording";
import { PaymentHistory } from "../../frontend/src/features/payment/pages/PaymentHistory";
import { EditInstallments } from "../../frontend/src/features/payment/pages/EditInstallments";

import { EditScheduleDialog } from "../../frontend/src/features/payment/dialogs/EditScheduleDialog";
import { SendPaymentLinkDialog } from "../../frontend/src/features/payment/dialogs/SendPaymentLinkDialog";
import { ModifyReceiptDialog } from "../../frontend/src/features/payment/dialogs/ModifyReceiptDialog";
import { EditInstallmentDialog } from "../../frontend/src/features/payment/dialogs/EditInstallmentDialog";
import { SubjectSelectionDialog } from "../../frontend/src/features/payment/dialogs/SubjectSelectionDialog";
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

export const PreviewApp: React.FC = () => {
  const [state, setState] = useState<PreviewState>({ page: "manage" });

  // Dialog showcase state
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [showSendLink, setShowSendLink] = useState(false);
  const [showModifyReceipt, setShowModifyReceipt] = useState(false);
  const [showEditInstallment, setShowEditInstallment] = useState(false);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  // Get a sample schedule for dialogs
  const sampleSchedule: PaymentSchedule | null = getMockSchedules()[0] ?? null;

  const sampleReceipt: PaymentReceipt | null = sampleSchedule
    ? {
        id: "rcp-preview-1",
        receiptNo: "RCP001",
        manualReceiptNo: "M001",
        installmentId: "inst-001",
        installmentName: "Installment 1",
        studentName: sampleSchedule.studentName,
        paymentMethod: "Cash",
        amount: 7313.33,
        payDate: "14/01/2024",
        receiptDate: "14/01/2024",
        chequeNo: "",
        chequeDate: "",
        bank: "",
        branchAddr: "",
        remarks: "Cash payment",
        collectedBy: "Admin",
      }
    : null;

  const sampleInstallment = sampleSchedule?.installments[0] ?? null;

  const navigate = (route: string, params?: Record<string, unknown>) => {
    if (route.includes("create-schedule")) {
      setState({ page: "create-schedule" });
    } else if (route.includes("edit-installments")) {
      setState({ page: "edit-installments", scheduleId: params?.scheduleId as string });
    } else if (route.includes("record-payment")) {
      setState({
        page: "record-payment",
        scheduleId: params?.scheduleId as string,
        installmentId: params?.installmentId as string,
      });
    } else if (route.includes("schedules")) {
      setState({ page: "schedule-overview", scheduleId: params?.scheduleId as string });
    } else if (route.includes("history")) {
      setState({ page: "history" });
    } else {
      setState({ page: "manage" });
    }
  };

  const navItems: { id: PreviewPage; label: string; icon: React.ReactNode }[] = [
    { id: "manage", label: "Manage Payments", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "create-schedule", label: "Create Schedule", icon: <CalendarPlus className="w-4 h-4" /> },
    { id: "schedule-overview", label: "Schedule Overview", icon: <CalendarClock className="w-4 h-4" /> },
    { id: "edit-installments", label: "Edit Installments", icon: <Receipt className="w-4 h-4" /> },
    { id: "record-payment", label: "Payment Recording", icon: <CreditCard className="w-4 h-4" /> },
    { id: "history", label: "Payment History", icon: <History className="w-4 h-4" /> },
  ];

  const pageTitles: Record<PreviewPage, string> = {
    manage: "Manage Payments",
    "create-schedule": "Create Payment Schedule",
    "schedule-overview": "Schedule Overview",
    "edit-installments": "Edit Installments",
    "record-payment": "Record Payment",
    history: "Payment History",
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
            onCreated={(id) => setState({ page: "schedule-overview", scheduleId: id })}
          />
        );
      case "schedule-overview":
        return state.scheduleId ? (
          <ScheduleOverview
            scheduleId={state.scheduleId}
            onBack={() => setState({ page: "manage" })}
            onRecordPayment={(schId, instId) =>
              setState({ page: "record-payment", scheduleId: schId, installmentId: instId })
            }
          />
        ) : (
          <div className="pm-page">
            <div className="pm-empty-state">
              <p className="pm-empty-state__text">No schedule selected. Go back to Manage Payments.</p>
              <button className="pm-btn pm-btn--primary" onClick={() => setState({ page: "manage" })}>
                Back
              </button>
            </div>
          </div>
        );
      case "edit-installments":
        return state.scheduleId ? (
          <EditInstallments
            scheduleId={state.scheduleId}
            onBack={() => setState({ page: "schedule-overview", scheduleId: state.scheduleId })}
            onRecordPayment={(schId, instId) =>
              setState({ page: "record-payment", scheduleId: schId, installmentId: instId })
            }
          />
        ) : (
          <div className="pm-page">
            <div className="pm-empty-state">
              <p className="pm-empty-state__text">No schedule selected.</p>
            </div>
          </div>
        );
      case "record-payment":
        return state.scheduleId ? (
          <PaymentRecording
            scheduleId={state.scheduleId}
            installmentId={state.installmentId}
            onBack={() => setState({ page: "schedule-overview", scheduleId: state.scheduleId })}
            onRecorded={(schId) => setState({ page: "schedule-overview", scheduleId: schId })}
            onEditInstallments={(schId) => setState({ page: "edit-installments", scheduleId: schId })}
          />
        ) : (
          <div className="pm-page">
            <div className="pm-empty-state">
              <p className="pm-empty-state__text">No schedule selected.</p>
            </div>
          </div>
        );
      case "history":
        return <PaymentHistory branchId={BRANCH_ID} onBack={() => setState({ page: "manage" })} />;
      default:
        return <ManagePayments branchId={BRANCH_ID} onNavigate={navigate} />;
    }
  };

  return (
    <div className="preview-shell">
      {/* Sidebar */}
      <aside className="preview-sidebar">
        <div className="preview-sidebar__brand">
          <div className="preview-sidebar__logo">IM</div>
          <div className="preview-sidebar__brand-text">
            <span className="preview-sidebar__brand-name">Institute Magica</span>
            <span className="preview-sidebar__brand-sub">Payment Module</span>
          </div>
        </div>
        <nav className="preview-sidebar__nav">
          <div className="preview-sidebar__section-label">Payment Screens</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`preview-sidebar__link ${state.page === item.id ? "preview-sidebar__link--active" : ""}`}
              onClick={() => {
                if (item.id === "schedule-overview" || item.id === "edit-installments" || item.id === "record-payment") {
                  // These need a scheduleId — use first available
                  const schedules = sampleSchedule ? [sampleSchedule] : [];
                  setState({
                    page: item.id,
                    scheduleId: schedules[0]?.id ?? "sch-001",
                  });
                } else {
                  setState({ page: item.id });
                }
              }}
            >
              <span className="preview-sidebar__link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="preview-sidebar__section-label">XD Dialogs</div>
          <button className="preview-sidebar__link" onClick={() => setShowEditSchedule(true)}>
            <span className="preview-sidebar__link-icon"><Receipt className="w-4 h-4" /></span>
            <span>Edit Schedule Dialog</span>
          </button>
          <button className="preview-sidebar__link" onClick={() => setShowSendLink(true)}>
            <span className="preview-sidebar__link-icon"><Bell className="w-4 h-4" /></span>
            <span>Send Payment Link</span>
          </button>
          <button className="preview-sidebar__link" onClick={() => setShowModifyReceipt(true)}>
            <span className="preview-sidebar__link-icon"><Receipt className="w-4 h-4" /></span>
            <span>Modify Receipt</span>
          </button>
          <button className="preview-sidebar__link" onClick={() => setShowEditInstallment(true)}>
            <span className="preview-sidebar__link-icon"><Receipt className="w-4 h-4" /></span>
            <span>Edit Installment</span>
          </button>
          <button className="preview-sidebar__link" onClick={() => setShowStudentDialog(true)}>
            <span className="preview-sidebar__link-icon"><LayoutDashboard className="w-4 h-4" /></span>
            <span>Student Search</span>
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="preview-main">
        {/* Top bar */}
        <div className="preview-topbar">
          <span className="preview-topbar__title">{pageTitles[state.page]}</span>
          <div className="preview-topbar__badge">VISUAL PREVIEW — NOT PRODUCTION</div>
          <div className="preview-topbar__user">
            <span>Preview User</span>
            <div className="preview-topbar__avatar">PU</div>
          </div>
        </div>

        {/* Preview banner */}
        <div className="preview-banner">
          This is a standalone visual preview of the Payment Module source code. Data is in-memory mock and does not persist.
          This is not the production application.
        </div>

        {/* Subject Selection Alert (XD Screen 8) — shown at top of manage page */}
        {showAlert && state.page === "manage" && (
          <div style={{ padding: "16px 24px 0" }}>
            <SubjectSelectionAlert
              visible={showAlert}
              message="Please select at least one subject or course to configure the payment schedule."
              onDismiss={() => setShowAlert(false)}
            />
          </div>
        )}

        {/* Page content */}
        <div className="preview-content">{renderPage()}</div>
      </div>

      {/* ─── Dialogs (always mounted for showcase) ─────────────────────────── */}
      <EditScheduleDialog
        open={showEditSchedule}
        schedule={sampleSchedule}
        onClose={() => setShowEditSchedule(false)}
        onSave={() => setShowEditSchedule(false)}
      />
      <SendPaymentLinkDialog
        open={showSendLink}
        schedule={sampleSchedule}
        onClose={() => setShowSendLink(false)}
      />
      <ModifyReceiptDialog
        open={showModifyReceipt}
        receipt={sampleReceipt}
        onClose={() => setShowModifyReceipt(false)}
        onSave={() => setShowModifyReceipt(false)}
      />
      <EditInstallmentDialog
        open={showEditInstallment}
        installment={sampleInstallment}
        onClose={() => setShowEditInstallment(false)}
        onSave={() => setShowEditInstallment(false)}
      />
      <SubjectSelectionDialog
        open={showStudentDialog}
        branchId={BRANCH_ID}
        onClose={() => setShowStudentDialog(false)}
        onSelect={() => setShowStudentDialog(false)}
      />
    </div>
  );
};
