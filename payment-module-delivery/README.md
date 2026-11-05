# Payment Module — Institute Magica

Complete frontend Payment Module source code for the Institute Magica application, covering all 12 Adobe XD screens/states with a working visual preview environment.

---

## What This Package Contains

- **36 source files** (6 pages, 5 dialogs, 10 components, 7 foundational files, 1 stylesheet, 7 documentation files)
- **Visual preview environment** that renders the actual delivery source files
- **Complete developer documentation** with XD mapping, business logic mapping, API contracts, and integration guide

---

## Directory Structure

```
payment-module-delivery/
├── README.md                          ← This file
├── file-list.md                       ← Complete file inventory
├── frontend/
│   ├── styles/
│   │   └── payment-common.scss        ← Common stylesheet (pm- prefix)
│   ├── services/
│   │   └── api.ts                     ← Preview stub (not for production)
│   └── src/features/payment/
│       ├── paymentTypes.ts            ← TypeScript interfaces
│       ├── paymentConstants.ts        ← Constants (types, methods, routes)
│       ├── paymentCalculations.ts     ← Business logic (net, tax, rounding, distribution)
│       ├── paymentMockData.ts         ← In-memory mock data
│       ├── paymentService.ts          ← Dual-layer service (real API + mock)
│       ├── paymentColumns.tsx         ← Table column definitions
│       ├── validations/
│       │   └── paymentSchema.ts       ← Zod validation schemas
│       ├── components/                ← 10 reusable components
│       ├── dialogs/                   ← 5 dialog components
│       └── pages/                     ← 6 page components
├── components/
│   └── common/DataTable/              ← Preview stub for TableColumn type
├── preview/                           ← Standalone visual preview app
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── PreviewApp.tsx
│       └── preview-shell.scss
├── documentation/                     ← Developer documentation
│   ├── xd-screen-source-mapping.md    ← All 12 XD screens mapped to source
│   ├── business-logic-mapping.md      ← Business logic rules and implementations
│   ├── developer-integration-guide.md ← How to integrate into im-frontend
│   └── preview-guide.md               ← How to run the visual preview
├── docs/                              ← Original docs (same content, older paths)
├── api-contracts/                     ← API documentation
│   ├── README.md                      ← API contracts (existing vs proposed)
│   └── tax-percentage.md              ← Tax percentage gap analysis
└── integration-guide.md               ← Original integration guide
```

---

## Key Design Decisions

1. **Three payment types only:** Lump Sum, Adhoc, Installment (Custom)
2. **Net formula preserved:** `(Basic_Amt - Disc_Amt) + Tax_Amt`
3. **Two-decimal rounding:** `round2()` matches `Math.Round(AwayFromZero, 2)`
4. **Last-installment remainder absorption:** Equal distribution ensures exact reconciliation
5. **Adhoc auto-continuation:** Partial collection auto-creates next Adhoc installment
6. **Honest mock behavior:** Payment link never claims delivery success
7. **No Supabase, no second data layer:** In-memory mock for writes, existing APIs for reads
8. **Single-page Create Schedule:** Two-column XD layout, no wizard/stepper
9. **All classes use `pm-` prefix:** No collision with existing project styles

---

## Quick Start

### Run the visual preview
```bash
cd payment-module-delivery/preview
npm install
npm run dev
```
Open `http://localhost:5174` — all 6 pages and 5 dialogs are accessible from the sidebar.

### Integrate into the real project
See `documentation/developer-integration-guide.md` for step-by-step instructions.

---

## Documentation Index

| Document | Purpose |
|---|---|
| `documentation/xd-screen-source-mapping.md` | Maps all 12 XD screens to exact source files |
| `documentation/business-logic-mapping.md` | Maps business rules to backend formulas and source |
| `documentation/developer-integration-guide.md` | How to integrate into im-frontend |
| `documentation/preview-guide.md` | How to run and understand the visual preview |
| `api-contracts/README.md` | API contracts (existing vs proposed endpoints) |
| `api-contracts/tax-percentage.md` | Tax percentage gap analysis |
| `file-list.md` | Complete file inventory |

---

## Missing Backend Dependencies

- Payment CRUD APIs (create/update/cancel schedules, record payments, update receipts)
- Tax percentage source API (`Tax_Per` has no defined source)
- Payment method storage (no column in receipt tables)
- Payment gateway (does not exist — payment links cannot be generated)
- WhatsApp send (Gupshup send API is a TODO)
- SMS service (not functional)

---

## Confirmation

- No existing project files (`im-frontend/`, `im-backend/`) were modified
- No formal build or tests were run (source-generation phase only)
- The preview build has been verified to compile successfully
