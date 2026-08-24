@AGENTS.md

# Nuru Energy — Engineering & Business Reference

This file is the working reference for building this project. The full Product Design
Requirements Document lives at [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) — treat it as the source of truth for
detail; this file distills it into rules an agent must follow while writing code.

---

## 1. What this is

A **single-store** e-commerce platform (not a marketplace) for one Kenyan retailer
selling solar panels, batteries, inverters, generators, water pumps, power equipment,
machinery and spare parts, plus installation/support services.

Two interfaces, one Next.js codebase:

- **Public storefront** — customers browse, search, compare, request quotations, and
  check out as guests or registered customers.
- **Admin dashboard** — the owner and staff manage products, inventory, orders,
  quotations, customers, content and settings, primarily **from a phone**.

There is exactly one business, one catalogue, one inventory operation. Never introduce
seller accounts, vendor payouts, tenant IDs, marketplace commissions, or multi-store
concepts — these are explicitly out of scope (see §11).

---

## 2. Non-negotiable product principles

1. **Single-store simplicity** — no vendor/tenant/seller modeling anywhere, ever.
2. **Non-technical owner** — admin UI must never leak DB ids, JSON, schema, cache
   settings, infra status, or raw HTML to the owner. Every admin action should be a
   short, guided flow.
3. **Mobile-first, always** — assume the owner is running the dashboard from a
   smartphone. Every list, form and action must work without horizontal scrolling and
   without hover-only interactions. Design mobile layout first, then scale up.
4. **SEO-first** — SEO is architecture, not an afterthought. Every public entity
   (product, category, brand, solution, article) carries slug + SEO metadata from
   creation, auto-generated but owner-overridable.
5. **Secure by default** — every protected action is authorized **on the server**.
   A hidden button is never a security control.
6. **Modular monolith** — one Next.js app, one repo, clear module boundaries (§6).
   No microservices, no speculative multi-tenant abstractions.

---

## 3. Roles & permissions (enforce server-side, always)

| Role | Can | Cannot |
|---|---|---|
| Customer | browse, search, cart, guest checkout, quotation requests, order tracking | — |
| Owner | everything | — |
| Administrator | most operational actions | delete owner, change ownership, edit critical payment credentials, irreversible actions |
| Sales employee | orders, quotations, customer contact, manual payment recording | user admin, payment settings, security config, permanent deletes |
| Inventory employee | stock receive/adjust/damage, availability | prices, payment settings, user mgmt, financial reports |
| Content employee | products, images, categories, brands, articles, banners, SEO content | inventory, refunds, payment settings, staff mgmt |

Rule of thumb: **every mutation checks role/permission server-side before touching
data**, regardless of what the client UI shows or hides.

---

## 4. Domain rules that must never be violated

- **Order snapshots**: order items store a frozen copy of product name/price at time
  of purchase. Later product edits must never change historical order data.
- **Inventory movements**: every stock change (sale, receipt, damage, adjustment,
  reservation, release, return, cancellation) is written as an immutable
  `InventoryMovement` row with previous qty, new qty, reason and actor. Stock
  quantity is a derived/audited number, never silently overwritten.
- **Stock reservations**: reserved quantity is excluded from customer-visible
  availability. Reservations are released on cancellation, payment expiry, timeout,
  or manual admin action — never left dangling.
- **Payment idempotency**: payment provider callbacks must be authenticated,
  validated and idempotent. A repeated callback must never create a duplicate
  payment or a duplicate order. Verify amount and order reference on every callback.
- **Payment abstraction**: checkout/order code depends on an internal payment
  interface, never directly on a specific provider SDK (M-Pesa, bank transfer,
  manual). Swapping/adding a provider must not require touching checkout or order
  logic.
- **Quotation → order conversion**: quotations convert into orders through the order
  module's API — the quotation module never writes order rows directly.
- **Audit log is append-only**: price changes, stock changes, cancellations,
  refunds, payment-setting changes, permission changes and content deletion are
  logged with actor, before/after values and timestamp. Never editable via the
  standard admin UI.
- **Draft ≠ published**: a product/article/page is never publicly reachable until
  explicitly published. Draft and preview routes must be excluded from indexing.
- **Specifications are structured data**, not free text — driven by
  category-specific specification templates (solar panel fields differ from
  generator fields, etc.). Never conflate technical specs with description text.
