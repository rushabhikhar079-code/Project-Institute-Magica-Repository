# Payment Module — File List

All files are in the `payment-module-delivery/` folder.
No existing project files were modified.

## Frontend Source (28 files)

### Foundational (7 files)

| # | File | Purpose |
|---|------|---------|
| 1 | `frontend/src/features/payment/paymentTypes.ts` | TypeScript interfaces for all payment entities (updated: added installmentName, outstandingWithoutTax, curriculum, courseName, subjectNames, receiptDate, EditScheduleForm, PaymentHistoryFilter) |
| 2 | `frontend/src/features/payment/paymentConstants.ts` | Brand color, payment types, methods, statuses, routes (updated: added EDIT_INSTALLMENTS route) |
| 3 | `frontend/src/features/payment/paymentCalculations.ts` | Net formula, tax, installment distribution, adjustments, rounding (updated: outstandingWithoutTax in calculateInstallmentOutstanding and calculateScheduleTotals) |
| 4 | `frontend/src/features/payment/paymentMockData.ts` | In-memory mock data store (updated: new fields on students, installments, receipts, schedules) |
| 5 | `frontend/src/features/payment/paymentService.ts` | Dual-layer service: real API calls + mock calls (updated: new fields in createScheduleMock, recordPaymentMock, Adhoc auto-continuation) |
| 6 | `frontend/src/features/payment/validations/paymentSchema.ts` | Zod validation schemas for all forms |
| 7 | `frontend/src/features/payment/paymentColumns.tsx` | Table column definitions (updated: added Contact, Curriculum, Course, Subject, Schedule/Pay actions, installment Name/Outstanding-excl-Tax, receipt Student/Installment/ReceiptDate/Remarks) |

### Components (10 files)

| # | File | Purpose |
|---|------|---------|
| 8 | `frontend/src/features/payment/components/PaymentStatusBadge.tsx` | Reusable colored status badge |
| 9 | `frontend/src/features/payment/components/PaymentSummaryCards.tsx` | 4-card dashboard summary |
| 10 | `frontend/src/features/payment/components/PaymentSearchFilters.tsx` | Search/filter bar for schedule list |
| 11 | `frontend/src/features/payment/components/StudentPaymentSummary.tsx` | Student info + fee line table with totals (updated: added Contact, Curriculum, Course, Subject, Outstanding-excl-Tax) |
| 12 | `frontend/src/features/payment/components/InstallmentConfiguration.tsx` | Custom installment editor (updated: added Reset Installments, Save & Pay, Adjustment Amount, Total Payable display) |
| 13 | `frontend/src/features/payment/components/ScheduleTable.tsx` | Read-only installment table with totals |
| 14 | `frontend/src/features/payment/components/PaymentSummaryPanel.tsx` | Real-time calculation summary with reconciliation |
| 15 | `frontend/src/features/payment/components/ApplicableOtherFees.tsx` | Checkbox list of other fees |
| 16 | `frontend/src/features/payment/components/SubjectSelection.tsx` | Checkbox list of courses and subjects |
| 17 | `frontend/src/features/payment/components/SubjectSelectionAlert.tsx` | XD-style validation alert with dismiss (NEW — Screen 8) |

### Dialogs (5 files)

| # | File | Purpose |
|---|------|---------|
| 18 | `frontend/src/features/payment/dialogs/EditInstallmentDialog.tsx` | Edit installment details (locked when Paid) |
| 19 | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` | Edit schedule: Change Date/Discount/Payable, settle difference, Done button (REWRITTEN — Screen 10) |
| 20 | `frontend/src/features/payment/dialogs/SendPaymentLinkDialog.tsx` | Email/WhatsApp channel selection with honest warnings |
| 21 | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` | Edit receipt metadata (UPDATED — Screen 12: added Student Name, Receipt Date, Installment display) |
| 22 | `frontend/src/features/payment/dialogs/SubjectSelectionDialog.tsx` | Student search modal with pagination |

### Pages (6 files)

| # | File | Purpose |
|---|------|---------|
| 23 | `frontend/src/features/payment/pages/ManagePayments.tsx` | Main dashboard (updated: added onSchedule, onPay handlers) |
| 24 | `frontend/src/features/payment/pages/EditInstallments.tsx` | Full installment table editing view (NEW — Screen 2) |
| 25 | `frontend/src/features/payment/pages/ScheduleOverview.tsx` | Schedule detail with installments, receipts, all dialogs (updated: static import for updateReceiptMock) |
| 26 | `frontend/src/features/payment/pages/CreateSchedule.tsx` | Single-page two-column schedule creation form |
| 27 | `frontend/src/features/payment/pages/PaymentRecording.tsx` | Payment collection form (REWRITTEN — Screen 6: Edit All Installments, receipt date, fee breakdown, notifications, send link) |
| 28 | `frontend/src/features/payment/pages/PaymentHistory.tsx` | Historical receipts list (REWRITTEN — Screen 5: date range, receipt/reference filter, installment name, remarks) |

## Stylesheet (1 file)

| # | File | Purpose |
|---|------|---------|
| 29 | `frontend/styles/payment-common.scss` | All `pm-` prefixed styles (updated: validation alert, edit installments, filter bar rows, recording fees summary, notifications, save actions, edit schedule sections, checkbox label, responsive additions) |

## Documentation (7 files)

| # | File | Purpose |
|---|------|---------|
| 30 | `api-contracts/README.md` | Full API contract: existing + required endpoints, request/response examples |
| 31 | `api-contracts/tax-percentage.md` | Tax percentage gap analysis and recommendations |
| 32 | `integration-guide.md` | Step-by-step integration into existing application |
| 33 | `file-list.md` | This file |
| 34 | `README.md` | Root README for delivery package (NEW) |
| 35 | `docs/xd-screen-to-source-mapping.md` | XD screen to source file mapping (NEW) |
| 36 | `docs/business-logic-mapping.md` | Business logic to backend formula mapping (NEW) |

## Total: 36 files

### Files NOT modified (verified)

- `im-frontend/` — no files changed
- `im-backend/` — no files changed
- No existing routes, services, components, or styles were altered
