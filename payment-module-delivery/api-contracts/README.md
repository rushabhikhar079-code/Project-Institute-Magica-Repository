# Payment Module — API Contracts

This document defines the contract between the payment module frontend
and the backend. It covers:

1. **Existing APIs** the frontend already reuses
2. **Required new APIs** the frontend needs for full functionality
3. **Known gaps** that are currently handled with mock data or defaults

---

## 1. Existing APIs (Reused)

### 1.1 Student Search

**Endpoint:** `POST /Student/search_students`

**Request:**
```json
{
  "listType": "Registration",
  "studentName": "John",
  "reg": "",
  "phone": "",
  "regFrDate": "",
  "regToDate": "",
  "status": 2,
  "branchId": 1,
  "pageNumber": 1,
  "pageSize": 10,
  "sortBy": null,
  "sortDirection": null
}
```

**Response (`response.data.data`):**
```json
{
  "items": [
    {
      "regNo": "1001",
      "name": "John Doe",
      "pContact": "9876543210",
      "emailId": "john@example.com",
      "regNo_Manual": "REG-1001",
      "regDate": "2024-01-15",
      "branchId": 1,
      "courseNames": "BSc Mathematics",
      "subjectNames": "Algebra, Calculus"
    }
  ],
  "totalCount": 50,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 5,
  "hasPrevious": false,
  "hasNext": true
}
```

**Frontend function:** `searchStudents()` in `paymentService.ts`
**Mock fallback:** `searchStudentsMock()` — uses 5 hardcoded students

---

### 1.2 Other Fees

**Endpoint:** `GET /Common/other-fees?instituteId={instituteId}&branchId={branchId}`

**Response:**
```json
[
  {
    "of_code": 1,
    "of_name": "Application Fee",
    "amount": 500,
    "istaxable": 1,
    "isincluding": 0,
    "of_FrequencyName": "One Time"
  }
]
```

**Frontend function:** `getOtherFees()`
**Mock fallback:** `getOtherFeesMock()` — uses 5 hardcoded fees

---

### 1.3 Subject Installment Template (Interval Days)

**Endpoint:** `POST /Subject/set-interval-days`

**Request:**
```json
{
  "CourseFee": 50000,
  "MaxInstallment": 5,
  "Day": 30,
  "BranchId": 1
}
```

**Response:**
```json
{
  "templates": [
    { "srNo": 1, "dayOfMonth": 30, "amount": 10000 },
    { "srNo": 2, "dayOfMonth": 60, "amount": 10000 }
  ],
  "totalAmount": 50000
}
```

**Frontend function:** `generateSubjectIntervalTemplate()`

---

### 1.4 Subject Installment Template (Monthly)

**Endpoint:** `POST /Subject/set-monthly-interval`

Same request/response shape as 1.3, but intervals are monthly.

**Frontend function:** `generateSubjectMonthlyTemplate()`

---

### 1.5 Subject Payment Template

**Endpoint:** `GET /Subject/get-payment-template/{subjectId}`

**Response:**
```json
{
  "paymentTemplateId": 3,
  "templateDetails": [
    { "noOfDay": 30, "amount": 10000 },
    { "noOfDay": 60, "amount": 10000 }
  ]
}
```

**Frontend function:** `getSubjectPaymentTemplate()`

---

## 2. Required New APIs

These endpoints do not exist yet. The frontend currently uses mock
implementations. Each section below shows the contract the backend
should implement.

### 2.1 Create Payment Schedule

**Endpoint:** `POST /Payment/create-schedule`

**Request:**
```json
{
  "studentId": "1001",
  "branchId": 1,
  "paymentType": "Installment",
  "feeLines": [
    {
      "type": "Subject",
      "code": "S101",
      "name": "Algebra",
      "basicAmount": 10000,
      "discountAmount": 500,
      "taxPercentage": 18,
      "taxAmount": 1710,
      "netAmount": 11210,
      "feesType": "S"
    }
  ],
  "installments": [
    {
      "installmentNo": 1,
      "dueDate": "15/01/2025",
      "basicAmount": 3736.67,
      "discountAmount": 0,
      "taxAmount": 0,
      "netAmount": 3736.67,
      "remarks": ""
    }
  ],
  "remarks": "Standard installment plan"
}
```

**Response:**
```json
{
  "id": "PAY-2025-001",
  "status": "Active",
  "totalPayable": 11210,
  "totalOutstanding": 11210,
  "createdAt": "15/01/2025"
}
```

**Mapping to existing tables:**
- `payment` — header (student, type, status, totals)
- `payment_installments` — each installment row

---

### 2.2 Get Payment Schedules (List)

**Endpoint:** `POST /Payment/search-schedules`

**Request:**
```json
{
  "studentName": "",
  "regNo": "",
  "paymentType": "",
  "status": "",
  "branchId": 1,
  "pageNumber": 1,
  "pageSize": 10,
  "sortBy": "createdAt",
  "sortDirection": "desc"
}
```

**Response:**
```json
{
  "items": [
    {
      "id": "PAY-2025-001",
      "studentId": "1001",
      "studentName": "John Doe",
      "studentRegNo": "REG-1001",
      "paymentType": "Installment",
      "status": "Active",
      "totalPayable": 11210,
      "totalPaid": 5000,
      "totalOutstanding": 6210,
      "createdAt": "15/01/2025"
    }
  ],
  "totalCount": 25,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 3,
  "hasPrevious": false,
  "hasNext": true
}
```

