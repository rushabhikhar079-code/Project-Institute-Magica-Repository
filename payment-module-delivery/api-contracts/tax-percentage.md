# Tax Percentage Gap

## Problem

The payment tables (`payment`, `payment_installments`) have a `Tax_Per` column,
but no existing API exposes the tax rate that should be applied to a given
fee configuration.

The course/subject configuration tables store `Taxable` (boolean) and
`IncludingTax` (boolean) flags, but **not** the actual percentage rate.

## Current Frontend Handling

`DEFAULT_TAX_PERCENTAGE = 0` in `paymentConstants.ts`.

All tax calculations use this default when no rate is provided. This means:
- If `taxable=true` and `taxPercentage=0`, tax amount = 0
- The net amount equals basic minus discount

The `createTaxConfig()` helper accepts a `taxPercentage` parameter, so
when the rate becomes available from the backend, only the data source
needs to change — the calculation logic remains the same.

## Where Tax Rate Should Come From

Three possible approaches (any one is sufficient):

### Option A: Add to course/subject/other-fee API responses

Add a `taxPercentage` field to the existing course, subject, and other-fee
DTOs. This is the most direct approach since the fee configuration already
carries the `Taxable` and `IncludingTax` flags.

### Option B: HSN-based tax rate endpoint

Create `GET /Common/tax-rate?hsnCode={code}` that returns the applicable
GST rate for a given HSN code. The frontend already captures `hsncode`
in `SubjectFeeInfo` and `CourseFeeInfo`.

### Option C: Branch-level config

The existing `IsCalculationRoundOff` flag is a branch-level config.
A similar `DefaultTaxPercentage` could be stored at the branch level
and used when no specific rate applies.

## Recommendation

Option A is simplest and most consistent with the existing data model.
The tax rate travels with the fee configuration and is captured at
schedule creation time, matching the existing `Tax_Per` column on the
`payment` table.