- **Availability, not exact stock, is public** by default — don't expose raw stock
  counts to customers unless the owner explicitly enables it.

---

## 5. Reusable components — house style

The team default is **reuse over duplication**. Before writing a new component,
check `components/` and the relevant module's local components folder for something
close enough to extend.

- Build shared, prop-driven UI primitives (buttons, cards, form fields, modals,
  data tables → mobile card transforms, status badges, price displays,
  quantity steppers, image galleries) once in `components/`, then compose them
  everywhere — storefront and admin should draw from the same primitives where the
  visual language overlaps.
- Prefer **composition over configuration bloat**: a component with 15 boolean
  props is a sign it should be split or composed from smaller pieces, not a sign it
  needs a 16th prop.
- Domain-specific but cross-cutting UI (e.g. an order status pill, a stock badge,
  a spec table renderer) belongs in a shared location, not copy-pasted into every
  module that needs it.
- Server-side logic follows the same instinct: shared validation (Zod schemas),
  shared query helpers, and shared formatting/utility functions belong in `lib/`,
  not re-implemented per module.
- Module-local components (things that only ever make sense inside one module,
  e.g. a quotation line-item editor) live beside that module, not in the global
  `components/` folder — only promote something to global once a second module
  actually needs it.

## 5.1 File size limit — hard rule

**No `.ts` or `.tsx` file may exceed 700 lines.** This is a hard ceiling, not a
target to approach.

When a file is trending toward the limit:

- Split a large component into a container + smaller presentational subcomponents
  (colocate them in a `_components/` folder next to the page/component, or promote
  to `components/` if reusable elsewhere per §5).
- Extract data-fetching, mutations and business logic into hooks (`useX`) or plain
  functions in `lib/` / the owning module, out of the component file.
- Extract large `switch`/status-mapping tables, long form-field definitions, and
  large constant/config objects into their own file.
- Split large Zod schemas or type definitions out of the component file into a
  `schema.ts` / `types.ts` beside it.
- A large admin page (e.g. the product form from §14.2, which has 7 sections) is a
  strong candidate to become one container file that composes one file per section
  (`BasicInfoSection.tsx`, `PricingSection.tsx`, `InventorySection.tsx`,
  `ImagesSection.tsx`, `SpecificationsSection.tsx`, `DeliverySection.tsx`,
  `SeoSection.tsx`, `PublishingSection.tsx`), never one 1500-line form file.

Check line count before considering a file done; if it's approaching 700, split it
as part of the same change rather than leaving it for later cleanup.

---

## 6. Code organization

```text
src/
├── app/
│   ├── (storefront)/        # public routes: /, /shop, /products/[slug], /categories/[slug],
│   │                         # /brands/[slug], /solutions/[slug], /guides/[slug], /search,
│   │                         # /cart, /checkout, /request-quotation, /contact, /about
│   ├── admin/                # administration dashboard routes
│   ├── api/                  # route handlers (webhooks, integrations)
│   └── auth/                 # admin/customer auth routes
├── modules/
│   ├── catalog/               # products
│   ├── categories/
│   ├── brands/
│   ├── inventory/
│   ├── orders/
│   ├── quotations/
│   ├── customers/
│   ├── payments/
│   ├── content/                # banners, pages, policies, knowledge-centre articles
│   ├── seo/
│   ├── notifications/
│   ├── reports/
│   └── users/                  # staff, roles, permissions
├── components/                 # shared, reusable UI primitives (see §5)
├── infrastructure/
│   ├── database/
│   ├── storage/                 # object storage for images/documents
│   ├── email/
│   ├── payments/                 # provider adapters behind the internal interface
│   ├── jobs/                     # background processing
│   └── monitoring/
├── lib/                          # shared validation, formatting, query helpers
├── styles/
└── types/
```

Each module owns its business rules and is the only thing allowed to write to its
own tables. Cross-module interaction happens through the owning module's exported
functions/API, never by another module reaching directly into its data. Concretely
(see §4 too):

- `orders` never overwrites stock directly — it asks `inventory` to reserve/release.
- `payments` records payments and notifies `orders` — it does not mutate orders.
- `quotations` converts an accepted quote into an order via `orders`, not by
  inserting order rows itself.
