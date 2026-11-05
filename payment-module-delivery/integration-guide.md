# Payment Module — Integration Guide

This guide explains how to integrate the payment module frontend into
the existing Institute Magica application.

---

## 1. File Placement

### Source files

Copy the `src/features/payment/` folder into the existing frontend:

```
im-frontend/src/features/payment/
├── paymentTypes.ts
├── paymentConstants.ts
├── paymentCalculations.ts
├── paymentMockData.ts
├── paymentService.ts
├── paymentColumns.tsx
├── validations/
│   └── paymentSchema.ts
├── components/
│   ├── PaymentStatusBadge.tsx
│   ├── PaymentSummaryCards.tsx
│   ├── PaymentSearchFilters.tsx
│   ├── StudentPaymentSummary.tsx
│   ├── InstallmentConfiguration.tsx
│   ├── ScheduleTable.tsx
│   ├── PaymentSummaryPanel.tsx
│   ├── ApplicableOtherFees.tsx
│   └── SubjectSelection.tsx
├── dialogs/
│   ├── EditInstallmentDialog.tsx
│   ├── EditScheduleDialog.tsx
│   ├── SendPaymentLinkDialog.tsx
│   ├── ModifyReceiptDialog.tsx
│   └── SubjectSelectionDialog.tsx
└── pages/
    ├── ManagePayments.tsx
    ├── ScheduleOverview.tsx
    ├── CreateSchedule.tsx
    ├── PaymentRecording.tsx
    └── PaymentHistory.tsx
```

### Stylesheet

Copy `styles/payment-common.scss` into the existing frontend's style
directory and import it once at the app root or in the payment module's
container component:

```ts
import "../../../styles/payment-common.scss";
```

Or add it to the global `index.scss` / `main.css`:

```scss
@import "./styles/payment-common.scss";
```

---

## 2. Route Registration

Add the payment routes to the existing router (`src/app/routes.tsx`).
Follow the existing pattern with `ProtectedRoute` and `useAppContext()`.

```tsx
import { ManagePayments } from "../features/payment/pages/ManagePayments";
import { ScheduleOverview } from "../features/payment/pages/ScheduleOverview";
import { CreateSchedule } from "../features/payment/pages/CreateSchedule";
import { PaymentRecording } from "../features/payment/pages/PaymentRecording";
import { PaymentHistory } from "../features/payment/pages/PaymentHistory";

// Inside the router children array:
{
  path: "payment",
  element: <ProtectedRoute><PaymentLayout /></ProtectedRoute>,
  children: [
    { index: true, element: <ManagePayments /> },
    { path: "schedules/:id", element: <ScheduleOverview /> },
    { path: "create-schedule", element: <CreateSchedule /> },
    { path: "record-payment/:scheduleId", element: <PaymentRecording /> },
    { path: "history", element: <PaymentHistory /> },
  ],
}
```

### Navigation props

The pages use callback props (`onBack`, `onCreated`, `onRecorded`) for
navigation. Wire these to `useNavigate()`:

```tsx
// Example wrapper component
const PaymentLayout = () => {
  const navigate = useNavigate();
  const { branchId } = useAppContext();

  return (
    <Outlet context={{ branchId, navigate }} />
  );
};

// In each page, read from outlet context or pass directly:
<ManagePayments
  branchId={branchId}
  onViewSchedule={(id) => navigate(`/payment/schedules/${id}`)}
  onCreateSchedule={() => navigate("/payment/create-schedule")}
  onRecordPayment={(id) => navigate(`/payment/record-payment/${id}`)}
  onPaymentHistory={() => navigate("/payment/history")}
/>
```

Each page accepts `onBack: () => void` — wire to `navigate(-1)` or
`navigate("/payment")`.

---

## 3. Sidebar / Navigation Menu

Add a "Payment" entry to the existing sidebar navigation. Follow the
existing pattern for other modules (e.g., Students, Admission).

The route path is `/payment` and the icon can be any lucide-react
payment-related icon (e.g., `CreditCard`, `Wallet`, `Receipt`).

---

## 4. API Service Import

The `paymentService.ts` file imports the existing axios instance:

```ts
import api from "../../../services/api";
```

This relative path assumes the file is at:
`src/features/payment/paymentService.ts`

If placed elsewhere, adjust the import path. The `api` instance provides:
- JWT authentication headers
- Token refresh
- `{ showLoader }` config option
- `response.data.data` unwrap pattern

All real API calls in `paymentService.ts` follow the existing project
pattern (same as `admissionService.ts`).

---

## 5. Replacing Mock with Real APIs

The service layer has two sets of functions:

