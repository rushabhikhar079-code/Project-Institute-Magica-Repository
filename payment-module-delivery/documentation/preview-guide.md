# Preview Guide

The preview environment is a standalone Vite application that renders the actual Payment Module source files in an Institute Magica-style application shell.

---

## Location

```
payment-module-delivery/preview/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── PreviewApp.tsx
    ├── preview-styles.ts
    └── preview-shell.scss
```

---

## What It Renders

The preview imports the actual delivery source files from `../frontend/src/features/payment/` — it is NOT a second implementation. All pages, dialogs, components, and the common SCSS are the same files intended for developer handover.

### Pages accessible from the sidebar:
1. **Manage Payments** — schedule list with summary cards, search, table actions
2. **Create Schedule** — single-page two-column form
3. **Schedule Overview** — schedule detail with installments and receipts
4. **Edit Installments** — full inline table editing
5. **Payment Recording** — payment collection form
6. **Payment History** — receipt history with filters

### Dialogs accessible from the sidebar:
- Edit Schedule Dialog (Screen 10)
- Send Payment Link Dialog (Screen 11)
- Modify Receipt Dialog (Screen 12)
- Edit Installment Dialog
- Student Search Dialog (Screen 8)

### Additional XD elements:
- Subject Selection Alert (Screen 8) — shown at top of Manage Payments page

---

## How to Run

```bash
cd payment-module-delivery/preview
npm install
npm run dev
```

The server runs on port 5174. Open `http://localhost:5174` in a browser.

---

## How It Works

### Import resolution

The delivery source files have two imports that reference the existing project:
1. `paymentService.ts` imports `api` from `../../../services/api`
2. `paymentColumns.tsx` imports `TableColumn` from `../../../../components/common/DataTable`

The preview provides stub files at these exact relative paths:
- `payment-module-delivery/frontend/services/api.ts` — no-op axios stub
- `payment-module-delivery/components/common/DataTable/types.ts` — type stub

These stubs are ONLY for the preview. When integrating into the real project, these imports resolve to the actual project files.

### Styles

The preview imports `payment-module-delivery/frontend/styles/payment-common.scss` directly. All `pm-` prefixed classes from the delivery stylesheet are applied.

### Mock data

The preview uses the in-memory mock data from `paymentMockData.ts`. All data resets on page reload. No backend connection is made.

### Vite config

`vite.config.ts` aliases `lucide-react` to the preview's `node_modules` so icon imports resolve from source files outside the preview directory.

---

## Preview vs Production

| Aspect | Preview | Production |
|---|---|---|
| Source files | Same delivery files | Same files copied into `im-frontend/src/features/payment/` |
| API stubs | No-op stubs | Real `services/api` axios instance |
| TableColumn type | Stub type | Real `DataTable/types.ts` |
| Data | In-memory mock | Backend APIs |
| Stylesheet | `payment-common.scss` (imported directly) | Same file, imported via project build |
| Routing | Simple state-based navigation | React Router with `ProtectedRoute` |

---

## Important Notes

- The preview is clearly labeled as "VISUAL PREVIEW — NOT PRODUCTION" in the top bar
- A yellow banner reminds users that data is in-memory mock
- No real API calls are made — the axios stub throws if invoked
- The `sendPaymentLinkMock()` function never claims delivery success (honest mock behavior)
- The preview build has been verified to compile successfully (1629 modules transformed)