- `content` never touches order records.
- The storefront (`app/(storefront)`) calls into modules through server-side
  interfaces (server functions/route handlers) — it doesn't reach into
  `infrastructure/database` directly.

---

## 7. This Next.js version is not the one you trained on

Per [AGENTS.md](AGENTS.md), read `node_modules/next/dist/docs/` before writing
framework-adjacent code. Confirmed differences already checked in this codebase:

- **`middleware.ts` is now `proxy.ts`** (Next.js 16 renamed Middleware to Proxy;
  same functionality, new file convention and export name `proxy`). Do not create
  a `middleware.ts` file.
- Mutations use **Server Functions** (`'use server'`) — a Server Action is a Server
  Function used for form/mutation handling. Every Server Function must independently
  verify auth/authorization inside itself — it is reachable via direct POST, not
  only through the UI that calls it. This lines up directly with §3/§4: never trust
  that a hidden UI element implies a protected action is safe.
- Route groups (`(storefront)`) and private folders (`_components`, `_lib`) work as
  in current App Router docs — used deliberately in the structure above.

If something in the framework behaves unexpectedly, check the docs folder before
assuming prior Next.js knowledge applies.

---

## 8. Tech stack

- Next.js (App Router) + React + TypeScript
- PostgreSQL + Prisma ORM
- Zod (or equivalent) for schema validation — server-side always, client-side only
  for UX
- Tailwind CSS
- Object storage for images/documents (not binary blobs in Postgres — DB stores
  metadata/references only, with WebP/AVIF delivery, thumbnails, alt text, safe
  filenames, size/type limits)
- Background job mechanism for: email, quotation/invoice PDF generation, image
  resizing, sitemap updates, search-index updates, low-stock notifications, payment
  reconciliation retries, expired-cart/quotation cleanup
