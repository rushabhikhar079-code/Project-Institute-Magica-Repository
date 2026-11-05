# XD Screen-to-Source Mapping

This document maps each of the 12 Adobe XD screens/states to the exact source files that implement them.

---

## Screen 1 — Manage Payments (Schedule List)

| XD Element | Source File |
|---|---|
| Summary cards (Total Payable, Paid, Outstanding, Active) | `frontend/src/features/payment/components/PaymentSummaryCards.tsx` |
| Search filters (student, reg no, type, status) | `frontend/src/features/payment/components/PaymentSearchFilters.tsx` |
| Schedule table: Student, Reg No, Contact, Curriculum, Course, Subject, Payment Type, Payable, Paid, Outstanding, Status | `frontend/src/features/payment/paymentColumns.tsx` → `getScheduleColumns()` |
| Actions: View, Edit, Schedule (edit installments), Pay, Record Payment, Send Link, Cancel | `frontend/src/features/payment/paymentColumns.tsx` → `getScheduleColumns()` actions |
| Page container with Create Schedule button | `frontend/src/features/payment/pages/ManagePayments.tsx` |
| Mock data notice | `frontend/src/features/payment/pages/ManagePayments.tsx` |
| Send Payment Link dialog (triggered from table) | `frontend/src/features/payment/dialogs/SendPaymentLinkDialog.tsx` |

## Screen 2 — Edit Installments (Full Table Editing)

