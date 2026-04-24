# KitCo Frontend

Monorepo for the KitCo frontend surfaces — admin console (Next.js), consumer/kitchen mobile app (Expo), and the shared libraries they both depend on.

Backend lives at `../KitCo` (FastAPI, served on `http://localhost:8000`).

## Structure

```
KitCo-frontend/
├── packages/
│   ├── api-client/   # Axios + typed functions for every KitCo endpoint, WS helpers
│   └── shared/       # Order-status state machine, formatters, phone validation
├── apps/
│   ├── web/          # Next.js 14 admin console (not yet built)
│   └── mobile/       # Expo app (not yet built)
├── package.json          # workspace root
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

## Requirements

- Node.js ≥ 20
- pnpm ≥ 10
- The KitCo backend running on `http://localhost:8000` for live development

## Getting started

```bash
pnpm install
pnpm build       # builds all packages via Turborepo
pnpm typecheck
```

## Packages

### `@kitco/api-client`

Thin Axios wrapper plus typed functions grouped by domain (`auth`, `menus`, `customers`, `orders`, `broadcasts`, `public`). Designed to be consumed by both Next.js and React Native — JWT storage is abstracted behind a `TokenStorage` adapter the host app provides (e.g. `localStorage` on web, `expo-secure-store` on mobile).

Also exposes `createKitchenSocket(kitchenId)` and `createOrderSocket(orderId)` helpers for the backend's `/ws/kitchen/{id}` and `/ws/order/{id}` endpoints.

### `@kitco/shared`

- `orderStatus` — state machine for the order lifecycle (valid transitions, labels, colors)
- `format` — GBP currency + date-fns formatters
- `phone` — `libphonenumber-js`-backed validation / formatting (defaults to GB)

## Conventions

- TypeScript strict mode everywhere
- ESM output (`"type": "module"`)
- Each package builds with `tsc` to `dist/`
- Shared tsconfig base at the root (`tsconfig.base.json`)

## Next steps

1. Scaffold `apps/web` (Next.js 14, App Router) consuming `@kitco/api-client` + `@kitco/shared`
2. Scaffold `apps/mobile` (Expo) wiring `expo-secure-store` into the `TokenStorage` adapter
