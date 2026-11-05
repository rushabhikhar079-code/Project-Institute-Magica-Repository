# Business Logic Mapping

This document maps the payment module's business logic, distinguishing between:
- **Reused** — existing Git/backend logic preserved
- **New Frontend** — explicitly approved new frontend logic
- **Mock** — temporary mock behavior (no backend endpoint)
- **Missing** — backend functionality not yet implemented
- **Unresolved** — business dependencies not yet defined

---

## Net Payment Formula

**Category:** Reused

**Existing backend formula:**
```
NetPayment = (Basic_Amt - Disc_Amt) + Tax_Amt
```

**Source:** `paymentCalculations.ts` → `calculateNetAmount()`
```typescript
round2(round2(basicAmount - discountAmount) + taxAmount)
```

---

## Tax Calculation

**Category:** Reused

**Existing backend logic:**
- If `IncludingTax = true`:  `Tax_Amt = Basic_Amt - (Basic_Amt / (1 + Tax_Per/100))`
- If `IncludingTax = false`: `Tax_Amt = Basic_Amt * Tax_Per / 100`

**Source:** `paymentCalculations.ts` → `calculateTaxAmount()`

---

## Rounding

**Category:** Reused

**Existing backend:** `Math.Round(value, 2, MidpointRounding.AwayFromZero)`

**Source:** `paymentCalculations.ts` → `round2()`
```typescript
Math.round(value * 100 + Number.EPSILON) / 100
```

---

## Installment Equal Distribution

**Category:** Reused

**Existing backend:** `CreateInstallmentTemplateAsync` — equal share rounded to 2 dp, last installment absorbs the remainder.

**Source:** `paymentCalculations.ts` → `distributeEqually()`
- All installments get `round2(total / count)` except the last
- Last installment gets `round2(total - sum(others))` to ensure exact reconciliation

---

## Outstanding Calculation

**Category:** New Frontend (approved)

**Existing backend:** `paid = receipt_no IS NOT NULL`, `outstanding = receipt_no IS NULL`

**Source:** `paymentCalculations.ts` → `calculateInstallmentOutstanding()`
- `outstandingAmount = netAmount - paidAmount`
- `outstandingWithoutTax = (basicAmount - discountAmount) - paidAmount` (new field for XD)
- Status inference: Paid, PartiallyPaid, Pending

---

## Schedule Totals

**Category:** New Frontend (approved)

**Source:** `paymentCalculations.ts` → `calculateScheduleTotals()`
- `totalPayable` = sum of fee line net amounts
- `totalPaid` = sum of installment paid amounts
- `totalOutstanding` = totalPayable - totalPaid
- `totalOutstandingWithoutTax` = sum(basicAmount - discountAmount) - totalPaid
- `totalDiscount`, `totalTax`, `totalNetAmount`

---

## Adhoc Auto-Continuation

**Category:** New Frontend (approved)

**Rule:** After a partial Adhoc collection, the remaining balance automatically becomes the next Adhoc installment. No new charge is added.

**Source:** `paymentService.ts` → `recordPaymentMock()`
- Calculates remaining balance after payment
- If remaining > 0, creates a new installment with `installmentName: "Adhoc-{n}"`
- New installment has no tax (balance carry-forward)

---

## Adjustment Options

**Category:** New Frontend (approved, XD-defined)

1. **DistributeEqually** — settle difference equally across remaining installments
2. **InNext** — add difference to the next installment
3. **InLast** — add difference to the last installment
4. **InNewInstallment** — create a new installment for the difference
5. **InsertNew** — same as InNewInstallment

**Source:** `paymentCalculations.ts` → `applyAdjustment()`

---

## Payment Status Inference

**Category:** Reused + New Frontend

**Existing backend SQL:** `paid = receipt_no IS NOT NULL`

**Source:** `paymentCalculations.ts`, `paymentColumns.tsx`
- Installment status: Pending, PartiallyPaid, Paid, Overdue, Cancelled
- Schedule status: Draft, Active, Completed, Cancelled

---

## Payment Methods

**Category:** Reused

**Existing values:** Cash, Cheque, UPI, Card, Bank Transfer, Online

**Source:** `paymentConstants.ts` → `PAYMENT_METHODS`
- `requiresInstrument: true` for Cheque and Bank Transfer (shows bank/cheque fields)

---

## Payment Types (Only Three Approved)

**Category:** New Frontend (approved)

1. **LumpSum** — single payment for full amount
2. **Adhoc** — flexible collection with auto carry-forward
3. **Installment** — custom schedule with manual dates/amounts

Monthly and Quarterly are convenience options within Installment only, not separate types.

---

## Roles and Permissions

**Category:** Reused

**Existing backend:** `SUPER_ADMIN=1, ADMIN=2, MANAGER=3` with `PermissionAttribute`

**Frontend:** Permissions documented in `documentation/developer-integration-guide.md`. Frontend does not enforce — backend must validate.

---

## Payment Link Honesty

**Category:** Mock + Missing

**Backend reality:**
- Email: functional (SMTP), but no payment gateway exists for link generation
- WhatsApp: partial (Gupshup whitelist only, send is TODO)
- SMS: not functional
- Payment gateway: does not exist

**Source:** `paymentService.ts` → `sendPaymentLinkMock()`
- **Never** returns `delivered: true`
- Returns clear status messages explaining what is and isn't available

---

## Tax Percentage Gap

**Category:** Missing

**Issue:** No backend API exists to fetch the current tax percentage. The `Tax_Per` value is stored on payment records but its source is undefined.

**Source:** `paymentConstants.ts` → `DEFAULT_TAX_PERCENTAGE = 0`
- Used only when fee configuration does not carry a rate
- Real rate must come from a backend API (see `api-contracts/tax-percentage.md`)

---

## Payment Method Storage Gap

**Category:** Missing

**Issue:** No `PaymentMethod` column exists in receipt tables (`installments_received`, `payments_received`).

**Source:** `PaymentReceipt` interface includes `paymentMethod` field. Backend schema update required (see `api-contracts/README.md`).

---

## Fully Paid Installment Restrictions

**Category:** New Frontend (approved)

**Rule:** Paid and Cancelled installments are locked — no editing of dates, amounts, or remarks.

**Source:** `pages/EditInstallments.tsx` (row lock), `components/ScheduleTable.tsx` (action buttons hidden)

---

## Receipt Detail Modification

**Category:** New Frontend (approved)

**Rule:** Receipt modification is limited to specific fields (manual receipt no, cheque/bank details, remarks). Core receipt data (student, installment, amount, method, pay date) is read-only.

**Source:** `dialogs/ModifyReceiptDialog.tsx`