---

### 2.3 Get Schedule by ID

**Endpoint:** `GET /Payment/get-schedule/{id}`

**Response:** Full schedule with fee lines, installments, and receipts.

---

### 2.4 Update Schedule

**Endpoint:** `PUT /Payment/update-schedule/{id}`

**Request:** Partial schedule fields (e.g., `remarks`, `status`).

---

### 2.5 Update Installment

**Endpoint:** `PUT /Payment/update-installment/{scheduleId}/{installmentId}`

**Request:**
```json
{
  "dueDate": "20/02/2025",
  "basicAmount": 4000,
  "discountAmount": 200,
  "remarks": "Adjusted due date"
}
```

---

### 2.6 Record Payment

**Endpoint:** `POST /Payment/record-payment`

**Request:**
```json
{
  "scheduleId": "PAY-2025-001",
  "installmentId": "inst-1",
  "amountReceived": 5000,
  "paymentMethod": "Cheque",
  "payDate": "15/02/2025",
  "manualReceiptNo": "MR-001",
  "chequeNo": "CH-123456",
  "chequeDate": "14/02/2025",
  "bank": "HDFC Bank",
  "branchAddr": "MG Road",
  "remarks": "First installment"
}
```

**Response:**
```json
{
  "receipt": {
    "id": "RCP-001",
    "receiptNo": "RCP20250215001",
    "amount": 5000,
    "payDate": "15/02/2025"
  },
  "schedule": {
    "id": "PAY-2025-001",
    "totalPaid": 5000,
    "totalOutstanding": 6210,
    "installments": []
  }
}
```

**Mapping to existing tables:**
- `installments_received` — receipt record
- `payments_received` — payment instrument details
- `payment_installments` — update `paid_amount`, `receipt_no`

**Payment Method persistence gap:**
No `PaymentMethod` column exists in the receipt tables.
**Required:** Add a `Payment_Method` column to `installments_received`
(or `payments_received`), or infer from instrument fields:
- `Cheque_No IS NOT NULL` → Cheque
- `Bank IS NOT NULL AND Cheque_No IS NULL` → BankTransfer
- Otherwise → Cash (default)

---

### 2.7 Cancel Schedule

**Endpoint:** `PUT /Payment/cancel-schedule/{id}`

Soft-cancel. Sets status to `Cancelled`. Does not delete records.

---

### 2.8 Get Receipts by Schedule

**Endpoint:** `GET /Payment/get-receipts/{scheduleId}`

---

### 2.9 Update Receipt

**Endpoint:** `PUT /Payment/update-receipt/{receiptId}`

Allows editing receipt metadata (manual receipt no, cheque details, bank, remarks).

---

### 2.10 Send Payment Link

**Endpoint:** `POST /Payment/send-payment-link`

**Request:**
```json
{
  "scheduleId": "PAY-2025-001",
  "channel": "Email",
  "recipient": "john@example.com",
  "studentName": "John Doe",
  "amount": 6210
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment link sent via email",
  "delivered": true
}
```

**Dependencies (current status):**
- Email service: **Functional** (SMTP) — but no payment URL can be generated
- WhatsApp: **Not functional** (Gupshup whitelist only, send is TODO)
- SMS: **Not functional**
- Payment gateway: **Does not exist**

Until a payment gateway is integrated, `delivered` should be `false`.

---

## 3. Known Gaps

### 3.1 Tax Percentage Source

**Problem:** The `Tax_Per` column exists on `payment` and `payment_installments`
tables, but no API exposes the tax rate for a given fee configuration.

**Current handling:** `DEFAULT_TAX_PERCENTAGE = 0` in `paymentConstants.ts`.
Tax calculations use this default when no rate is provided.

**Required:** Either:
- Add `taxPercentage` to the course/subject/other-fee API responses, OR
- Create a `GET /Common/tax-rate?hsnCode={code}` endpoint, OR
- Store the rate at schedule creation time from a branch-level config

### 3.2 Payment Method Persistence

**Problem:** No `PaymentMethod` column in receipt tables.

**Current handling:** The frontend tracks method in memory. The receipt
type is inferred from instrument fields (cheque no, bank).

**Required:** Add `Payment_Method VARCHAR(20)` to `installments_received`.

### 3.3 Subjects/Courses with Fee Info

**Problem:** No single API returns subjects/courses with fee, tax, and
installment config for a given branch.

**Current handling:** `getSubjectsMock()` and `getCoursesMock()` return
hardcoded data.

**Required:** Create `GET /Payment/get-fee-items?branchId={id}&studentId={id}`
returning subjects, courses, and other fees with their tax/installment config.

### 3.4 DB Permissions for Payment Module

**Problem:** The `m_modules` table (used by `CheckModulePermission`) has
no Payment module entry. The backend `PermissionAttribute` will reject
all payment endpoints.

**Required:** Insert a new module row:
```sql
INSERT INTO m_modules (module_name, module_path, canView, canAdd, canEdit, canDelete)
VALUES ('Payment', '/payment', 1, 1, 1, 1);
```
And grant permissions to roles SUPER_ADMIN(1), ADMIN(2), MANAGER(3).
