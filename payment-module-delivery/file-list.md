# File List — Payment Module Delivery

Total: **51 files** (excluding node_modules, dist, and package-lock.json)

---

## Foundational Source (7 files)

| # | File | Purpose |
|---|---|---|
| 1 | `frontend/src/features/payment/paymentTypes.ts` | All TypeScript interfaces |
| 2 | `frontend/src/features/payment/paymentConstants.ts` | Constants (types, methods, routes, tax) |
| 3 | `frontend/src/features/payment/paymentCalculations.ts` | Business logic (net, tax, rounding, distribution, adjustments) |
| 4 | `frontend/src/features/payment/paymentMockData.ts` | In-memory mock data (students, schedules, receipts) |
| 5 | `frontend/src/features/payment/paymentService.ts` | Dual-layer service (real API + mock) |
| 6 | `frontend/src/features/payment/paymentColumns.tsx` | Table column definitions (schedule, installment, receipt) |
| 7 | `frontend/src/features/payment/validations/paymentSchema.ts` | Zod validation schemas |

## Components (10 files)

| # | File | Purpose |
|---|---|---|
| 8 | `frontend/src/features/payment/components/PaymentStatusBadge.tsx` | Status badge |
| 9 | `frontend/src/features/payment/components/PaymentSummaryCards.tsx` | Summary cards (payable, paid, outstanding, active) |
| 10 | `frontend/src/features/payment/components/PaymentSearchFilters.tsx` | Search filters |
| 11 | `frontend/src/features/payment/components/StudentPaymentSummary.tsx` | Student info + fee lines + totals |
| 12 | `frontend/src/features/payment/components/InstallmentConfiguration.tsx` | Installment editor with adjustments |
| 13 | `frontend/src/features/payment/components/ScheduleTable.tsx` | Installment schedule table |
| 14 | `frontend/src/features/payment/components/PaymentSummaryPanel.tsx` | Payment summary sidebar panel |
| 15 | `frontend/src/features/payment/components/ApplicableOtherFees.tsx` | Other fees selection |
| 16 | `frontend/src/features/payment/components/SubjectSelection.tsx` | Subject/course selection |
| 17 | `frontend/src/features/payment/components/SubjectSelectionAlert.tsx` | XD-style validation alert (Screen 8) |

## Dialogs (5 files)

| # | File | Purpose |
|---|---|---|
| 18 | `frontend/src/features/payment/dialogs/EditInstallmentDialog.tsx` | Edit single installment |
| 19 | `frontend/src/features/payment/dialogs/EditScheduleDialog.tsx` | Edit schedule with date/discount/payable adjustments (Screen 10) |
| 20 | `frontend/src/features/payment/dialogs/SendPaymentLinkDialog.tsx` | Send payment link (honest mock, never claims delivery) |
| 21 | `frontend/src/features/payment/dialogs/ModifyReceiptDialog.tsx` | Modify receipt details (Screen 12) |
| 22 | `frontend/src/features/payment/dialogs/SubjectSelectionDialog.tsx` | Student search modal |

## Pages (6 files)

| # | File | Purpose |
|---|---|---|
| 23 | `frontend/src/features/payment/pages/ManagePayments.tsx` | Manage Payments list (Screen 1) |
| 24 | `frontend/src/features/payment/pages/EditInstallments.tsx` | Full installment table editing (Screen 2) |
| 25 | `frontend/src/features/payment/pages/ScheduleOverview.tsx` | Schedule detail view (Screen 3) |
| 26 | `frontend/src/features/payment/pages/CreateSchedule.tsx` | Single-page create schedule form (Screen 4/7) |
| 27 | `frontend/src/features/payment/pages/PaymentRecording.tsx` | Payment recording form (Screen 6) |
| 28 | `frontend/src/features/payment/pages/PaymentHistory.tsx` | Payment history with filters (Screen 5) |

## Stylesheet (1 file)

| # | File | Purpose |
|---|---|---|
| 29 | `frontend/styles/payment-common.scss` | Common stylesheet (pm- prefix, all XD screens) |

## Preview Stubs (3 files)

| # | File | Purpose |
|---|---|---|
| 30 | `frontend/services/api.ts` | No-op axios stub for preview import resolution |
| 31 | `components/common/DataTable/index.ts` | Re-export for preview import resolution |
| 32 | `components/common/DataTable/types.ts` | TableColumn type stub for preview |

## Preview Environment (7 files)

| # | File | Purpose |
|---|---|---|
| 33 | `preview/package.json` | Preview app dependencies |
| 34 | `preview/tsconfig.json` | Preview TypeScript config |
| 35 | `preview/vite.config.ts` | Vite config with lucide-react alias |
| 36 | `preview/index.html` | HTML entry point |
| 37 | `preview/src/main.tsx` | React root |
| 38 | `preview/src/PreviewApp.tsx` | App shell with sidebar navigation and dialog showcase |
| 39 | `preview/src/preview-styles.ts` | Style imports |
| 40 | `preview/src/preview-shell.scss` | Preview-only shell styles |

## Documentation (11 files)

| # | File | Purpose |
|---|---|---|
| 41 | `README.md` | Root README with overview and directory structure |
| 42 | `file-list.md` | This file |
| 43 | `documentation/xd-screen-source-mapping.md` | All 12 XD screens mapped to source files |
| 44 | `documentation/business-logic-mapping.md` | Business logic rules and source implementations |
| 45 | `documentation/developer-integration-guide.md` | How to integrate into im-frontend |
| 46 | `documentation/preview-guide.md` | How to run the visual preview |
| 47 | `api-contracts/README.md` | API contracts (existing vs proposed) |
| 48 | `api-contracts/tax-percentage.md` | Tax percentage gap analysis |
| 49 | `integration-guide.md` | Original integration guide (superseded by documentation/) |
| 50 | `docs/xd-screen-to-source-mapping.md` | Original XD mapping (superseded by documentation/) |
| 51 | `docs/business-logic-mapping.md` | Original business logic mapping (superseded by documentation/) |

---

## XD Screen Coverage Summary

| Screen | Primary Source |
|---|---|
| 1. Manage Payments | `pages/ManagePayments.tsx` |
| 2. Edit Installments | `pages/EditInstallments.tsx` |
| 3. Schedule Overview | `pages/ScheduleOverview.tsx` |
| 4. Create Schedule | `pages/CreateSchedule.tsx` |
| 5. Payment History | `pages/PaymentHistory.tsx` |
| 6. Payment Recording | `pages/PaymentRecording.tsx` |
| 7. Schedule Form Variation | `pages/CreateSchedule.tsx` (edit mode) |
| 8. Subject Selection Alert | `components/SubjectSelectionAlert.tsx` |
| 9. Installment Configuration | `components/InstallmentConfiguration.tsx` |
| 10. Edit Schedule Dialog | `dialogs/EditScheduleDialog.tsx` |
| 11. Send Payment Link | `dialogs/SendPaymentLinkDialog.tsx` |
| 12. Modify Receipt | `dialogs/ModifyReceiptDialog.tsx` |