| Mock function | Replace with |
|---|---|
| `searchStudentsMock()` | `searchStudents()` (already implemented) |
| `getOtherFeesMock()` | `getOtherFees()` (already implemented) |
| `getSubjectsMock()` | New API: `GET /Payment/get-fee-items` |
| `getCoursesMock()` | New API: `GET /Payment/get-fee-items` |
| `getSchedulesMock()` | New API: `POST /Payment/search-schedules` |
| `getScheduleByIdMock()` | New API: `GET /Payment/get-schedule/{id}` |
| `createScheduleMock()` | New API: `POST /Payment/create-schedule` |
| `updateScheduleMock()` | New API: `PUT /Payment/update-schedule/{id}` |
| `updateInstallmentMock()` | New API: `PUT /Payment/update-installment/{scheduleId}/{installmentId}` |
| `recordPaymentMock()` | New API: `POST /Payment/record-payment` |
| `cancelScheduleMock()` | New API: `PUT /Payment/cancel-schedule/{id}` |
| `getReceiptsByScheduleMock()` | New API: `GET /Payment/get-receipts/{scheduleId}` |
| `updateReceiptMock()` | New API: `PUT /Payment/update-receipt/{receiptId}` |
| `sendPaymentLinkMock()` | New API: `POST /Payment/send-payment-link` |

To switch from mock to real:
1. Implement the backend endpoint (see `api-contracts/README.md`)
2. In the page component, change the import from `*Mock` to the real function
3. Remove the mock notice banner

The function signatures are designed to match — only the import name changes.

---

## 6. TypeScript Considerations

The module uses these TypeScript types that may need alignment with
existing project types:

- `StudentSearchResult` — matches existing `StudentList` but with
  different casing (camelCase vs PascalCase). The service layer handles
  the mapping.
- `OtherFee` — matches the existing `OtherFee` type in admission types.
- `ApiResponse<T>` — matches the existing `ApiResponse<T>` wrapper.

If the project has a shared types file, consolidate duplicate types
and re-export from `paymentTypes.ts`.

---

## 7. Redux / State Management

The module does **not** use Redux. All state is local React state
(`useState`, `useEffect`). This matches the module's self-contained
design.

If the project requires Redux integration (e.g., for cross-module
communication), wrap the page components in a `PaymentProvider` context
that exposes the schedule data and actions.

---

## 8. Permissions

The backend `PermissionAttribute` checks the `m_modules` table for
module access. A Payment module entry must be added:

```sql
INSERT INTO m_modules (module_name, module_path, canView, canAdd, canEdit, canDelete)
VALUES ('Payment', '/payment', 1, 1, 1, 1);
```

Grant to roles: SUPER_ADMIN(1), ADMIN(2), MANAGER(3).

On the frontend, the existing `ProtectedRoute` handles access control.
No additional permission checks are needed in the payment components.

---

## 9. Build Configuration

No changes to `vite.config.ts` are required. The module uses only
existing dependencies:
- `react`, `react-dom`
- `lucide-react`
- `zod` (for validation)
- `react-hook-form` (optional — schemas are defined but forms use
  controlled state; integrate RHF if preferred)

If `zod` is not already installed:
```bash
npm install zod
```

---

## 10. Testing Checklist

After integration, verify:

- [ ] Manage Payments page loads with summary cards and schedule list
- [ ] Search filters work (by student name, reg no, payment type, status)
- [ ] Create Schedule: student selection dialog opens and returns results
- [ ] Create Schedule: payment type selection updates installment UI
- [ ] Create Schedule: Lump Sum shows single installment
- [ ] Create Schedule: Adhoc shows single installment with auto-continuation note
- [ ] Create Schedule: Installment shows multi-row editor with equal distribution
- [ ] Create Schedule: XD adjustment options work (DistributeEqually, InNext, InLast, InNewInstallment)
- [ ] Create Schedule: reconciliation indicator shows green when sums match
- [ ] Create Schedule: save creates a new schedule and navigates back
- [ ] Schedule Overview: shows student summary, installment table, receipts table
- [ ] Schedule Overview: edit installment dialog works (locked when Paid)
- [ ] Schedule Overview: edit schedule dialog works (locked when Cancelled)
- [ ] Schedule Overview: send payment link dialog shows dependency warnings (never claims delivery)
- [ ] Schedule Overview: modify receipt dialog shows cheque/bank fields only for Cheque/BankTransfer
- [ ] Payment Recording: installment selection auto-fills outstanding amount
- [ ] Payment Recording: cheque/bank fields appear only for Cheque/BankTransfer
- [ ] Payment Recording: recording a payment updates installment status
- [ ] Payment Recording: Adhoc auto-continuation creates next installment
- [ ] Payment History: lists all receipts with filter by method
- [ ] Payment History: modify receipt dialog works
- [ ] All mock notices are visible and clearly labeled as temporary
- [ ] No existing project files were modified