| XD Element | Source File |
|---|---|
| Student payment summary header | `frontend/src/features/payment/components/StudentPaymentSummary.tsx` |
| Installment table with inline editing (#, Name, Due Date, Basic Amount, Discount, Tax, Net, Paid, Outstanding, Status, Remarks) | `frontend/src/features/payment/pages/EditInstallments.tsx` |
| Reset Installments button (equal redistribution) | `frontend/src/features/payment/pages/EditInstallments.tsx` |
| Save Changes button | `frontend/src/features/payment/pages/EditInstallments.tsx` |
| Save & Pay button (navigates to Payment Recording) | `frontend/src/features/payment/pages/EditInstallments.tsx` |
| Locked rows for paid/cancelled installments | `frontend/src/features/payment/pages/EditInstallments.tsx` (`.pm-row--locked`) |

## Screen 3 — Schedule Overview (Detail View)

| XD Element | Source File |
|---|---|
| Student info: name, reg no, contact, curriculum, course, subject | `frontend/src/features/payment/components/StudentPaymentSummary.tsx` |
| Fee line table with totals | `frontend/src/features/payment/components/StudentPaymentSummary.tsx` |
| Total Payable, Paid, Outstanding, Outstanding (excl. Tax) boxes | `frontend/src/features/payment/components/StudentPaymentSummary.tsx` |
| Installment schedule table | `frontend/src/features/payment/components/ScheduleTable.tsx` |
| Payment receipts table | `frontend/src/features/payment/pages/ScheduleOverview.tsx` (uses `getReceiptColumns()`) |
| Edit Schedule button → dialog | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` |
| Send Payment Link button → dialog | `frontend/src/features/payment/dialogs/SendPaymentLinkDialog.tsx` |
| Edit Installment button → dialog | `frontend/src/features/payment/dialogs/EditInstallmentDialog.tsx` |
| Modify Receipt button → dialog | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` |

## Screen 4 — Create Schedule (Single-Page Form)

| XD Element | Source File |
|---|---|
| Two-column layout (form left, summary right) | `frontend/src/features/payment/pages/CreateSchedule.tsx` (`.pm-create-layout`) |
| Student Details section + subject selection dialog | `frontend/src/features/payment/dialogs/SubjectSelectionDialog.tsx` |
| Payment Type selection (Lump Sum, Adhoc, Installment) | `frontend/src/features/payment/pages/CreateSchedule.tsx` |
| Course/Subject Fees selection | `frontend/src/features/payment/components/SubjectSelection.tsx` |
| Other Fees selection | `frontend/src/features/payment/components/ApplicableOtherFees.tsx` |
| Discount input (Global Discount + Total After Discount) | `frontend/src/features/payment/pages/CreateSchedule.tsx` |
| Installment Configuration | `frontend/src/features/payment/components/InstallmentConfiguration.tsx` |
| Payment Summary Panel (right sidebar) | `frontend/src/features/payment/components/PaymentSummaryPanel.tsx` |
| Save / Cancel actions | `frontend/src/features/payment/pages/CreateSchedule.tsx` |

## Screen 5 — Payment History

| XD Element | Source File |
|---|---|
| Summary cards (Total Collections, Total Receipts) | `frontend/src/features/payment/pages/PaymentHistory.tsx` |
| Filter row 1: Student Name, Receipt No, Reference No, Payment Method | `frontend/src/features/payment/pages/PaymentHistory.tsx` |
| Filter row 2: Date From, Date To, Reset Filters | `frontend/src/features/payment/pages/PaymentHistory.tsx` |
| Receipt table: Student, Reg No, Receipt No, Installment, Method, Amount, Pay Date, Receipt Date, Bank, Remarks, Collected By | `frontend/src/features/payment/pages/PaymentHistory.tsx` |
| Modify Receipt action → dialog | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` |

## Screen 6 — Payment Recording

| XD Element | Source File |
|---|---|
| Student payment summary | `frontend/src/features/payment/components/StudentPaymentSummary.tsx` |
| Edit All Installments button (navigates to Edit Installments page) | `frontend/src/features/payment/pages/PaymentRecording.tsx` |
| Fee breakdown (Course Fees, Subject Fees, Other Fees) | `frontend/src/features/payment/pages/PaymentRecording.tsx` (`.pm-recording-fees-summary`) |
| Installment selection dropdown | `frontend/src/features/payment/pages/PaymentRecording.tsx` |
| Installment info: Net, Paid, Outstanding, Outstanding (excl. Tax) | `frontend/src/features/payment/pages/PaymentRecording.tsx` |
| Amount Received, Payment Method, Payment Date, Receipt Date | `frontend/src/features/payment/pages/PaymentRecording.tsx` |
| Receipt No, Manual Receipt No | `frontend/src/features/payment/pages/PaymentRecording.tsx` |
| Cheque/Bank conditional fields | `frontend/src/features/payment/pages/PaymentRecording.tsx` |
| Send notification checkbox | `frontend/src/features/payment/pages/PaymentRecording.tsx` |
| Send payment link checkbox | `frontend/src/features/payment/pages/PaymentRecording.tsx` |
| Record Payment button | `frontend/src/features/payment/pages/PaymentRecording.tsx` |
| Adhoc auto-continuation notice | `frontend/src/features/payment/pages/PaymentRecording.tsx` |

## Screen 7 — Schedule Form Variation (Edit Existing)

Uses the Create Schedule page (`frontend/src/features/payment/pages/CreateSchedule.tsx`) with pre-filled data when editing an existing schedule. The page receives `scheduleId` via the `onNavigate` callback with `mode: "edit"`.

## Screen 8 — Subject Selection Validation Alert

| XD Element | Source File |
|---|---|
| XD-style validation alert (warning banner with AlertTriangle icon and dismiss) | `frontend/src/features/payment/components/SubjectSelectionAlert.tsx` |
| Student search modal with validation | `frontend/src/features/payment/dialogs/SubjectSelectionDialog.tsx` |

## Screen 9 — Installment Schedule Configuration

| XD Element | Source File |
|---|---|
| Installment rows with editable amounts and dates | `frontend/src/features/payment/components/InstallmentConfiguration.tsx` |
| Total Payable display | `frontend/src/features/payment/components/InstallmentConfiguration.tsx` |
| Adjustment Amount input | `frontend/src/features/payment/components/InstallmentConfiguration.tsx` |
| Adjustment Options dropdown | `frontend/src/features/payment/components/InstallmentConfiguration.tsx` |
| Save button | `frontend/src/features/payment/components/InstallmentConfiguration.tsx` |
| Save & Pay button | `frontend/src/features/payment/components/InstallmentConfiguration.tsx` |

## Screen 10 — Edit Schedule Dialog

| XD Element | Source File |
|---|---|
| Student / Reg No / Payment Type / Status info grid | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` |
| Current Payable / Outstanding display | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` |
| Change Due Date checkbox + date input | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` |
| Change Discount checkbox + amount input | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` |
| Change Total Payable checkbox + amount input | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` |
| Difference display with color coding (increase/decrease) | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` |
| Settle Difference option dropdown (AdjustmentOption) | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` |
| Remarks textarea | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` |
| Done button with Check icon | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` |

## Screen 11 — Send Payment Link Dialog

| XD Element | Source File |
|---|---|
| Email / WhatsApp channel selection | `frontend/src/features/payment/dialogs/SendPaymentLinkDialog.tsx` |
| Dependency warnings (no payment gateway, WhatsApp TODO) | `frontend/src/features/payment/dialogs/SendPaymentLinkDialog.tsx` |
| Never claims delivery success (honest mock) | `frontend/src/features/payment/paymentService.ts` → `sendPaymentLinkMock()` |

## Screen 12 — Modify Receipt Details

| XD Element | Source File |
|---|---|
| Student Name (read-only) | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` |
| Receipt Date (read-only) | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` |
| Installment name (read-only) | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` |
| Collected By (read-only) | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` |
| Receipt No, Manual Receipt No (editable) | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` |
| Cheque/Bank fields (editable when applicable) | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` |
| Remarks (editable) | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` |
| Save Changes button | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` |
