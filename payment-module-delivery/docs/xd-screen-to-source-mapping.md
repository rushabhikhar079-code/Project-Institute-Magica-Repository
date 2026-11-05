# XD Screen-to-Source Mapping

This document maps each Adobe XD screen to the source files that implement it.

## Screen 1 — Manage Payments (Schedule List)

| XD Element | Source File |
|---|---|
| Summary cards (Total Payable, Paid, Outstanding, Active) | `components/PaymentSummaryCards.tsx` |
| Search filters (student, reg no, type, status) | `components/PaymentSearchFilters.tsx` |
| Schedule table columns: Student, Reg No, Contact, Curriculum, Course, Subject, Payment Type, Payable, Paid, Outstanding, Status | `paymentColumns.tsx` → `getScheduleColumns()` |
| Actions: View, Edit, Schedule (edit installments), Pay, Record Payment, Send Link, Cancel | `paymentColumns.tsx` → `getScheduleColumns()` actions |
| Page container with Create Schedule button | `pages/ManagePayments.tsx` |
| Mock data notice | `pages/ManagePayments.tsx` |

## Screen 2 — Edit Installments (Full Table Editing)

| XD Element | Source File |
|---|---|
| Student payment summary header | `components/StudentPaymentSummary.tsx` |
| Installment table with inline editing (date, amount, discount, remarks) | `pages/EditInstallments.tsx` |
| Reset Installments button | `pages/EditInstallments.tsx` |
| Save Changes button | `pages/EditInstallments.tsx` |
| Save & Pay button | `pages/EditInstallments.tsx` |
| Locked rows for paid installments | `pages/EditInstallments.tsx` (`.pm-row--locked`) |

## Screen 3 — Schedule Overview (Detail View)

| XD Element | Source File |
|---|---|
| Student info: name, reg no, contact, curriculum, course, subject | `components/StudentPaymentSummary.tsx` |
| Fee line table with totals | `components/StudentPaymentSummary.tsx` |
| Total Payable, Paid, Outstanding, Outstanding (excl. Tax) boxes | `components/StudentPaymentSummary.tsx` |
| Installment schedule table | `components/ScheduleTable.tsx` |
| Payment receipts table | `pages/ScheduleOverview.tsx` (uses `getReceiptColumns()`) |
| Edit Schedule button → dialog | `dialogs/EditScheduleDialog.tsx` |
| Send Payment Link button → dialog | `dialogs/SendPaymentLinkDialog.tsx` |
| Edit Installment button → dialog | `dialogs/EditInstallmentDialog.tsx` |
| Modify Receipt button → dialog | `dialogs/ModifyReceiptDialog.tsx` |

## Screen 4 — Create Schedule (Single-Page Form)

| XD Element | Source File |
|---|---|
| Two-column layout (form left, summary right) | `pages/CreateSchedule.tsx` (`.pm-create-layout`) |
| Student Details section + subject selection dialog | `dialogs/SubjectSelectionDialog.tsx` |
| Payment Type selection (Lump Sum, Adhoc, Installment) | `pages/CreateSchedule.tsx` |
| Course/Subject Fees selection | `components/SubjectSelection.tsx` |
| Other Fees selection | `components/ApplicableOtherFees.tsx` |
| Discount input | `pages/CreateSchedule.tsx` |
| Installment Configuration | `components/InstallmentConfiguration.tsx` |
| Payment Summary Panel | `components/PaymentSummaryPanel.tsx` |
| Save / Cancel actions | `pages/CreateSchedule.tsx` |

## Screen 5 — Payment History

| XD Element | Source File |
|---|---|
| Summary cards (Total Collections, Total Receipts) | `pages/PaymentHistory.tsx` |
| Filters: Student Name, Receipt No, Reference No, Method, Date From, Date To | `pages/PaymentHistory.tsx` |
| Receipt table: Student, Reg No, Receipt No, Installment, Method, Amount, Pay Date, Receipt Date, Bank, Remarks, Collected By | `pages/PaymentHistory.tsx` |
| Modify Receipt action → dialog | `dialogs/ModifyReceiptDialog.tsx` |

## Screen 6 — Payment Recording

