# Business Logic Mapping

This document maps the payment module's business logic to the existing backend formulas and rules.

## Net Payment Formula

**Existing backend formula:**
```
NetPayment = (Basic_Amt - Disc_Amt) + Tax_Amt
```

**Source implementation:** `paymentCalculations.ts` → `calculateNetAmount()`
```typescript
round2(round2(basicAmount - discountAmount) + taxAmount)
```

## Tax Calculation

**Existing backend logic:**
- If `IncludingTax = true`:  `Tax_Amt = Basic_Amt - (Basic_Amt / (1 + Tax_Per/100))`
- If `IncludingTax = false`: `Tax_Amt = Basic_Amt * Tax_Per / 100`

**Source implementation:** `paymentCalculations.ts` → `calculateTaxAmount()`

## Rounding

**Existing backend:** `Math.Round(value, 2, MidpointRounding.AwayFromZero)`

**Source implementation:** `paymentCalculations.ts` → `round2()`
```typescript
Math.round(value * 100 + Number.EPSILON) / 100
```

## Installment Equal Distribution

**Existing backend:** `CreateInstallmentTemplateAsync` — equal share rounded to 2 dp, last installment absorbs the remainder.

**Source implementation:** `paymentCalculations.ts` → `distributeEqually()`
- All installments get `round2(total / count)` except the last
- Last installment gets `round2(total - sum(others))` to ensure exact reconciliation

## Outstanding Calculation

**Existing backend:**
- `paid = receipt_no IS NOT NULL`
- `outstanding = receipt_no IS NULL`

**Source implementation:** `paymentCalculations.ts` → `calculateInstallmentOutstanding()`
- `outstandingAmount = netAmount - paidAmount`
- `outstandingWithoutTax = (basicAmount - discountAmount) - paidAmount`
- Status inference: Paid (outstanding ≤ 0 && paid > 0), PartiallyPaid (paid > 0 && outstanding > 0), Pending (outstanding > 0 && paid === 0)

## Schedule Totals

**Source implementation:** `paymentCalculations.ts` → `calculateScheduleTotals()`
- `totalPayable` = sum of fee line net amounts
- `totalPaid` = sum of installment paid amounts
- `totalOutstanding` = totalPayable - totalPaid
- `totalOutstandingWithoutTax` = sum(basicAmount - discountAmount) - totalPaid
- `totalDiscount` = sum of fee line discount amounts
- `totalTax` = sum of fee line tax amounts

## Adhoc Auto-Continuation

**Rule:** After a partial Adhoc collection, the remaining balance automatically becomes the next Adhoc installment. No new charge is added.

**Source implementation:** `paymentService.ts` → `recordPaymentMock()`
- Calculates remaining balance after payment
- If remaining > 0, creates a new installment with `installmentName: "Adhoc-{n}"`
- New installment has no tax (balance carry-forward)

## Adjustment Options

**XD-defined options:**
1. **DistributeEqually** — settle difference equally across remaining installments
2. **InNext** — add difference to the next installment
3. **InLast** — add difference to the last installment
4. **InNewInstallment** — create a new installment for the difference
5. **InsertNew** — same as InNewInstallment

**Source implementation:** `paymentCalculations.ts` → `applyAdjustment()`

## Payment Status Inference

**Existing backend SQL:**
- `paid = receipt_no IS NOT NULL`
- `outstanding = receipt_no IS NULL`

**Source implementation:** `paymentColumns.tsx` and `paymentCalculations.ts`
- Installment status: Pending, PartiallyPaid, Paid, Overdue, Cancelled
- Schedule status: Draft, Active, Completed, Cancelled

## Payment Methods

**Existing values:** Cash, Cheque, UPI, Card, Bank Transfer, Online

**Source implementation:** `paymentConstants.ts` → `PAYMENT_METHODS`
- `requiresInstrument: true` for Cheque and Bank Transfer (shows bank/cheque fields)

## Payment Types (Only Three Approved)

1. **LumpSum** — single payment for full amount
2. **Adhoc** — flexible collection with auto carry-forward
3. **Installment** — custom schedule with manual dates/amounts

Monthly and Quarterly are convenience options within Installment only, not separate types.

## Roles and Permissions

**Existing backend:** `SUPER_ADMIN=1, ADMIN=2, MANAGER=3` with `PermissionAttribute`

**Source implementation:** Permissions are documented in `integration-guide.md` for backend wiring. Frontend does not enforce permissions — backend must validate.

## Payment Link Honesty

**Backend reality:**
- Email: functional (SMTP), but no payment gateway exists for link generation
- WhatsApp: partial (Gupshup whitelist only, send is TODO)
- SMS: not functional
- Payment gateway: does not exist

**Source implementation:** `paymentService.ts` → `sendPaymentLinkMock()`
- **Never** returns `delivered: true`
- Returns clear status messages explaining what is and isn't available

## Tax Percentage Gap

**Issue:** No backend API exists to fetch the current tax percentage. The `Tax_Per` value is stored on payment records but its source is undefined.

**Source implementation:** `paymentConstants.ts` → `DEFAULT_TAX_PERCENTAGE = 0`
- Used only when fee configuration does not carry a rate
- Real rate must come from a backend API (documented in `api-contracts/tax-percentage.md`)

## Payment Method Storage Gap

**Issue:** No `PaymentMethod` column exists in receipt tables (`installments_received`, `payments_received`).

**Source implementation:** `PaymentReceipt` interface includes `paymentMethod` field. Backend schema update required (documented in `api-contracts/README.md`).
