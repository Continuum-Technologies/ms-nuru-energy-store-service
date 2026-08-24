# Implementation Plan - Modernize Storefront Cart (/cart)

Upgrade the Nuru Energy storefront cart page (`/cart`) with a modern, high-converting layout featuring a checkout progress bar, rich item cards, trust badges, and delivery threshold indicators.

## Proposed Changes

### Storefront Cart Component

#### [MODIFY] [cart-line-item.tsx](file:///home/shamir/Desktop/Zaam/ms-nuru-energy-store-service/src/app/(storefront)/cart/_components/cart-line-item.tsx)
- Add SKU display, image preview, and stock availability status (`In Stock` / `Backorder Available`).
- Add unit price vs line total breakdown.
- Enhance interactive buttons (quantity stepper, remove action) with sleek loading states and error handling.
- Ensure strict adherence to semantic design tokens (`bg-surface-elevated`, `border-border`, `text-foreground`).

#### [MODIFY] [page.tsx](file:///home/shamir/Desktop/Zaam/ms-nuru-energy-store-service/src/app/(storefront)/cart/page.tsx)
- Add Checkout Progress Stepper (`1. Shopping Cart` → `2. Checkout` → `3. Order Complete`).
- Add Free Nairobi Delivery Progress Bar (for orders over Ksh 100,000).
- Modernize Order Summary sidebar with primary checkout CTA (`Proceed to Checkout — Ksh X →`) and secondary quotation CTA.
- Add equipment warranty & nationwide dispatch trust badges.
- Upgrade empty cart state with quick-access category buttons (`Solar Panels`, `Inverters`, `Batteries`, `Generators`).

## Verification Plan

### Automated Build Verification
- Run `npm run build` to verify Next.js page generation and TypeScript type safety.
- Run `npm run lint` to verify ESLint & zero raw Tailwind color violations.
