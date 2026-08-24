<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nuru Energy — Agent Guidelines & Reference Index

This document guides AI agents working on the ** Nuru Energy** codebase. Always consult the referenced primary documents before writing or refactoring code.

---

## 1. Primary Documentation & Source of Truth

- **[CLAUDE.md](CLAUDE.md)**: The definitive engineering and business reference. Contains detailed architectural rules, tech stack decisions, module boundaries, UI conventions, RBAC matrix, and domain invariants.
- **[PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md)**: Complete Product Requirements Document (PRD). Source of truth for scope, functional requirements, Kenyan market specifics, and business workflows.
- **`node_modules/next/dist/docs/`**: Next.js 16 App Router & framework reference. Consult this for API changes (such as `proxy.ts` replacing `middleware.ts`, Server Functions, and caching behaviors).

---

## 2. Core Architectural Invariants

1. **Single-Store Model Only**:
   - Single Kenyan retailer selling solar and power equipment.
   - **Never** introduce multi-tenant, marketplace, vendor payout, or seller mechanics.
2. **Hard File Size Limit**:
   - **No `.ts` or `.tsx` file may exceed 700 lines.** Split large components into subcomponents, hooks, schemas, or utility files.
3. **Strict Color Theming**:
   - **Never use raw Tailwind colors** (e.g., `amber-500`, `sky-400`, `emerald-600`).
   - Use only custom semantic tokens from [`src/styles/theme.css`](src/styles/theme.css): `brand-*`, `neutral-*`, and status tones (`success-*`, `warning-*`, `danger-*`, `info-*` with shades 50, 200, 600, 700).
   - Enforced by `npm run lint` (`scripts/check-theme-colors.mjs`).
4. **Module Boundaries**:
   - Business modules reside in [`src/modules/`](src/modules/) (`catalog`, `inventory`, `orders`, `quotations`, `customers`, `cart`, `staff`, `users`).
   - Each module owns its database tables. Cross-module operations must go through the owning module's public functions, never direct database writes to foreign tables.
5. **Server-Side Authorization**:
   - Hidden UI controls are not security boundaries. Every Server Function and protected mutation must check permissions via `requirePermission(...)` from [`src/lib/permissions.ts`](src/lib/permissions.ts).
6. **Immutable Inventory & Order Snapshots**:
   - Every stock quantity change must write an immutable `InventoryMovement` row.
   - Order line items (`OrderItem`) store frozen copies of product name, SKU, and unit price at time of purchase.
   - Public storefront displays derived availability status (`getAvailabilityStatus`), never raw stock quantities.
7. **URL-Driven State**:
   - Filter, sort, and pagination state in storefront and admin lists must live in URL search parameters, not isolated React client state.

---

## 3. Technology Stack & Directory Conventions

- **Next.js 16 App Router**:
  - Storefront: [`src/app/(storefront)/`](src/app/(storefront)/)
  - Admin Dashboard: [`src/app/admin/`](src/app/admin/)
  - Proxy: [`src/proxy.ts`](src/proxy.ts) (Route proxy for `/admin/*`)
- **Database**: PostgreSQL with Prisma 7 (multi-file schema in [`prisma/schema/*.prisma`](prisma/schema/)). Client imported from `@/generated/prisma/client` via [`src/infrastructure/database/client.ts`](src/infrastructure/database/client.ts).
- **Storage**: S3-compatible RustFS object storage via [`src/infrastructure/storage/`](src/infrastructure/storage/).
- **UI Kit**: Reusable primitives in [`src/components/ui/`](src/components/ui/) (`Button`, `Input`, `Card`, `Badge`, `DataList`, `PriceDisplay`, `StockBadge`, `KpiCard`).

---

## 4. Key Commands

```bash
npm run dev                    # Start local development server
npm run lint                   # Run ESLint + theme color checker
npm run build                  # Production build check
npx prisma generate            # Regenerate Prisma Client to src/generated/prisma
npx prisma db seed             # Seed initial owner and baseline data
```