- Redis only where actually justified (don't reach for it by default)

---

## 9. Security checklist (apply per feature, not just once)

- Password hashing, HTTP-only + secure cookies, SameSite, session expiry/revocation,
  rate-limited login, expiring password-reset tokens.
- RBAC checked server-side on every protected mutation (§3).
- All input validated server-side — product forms, checkout, payments, uploads,
  stock movements, quotations, order updates, search params, content.
- Uploads: allow-listed types, size limits, generated-safe filenames, stored outside
  the app's executable path, metadata stripped where appropriate.
- Audit log for price/stock/cancellation/refund/payment-setting/permission/content
  changes (§4).
- No plaintext secrets in logs — never log passwords, full payment credentials, or
  auth tokens.
- Payment callbacks: authenticated, validated, idempotent, protected against replay
  and amount/reference mismatch (§4).

---

## 10. SEO checklist (build in, don't bolt on)

- Human-readable, stable, lowercase, hyphenated URLs (`/products/[slug]`,
  `/categories/[slug]`, `/brands/[slug]`, `/solutions/[slug]`, `/guides/[slug]`).
- Auto-generate SEO title/meta description on create (e.g. "{Product Name} Price in
  Kenya"), owner can override; SEO fields are never required to save a draft.
- Structured data (Organization, LocalBusiness, Product, Offer, BreadcrumbList,
  Article, FAQPage, ItemList, etc.) must reflect real, visible page content — never
  fabricate ratings, reviews or pricing.
- Sitemaps regenerate when public content changes.
- Canonical URLs on filtered/paginated/multi-category-accessible pages.
- Redirect old → new slug automatically on slug change; prevent redirect loops.
- `robots`/indexing exclusion for admin, checkout, cart, account, preview, draft,
  and internal API routes.

---

## 11. Scope guardrails

**In scope for v1** (build these): product/category/brand/image management,
specification templates, search & filtering, product detail pages, cart, guest
checkout, quotation request + management + PDF, order management, basic payment
methods (M-Pesa, bank transfer, cash/collection), inventory movements & stock
reservations, customer records, homepage/content management, knowledge-centre
articles, automated SEO metadata, structured data, sitemaps, redirects, admin auth,
RBAC, audit logs, email notifications, backups, error monitoring.

**Deferred — do not build unless explicitly asked**: native mobile apps, marketplace
sellers/vendor onboarding/payouts, multi-tenant or multi-store support, financing,
rentals, installer marketplace, AI assistant, advanced comparison engine, loyalty
programme, multiple warehouses, full accounting, supplier procurement, courier
integrations, multi-currency, multilingual content, subscriptions.

**Never build, period**: multi-vendor marketplace mechanics, SaaS-for-other-merchants
scaffolding, full ERP, general accounting, seller subscriptions, complex WMS. If a
request seems to drift toward these, flag it rather than silently implementing it.

If in doubt about whether something is in scope, check [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) §30–§32
before building it.

---

## 12. Implementation conventions

The foundation phase (schema, staff auth/RBAC, UI kit, app shell) is built. These
are the established patterns every module built after it should follow.

**Layout matches this doc**: the app now actually lives under `src/` (`src/app`,
`src/components`, `src/modules`, `src/infrastructure`, `src/lib`, `src/styles`,
`src/types`), matching §6 exactly — `@/*` resolves to `./src/*`.

**Prisma 7, multi-file schema**: `prisma/schema/*.prisma`, one file per module
(`users.prisma`, `catalog.prisma`, `inventory.prisma`, `orders.prisma`, etc. — no
preview flag needed, Prisma 7 supports a schema folder natively). Add new models to
the file for the module that owns them, not to a shared catch-all file. The
generator is `prisma-client` (Prisma 7's TS-native client, not the old
`prisma-client-js`), output to `src/generated/prisma` (gitignored, regenerated via
`npx prisma generate`). **Import from `@/generated/prisma/client`, not the bare
`@/generated/prisma` directory** — there's no index file, so the bare path doesn't
resolve. Prisma 7 requires an explicit driver adapter — `db` in
`src/infrastructure/database/client.ts` is constructed with
`new PrismaPg({ connectionString: env.DATABASE_URL })`; any other place a
`PrismaClient` is constructed (only the seed script, currently) needs the same
adapter wired up.

**RBAC**: `StaffRole` is a fixed 5-value Prisma enum (Owner, Administrator, Sales,
Inventory, Content), not DB `Role`/`Permission` tables — see §2 decision. The
permission set lives in `src/lib/permissions.ts` (`PERMISSIONS`, `ROLE_PERMISSIONS`).
To add a new capability: add one string to `PERMISSIONS`, add it to whichever
roles' sets should have it, then gate the action with
`await requirePermission("the.permission")` (throws `ForbiddenError` /
`UnauthorizedError` — the caller decides how to present that). Row-level exceptions
the matrix can't express (e.g. "Administrator can manage staff but can never delete
the Owner") are enforced in the module itself, not in the matrix.

**Staff auth**: cookie-based sessions, hashed-token pattern, in `src/lib/auth/`.
`createSession`/`invalidateCurrentSession` only work inside a Server Function or
Route Handler (cookie writes aren't allowed during rendering — this is a Next.js
constraint, not a choice). `getCurrentStaffSession()` is cache()-wrapped so a
layout and its page can both call it in one request without a duplicate query.
`src/proxy.ts` only does a fast cookie-presence redirect for `/admin/*` —
it is **not** the authorization boundary. Every protected admin page/Server
Function must call `requireStaffSession()` or `requirePermission()` itself.

**Route structure for protected admin pages**: the login page
(`src/app/admin/login/page.tsx`) sits outside the protected layout; everything else
under `/admin` lives inside the `src/app/admin/(dashboard)/` route group, whose
`layout.tsx` calls `getCurrentStaffSession()` and redirects to `/admin/login` if
there's no session. Route groups don't add a URL segment, so this doesn't change any
paths — it just keeps the login page from being wrapped by the layout that would
otherwise redirect it to itself.

**Bootstrapping the first Owner**: there's no signup flow. `npx prisma db seed`
(wired via `prisma.config.ts` → `migrations.seed`) runs `prisma/seed.ts`, which
creates one `OWNER` `AdminUser` from `OWNER_EMAIL`/`OWNER_PASSWORD` env vars. It's a
no-op if that email already has an account.

**Env vars**: `.env.example` is the committed template. Real values go in the
untracked `.env` (already gitignored) — never paste a real connection string or
credential into chat. The running app validates env vars once at import time via
`src/lib/env.ts` (Zod), so a missing/invalid var fails fast at boot rather than
deep inside a request.

**UI kit**: `src/components/ui/` — `Button` (+ exported `buttonVariants`, for
reusing button styling on a `Link` without misusing `<button>` for navigation),
`Input` (optional leading `icon`), `PasswordInput` (show/hide toggle, built on
`Input`), `Textarea`, `Select`, `Checkbox`, `Card` (+ `CardHeader`/`CardTitle`/
`CardDescription`/`CardContent`/`CardFooter`), `Badge` (the shared tone palette —
`neutral`/`brand`/`success`/`warning`/`danger`/`info` — every status badge across
every module should map onto these, not invent new colors), `Dialog` (native
`<dialog>`-based, opened/closed imperatively via a ref), `EmptyState`, `Spinner`,
`KpiCardsGrid`/`KpiStats` (the dashboard's KPI row — reuse for Reports rather than
building a second stat-tile component), and `DataList` (renders a real `<table>` on
desktop and stacked cards on mobile per §19.3 — put any needed link inside a
column's own `render`, not as a row-level href, to keep the component about layout
rather than routing). All built with `class-variance-authority` + the `cn()` helper
in `src/lib/cn.ts` (clsx + tailwind-merge). Extend these before writing a new
one-off component — see §5.

**Colors: theme tokens only, never a raw Tailwind color name.** This has caused
real bugs three times — code that reached for `amber-500`, `emerald-600`, `sky-400`,
`purple-500`, etc. directly instead of this project's tokens, producing
inconsistent one-off palettes per file and at least one silently-broken class
(`dark:hover:bg-danger-950` — that shade was never defined, so the rule simply
never applied). The only color classes allowed in `className` are this project's
own tokens from `styles/theme.css`: `brand-*` (50–950, full range), `neutral-*`
(0–950, full range), and `success-*`/`warning-*`/`danger-*`/`info-*` (only 50, 200,
600, 700 are defined for these four — don't invent a 400 or 950 shade; for text on
a dark/tinted background use `-200`, matching `Badge`'s own dark-mode pattern), plus
the semantic `background`/`foreground`/`surface`/`surface-muted`/`border`/`ring`
aliases. If a design calls for a color outside this set, add it to `styles/theme.css`
first (see §5.1's theme-file header comment) — don't reach for a stock Tailwind hue
as a shortcut.

Documentation alone didn't stop this recurring, so `npm run lint` now also runs
`scripts/check-theme-colors.mjs`, which fails the build if any raw Tailwind color
utility (`amber-500`, `sky-400`, etc.) shows up anywhere in `src/`. If this check
ever fails, fix the offending class — don't loosen or remove the script.

**No fabricated data or unverified claims.** Don't hardcode a status indicator that
can't reflect reality (e.g. an always-on "Live"/"Online" badge with nothing behind
it), and don't name real third-party companies/brands as "official partners" or
similar unless that relationship is backed by real data in the system (e.g. an
actual `Brand` row). If there's nothing real to show yet, render nothing (return
`null`) rather than a placeholder that reads as a genuine claim — this is the same
principle as §10's "don't generate fake ratings, fake reviews, or unavailable
pricing," just applied beyond SEO structured data.

**Object storage (RustFS)**: local dev runs it via `docker compose up -d rustfs`
(`docker-compose.yml`), S3-compatible, accessed through `@aws-sdk/client-s3` in
`src/infrastructure/storage/` — `client.ts` (the S3 client + idempotent
bucket-exists-or-create) and `upload.ts` (`uploadImage`/`deleteImage`, with the
file-type/size validation from CLAUDE.md §9). `POST /api/uploads` is the one route
handler every admin image upload goes through — it takes a `folder` field
(`products`/`categories`/`brands`) and checks the matching permission itself,
so it isn't duplicated per entity. `ProductImage.key` (the RustFS object key) is
stored alongside `url` specifically so deletes can target the exact object
instead of re-deriving it by parsing the URL.

**`KpiCard` vs `KpiCardsGrid`** (`src/components/ui/kpi-card.tsx`): `KpiCard` is
the reusable single-tile primitive — compose your own grid from it for a
different stat set (e.g. the Products list's Total/Draft/Active/Out-of-stock
row). `KpiCardsGrid` is only the dashboard's specific 6-stat arrangement built
from it. Don't build a second stat-tile component the way `kpi-cards.tsx`
originally duplicated the (now-removed) `StatTile` — extend `KpiCard` instead.

**Admin CRUD forms are dedicated pages, not modals** — `/admin/<entity>/new` and
`/admin/<entity>/[id]/edit`, both rendering one shared `<Entity>Form` client
component (`useActionState`, one `Card` per logical section) so create and edit
don't duplicate markup. `Dialog` is reserved for what it's already built for:
lightweight confirmations — see `DeleteRowButton`
(`src/app/admin/(dashboard)/_components/delete-row-button.tsx`), the one
delete-with-confirmation control every admin list page uses rather than
rebuilding the confirm-then-call flow per entity.

**Slugs**: `src/lib/slug.ts`'s `generateUniqueSlug(nameOrSlug, isTaken)` is shared
by every slugged entity (Category, Brand, Product, and later Article) — pass a
DB-backed `isTaken` callback that excludes the current record's own id when
editing, don't reimplement the suffix-on-collision logic per module.

**Specification templates live on the category edit page**, not a separate nav
item — a template belongs to exactly one category
(`src/app/admin/(dashboard)/categories/_components/spec-template-section.tsx`).
The Product form's Specifications section reads the selected category's
template and renders one input per field; no template yet shows a prompt
linking there instead of an empty form.

**Every stock change is still an `InventoryMovement`**, even the catalog
module's lightweight initial-stock form on the product edit page
(`updateProductInventory` in `src/modules/catalog/products/actions.ts`) — this
isn't the dedicated Inventory module (receiving, reservations, damage) that
comes later, but the audit-trail invariant from §4 applies from day one
regardless of which module is writing the change.

**Public catalog reads go through `src/modules/catalog/queries.ts`, never an
inline `db.product.findMany(...)` in a storefront page.** Admin pages query
the database directly because the owner needs to see every status, including
drafts. The storefront must never do that — every function in `queries.ts`
(`getPublishedProducts`, `getProductBySlug`, `getActiveCategories`,
`getCategoryBySlug`, `getActiveBrands`, `getBrandBySlug`, and the
slug-only `get*Slugs` variants for `sitemap.ts`) hard-codes the
`status: "ACTIVE"` / `isActive: true` filter, so a draft, hidden, archived, or
deactivated row can never leak onto a public page — a missing/non-active
slug resolves to `null`, which the calling page turns into `notFound()`.
Adding a new public catalog query means adding a function here with the same
guard, not querying `db` directly from `app/(storefront)`.

**Availability, not raw stock, is public** (§4) is enforced by one function:
`getAvailabilityStatus()` in `src/lib/inventory-status.ts` derives
`IN_STOCK`/`LOW_STOCK`/`OUT_OF_STOCK`/`AVAILABLE_ON_REQUEST` from
`quantityOnHand`/`reservedQuantity`/`lowStockThreshold`/`allowBackorder` —
nothing in `app/(storefront)` should read those raw `InventoryItem` fields
itself. `StockBadge` (`src/components/ui/stock-badge.tsx`) renders the result
as a `Badge`.

**`PriceDisplay` and `StockBadge`** (`src/components/ui/`) are the second
consumer proving the §5 "promote to `components/ui` once a second module
needs it" rule in practice: both were built for the storefront product grid
and detail page, but live in the shared UI kit (not `app/(storefront)/`)
because the admin product list/edit pages are an equally valid future
consumer of the same price-formatting and stock-status logic.

**The storefront product grid is one component, reused by four routes**:
`/shop`, `/categories/[slug]`, `/brands/[slug]`, and `/search` all render
`ProductGrid` + `ProductFilters` + `Pagination`
(`src/app/(storefront)/_components/`) — only the pre-applied filter (fixed
category, fixed brand, search term, or none) and the page's own banner/SEO
metadata differ per route. Don't fork the grid or filter markup per route;
add a new filter dimension to `ProductListFilters`
(`src/modules/catalog/queries.ts`) and `ProductFilters` instead.

**Filter/sort/page state lives in the URL, never client React state** — every
filter control in `ProductFilters` and `Pagination` is a `<Link>` or a native
GET `<form>`, so `/shop?category=...&sort=...&page=...` is always the single
source of truth (shareable, bookmarkable, crawlable per §10). If a new filter
is added, thread it through the URL the same way rather than reaching for
`useState`.
