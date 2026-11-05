# Payment Module — File List

All files are in the `payment-module-delivery/` folder.
No existing project files were modified.

## Frontend Source (23 files)

### Foundational (7 files)

| # | File | Purpose |
|---|------|---------|
| 1 | `frontend/src/features/payment/paymentTypes.ts` | TypeScript interfaces for all payment entities |
| 2 | `frontend/src/features/payment/paymentConstants.ts` | Brand color, payment types, methods, statuses, routes |
| 3 | `frontend/src/features/payment/paymentCalculations.ts` | Net formula, tax, installment distribution, adjustments, rounding |
| 4 | `frontend/src/features/payment/paymentMockData.ts` | In-memory mock data store (students, subjects, courses, fees, schedules) |
| 5 | `frontend/src/features/payment/paymentService.ts` | Dual-layer service: real API calls + mock calls |
| 6 | `frontend/src/features/payment/validations/paymentSchema.ts` | Zod validation schemas for all forms |
| 7 | `frontend/src/features/payment/paymentColumns.tsx` | Table column definitions for schedules, installments, receipts |

### Components (9 files)

| # | File | Purpose |
|---|------|---------|
| 8 | `frontend/src/features/payment/components/PaymentStatusBadge.tsx` | Reusable colored status badge |
| 9 | `frontend/src/features/payment/components/PaymentSummaryCards.tsx` | 4-card dashboard summary |
| 10 | `frontend/src/features/payment/components/PaymentSearchFilters.tsx` | Search/filter bar for schedule list |
| 11 | `frontend/src/features/payment/components/StudentPaymentSummary.tsx` | Student info + fee line table with totals |
| 12 | `frontend/src/features/payment/components/InstallmentConfiguration.tsx` | Custom installment editor with XD adjustments |
| 13 | `frontend/src/features/payment/components/ScheduleTable.tsx` | Read-only installment table with totals |
| 14 | `frontend/src/features/payment/components/PaymentSummaryPanel.tsx` | Real-time calculation summary with reconciliation |
| 15 | `frontend/src/features/payment/components/ApplicableOtherFees.tsx` | Checkbox list of other fees |
| 16 | `frontend/src/features/payment/components/SubjectSelection.tsx` | Checkbox list of courses and subjects |

### Dialogs (5 files)

| # | File | Purpose |
|---|------|---------|
| 17 | `frontend/src/features/payment/dialogs/EditInstallmentDialog.tsx` | Edit installment details (locked when Paid) |
| 18 | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` | Edit schedule remarks (locked when Cancelled) |
| 19 | `frontend/src/features/payment/dialogs/SendPaymentLinkDialog.tsx` | Email/WhatsApp channel selection with honest warnings |
| 20 | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` | Edit receipt metadata with conditional cheque/bank fields |
| 21 | `frontend/src/features/payment/dialogs/SubjectSelectionDialog.tsx` | Student search modal with pagination |

### Pages (5 files)

| # | File | Purpose |
|---|------|---------|
| 22 | `frontend/src/features/payment/pages/ManagePayments.tsx` | Main dashboard with summary, search, schedule list |
| 23 | `frontend/src/features/payment/pages/ScheduleOverview.tsx` | Schedule detail with installments, receipts, all dialogs |
| 24 | `frontend/src/features/payment/pages/CreateSchedule.tsx` | 5-step schedule creation flow |
| 25 | `frontend/src/features/payment/pages/PaymentRecording.tsx` | Payment collection form with method/instrument fields |
| 26 | `frontend/src/features/payment/pages/PaymentHistory.tsx` | Historical receipts list with method filter |

## Stylesheet (1 file)

| # | File | Purpose |
|---|------|---------|
| 27 | `frontend/styles/payment-common.scss` | All `pm-` prefixed styles, design tokens, responsive rules |

## Documentation (4 files)

| # | File | Purpose |
|---|------|---------|
| 28 | `api-contracts/README.md` | Full API contract: existing + required endpoints, request/response examples |
| 29 | `api-contracts/tax-percentage.md` | Tax percentage gap analysis and recommendations |
| 30 | `integration-guide.md` | Step-by-step integration into existing application |
| 31 | `file-list.md` | This file |

## Total: 31 files

### Files NOT modified (verified)

- `im-frontend/` — no files changed
- `im-backend/` — no files changed
- No existing routes, services, components, or styles were altered
