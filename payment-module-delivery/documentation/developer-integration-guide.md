# Developer Integration Guide

This guide explains how to integrate the Payment Module frontend into the existing Institute Magica application.

---

## 1. File Placement

### Source files

Copy the `frontend/src/features/payment/` folder into the existing frontend:

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
│   ├── SubjectSelection.tsx
│   └── SubjectSelectionAlert.tsx
├── dialogs/
│   ├── EditInstallmentDialog.tsx
│   ├── EditScheduleDialog.tsx
│   ├── SendPaymentLinkDialog.tsx
│   ├── ModifyReceiptDialog.tsx
│   └── SubjectSelectionDialog.tsx
└── pages/
    ├── ManagePayments.tsx
    ├── EditInstallments.tsx
    ├── ScheduleOverview.tsx
    ├── CreateSchedule.tsx
    ├── PaymentRecording.tsx
    └── PaymentHistory.tsx
```

### Stylesheet

Copy `frontend/styles/payment-common.scss` into the existing frontend's style directory and import it once:

```ts
import "../../../styles/payment-common.scss";
```

Or add to global `index.scss`:
```scss
@import "./styles/payment-common.scss";
```

---

## 2. Route Registration

Add payment routes to the existing router (`src/app/routes.tsx`):

```tsx
import { ManagePayments } from "../features/payment/pages/ManagePayments";
import { ScheduleOverview } from "../features/payment/pages/ScheduleOverview";
import { CreateSchedule } from "../features/payment/pages/CreateSchedule";
import { PaymentRecording } from "../features/payment/pages/PaymentRecording";
import { PaymentHistory } from "../features/payment/pages/PaymentHistory";
import { EditInstallments } from "../features/payment/pages/EditInstallments";

// Inside the router children array:
{
  path: "payment",
  element: <ProtectedRoute><PaymentLayout /></ProtectedRoute>,
  children: [
    { index: true, element: <ManagePayments branchId={branchId} onNavigate={navigate} /> },
    { path: "schedules/:id", element: <ScheduleOverview /> },
    { path: "create-schedule", element: <CreateSchedule /> },
    { path: "edit-installments/:scheduleId", element: <EditInstallments /> },
    { path: "record-payment/:scheduleId", element: <PaymentRecording /> },
    { path: "history", element: <PaymentHistory /> },
  ],
}
```

### Navigation props

Pages use callback props for navigation. Wire to `useNavigate()`:

```tsx
const PaymentLayout = () => {
  const navigate = useNavigate();
  const { branchId } = useAppContext();
  return <Outlet context={{ branchId, navigate }} />;
};
```

---

## 3. Sidebar / Navigation Menu

Add a "Payment" entry to the sidebar. Route path: `/payment`. Icon: `CreditCard` or `Receipt` from lucide-react.

---

## 4. API Service Import

`paymentService.ts` imports the existing axios instance:
```ts
import api from "../../../services/api";
```

This path assumes the file is at `src/features/payment/paymentService.ts`. Adjust if placed elsewhere.

---

## 5. Replacing Mock with Real APIs

| Mock function | Replace with |
|---|---|
| `searchStudentsMock()` | `searchStudents()` (existing endpoint) |
| `getOtherFeesMock()` | `getOtherFees()` (existing endpoint) |
| `getSubjectsMock()` | New API: `GET /Payment/get-fee-items` |
| `getCoursesMock()` | New API: `GET /Payment/get-fee-items` |
| `getSchedulesMock()` | New API: `POST /Payment/search-schedules` |
| `getScheduleByIdMock()` | New API: `GET /Payment/get-schedule/{id}` |
| `createScheduleMock()` | New API: `POST /Payment/create-schedule` |
| `updateScheduleMock()` | New API: `PUT /Payment/update-schedule/{id}` |
| `updateInstallmentMock()` | New API: `PUT /Payment/update-installment` |
| `recordPaymentMock()` | New API: `POST /Payment/record-payment` |
| `cancelScheduleMock()` | New API: `PUT /Payment/cancel-schedule/{id}` |
| `getReceiptsByScheduleMock()` | New API: `GET /Payment/get-receipts/{scheduleId}` |
| `updateReceiptMock()` | New API: `PUT /Payment/update-receipt/{receiptId}` |
| `sendPaymentLinkMock()` | New API: `POST /Payment/send-payment-link` (requires payment gateway) |

To switch: implement the backend endpoint, change the import from `*Mock` to the real function, remove the mock notice banner.

---

## 6. Permissions

Add a Payment module entry:
```sql
INSERT INTO m_modules (module_name, module_path, canView, canAdd, canEdit, canDelete)
VALUES ('Payment', '/payment', 1, 1, 1, 1);
```
Grant to roles: SUPER_ADMIN(1), ADMIN(2), MANAGER(3).

---

## 7. Build Configuration

No changes to `vite.config.ts` required. Dependencies used:
- `react`, `react-dom` (existing)
- `lucide-react` (existing)
- `zod` (existing — for validation schemas)

---

## 8. Preview Environment

A standalone visual preview is available at `payment-module-delivery/preview/`. See `documentation/preview-guide.md` for setup instructions.

The preview renders the actual delivery source files — it is not a separate implementation.