| XD Element | Source File |
|---|---|
| Student payment summary | `components/StudentPaymentSummary.tsx` |
| Edit All Installments button | `pages/PaymentRecording.tsx` |
| Fee breakdown (Course Fees, Subject Fees, Other Fees) | `pages/PaymentRecording.tsx` (`.pm-recording-fees-summary`) |
| Installment selection dropdown | `pages/PaymentRecording.tsx` |
| Amount Received, Payment Method, Payment Date, Receipt Date | `pages/PaymentRecording.tsx` |
| Receipt No, Manual Receipt No | `pages/PaymentRecording.tsx` |
| Cheque/Bank conditional fields | `pages/PaymentRecording.tsx` |
| Send notification checkbox | `pages/PaymentRecording.tsx` |
| Send payment link checkbox | `pages/PaymentRecording.tsx` |
| Record Payment button | `pages/PaymentRecording.tsx` |
| Adhoc auto-continuation notice | `pages/PaymentRecording.tsx` |

## Screen 7 — Schedule Form Variation

Uses the existing Create Schedule page (`pages/CreateSchedule.tsx`) with pre-filled data when editing an existing schedule.

## Screen 8 — Subject Selection Validation

| XD Element | Source File |
|---|---|
| XD-style validation alert (warning banner with icon and dismiss) | `components/SubjectSelectionAlert.tsx` |
| Student search modal with validation | `dialogs/SubjectSelectionDialog.tsx` |

## Screen 9 — Installment Schedule Configuration

| XD Element | Source File |
|---|---|
| Distribute Equally button | `components/InstallmentConfiguration.tsx` |
| Reset Installments button | `components/InstallmentConfiguration.tsx` |
| Add Installment button | `components/InstallmentConfiguration.tsx` |
| Total Payable display | `components/InstallmentConfiguration.tsx` |
| Sum / Difference reconciliation indicator | `components/InstallmentConfiguration.tsx` |
| Adjustment Amount input | `components/InstallmentConfiguration.tsx` |
| Adjustment Options dropdown | `components/InstallmentConfiguration.tsx` |
| Apply button | `components/InstallmentConfiguration.tsx` |
| Save button | `components/InstallmentConfiguration.tsx` |
| Save & Pay button | `components/InstallmentConfiguration.tsx` |

## Screen 10 — Edit Schedule Dialog

| XD Element | Source File |
|---|---|
| Student / Reg No / Payment Type / Status info grid | `dialogs/EditScheduleDialog.tsx` |
| Current Payable / Outstanding display | `dialogs/EditScheduleDialog.tsx` |
| Change Due Date checkbox + date input | `dialogs/EditScheduleDialog.tsx` |
| Change Discount checkbox + amount input | `dialogs/EditScheduleDialog.tsx` |
| Change Total Payable checkbox + amount input | `dialogs/EditScheduleDialog.tsx` |
| Difference display with settle options | `dialogs/EditScheduleDialog.tsx` |
| Remarks textarea | `dialogs/EditScheduleDialog.tsx` |
| Done button | `dialogs/EditScheduleDialog.tsx` |

## Screen 11 — Send Payment Link Dialog

| XD Element | Source File |
|---|---|
| Email / WhatsApp channel selection | `dialogs/SendPaymentLinkDialog.tsx` |
| Dependency warnings (no payment gateway, WhatsApp TODO) | `dialogs/SendPaymentLinkDialog.tsx` |
| Never claims delivery success | `paymentService.ts` → `sendPaymentLinkMock()` |

## Screen 12 — Modify Receipt Details

| XD Element | Source File |
|---|---|
| Student Name (read-only display) | `dialogs/ModifyReceiptDialog.tsx` |
| Receipt No, Receipt Date (read-only) | `dialogs/ModifyReceiptDialog.tsx` |
| Installment name (read-only) | `dialogs/ModifyReceiptDialog.tsx` |
| Amount, Method, Pay Date (read-only) | `dialogs/ModifyReceiptDialog.tsx` |
| Manual Receipt No (editable) | `dialogs/ModifyReceiptDialog.tsx` |
| Cheque/Bank fields (editable when applicable) | `dialogs/ModifyReceiptDialog.tsx` |
| Remarks (editable) | `dialogs/ModifyReceiptDialog.tsx` |
| Save Changes button | `dialogs/ModifyReceiptDialog.tsx` |
