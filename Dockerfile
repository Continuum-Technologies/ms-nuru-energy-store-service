# syntax=docker/dockerfile:1
#
# Multi-stage production build for the Nuru Energy Store Next.js app.
#
# Why this is small: Prisma 7's `prisma-client` generator (see
# prisma/schema/schema.prisma) is pure TypeScript — there's no Rust query
# engine binary to package or match to an architecture, since
# `@prisma/adapter-pg` talks to Postgres directly over `pg`. The only native
# addons left are `@node-rs/argon2` (password hashing) and `sharp` (Next's
# image optimizer), and both ship prebuilt musl binaries, so Alpine works
# without extra glibc shims beyond the standard `libc6-compat` package.
#
# Build:  docker build -t nuru-energy-store .
# Run:    docker run -p 3000:3000 --env-file .env nuru-energy-store
#         (real DATABASE_URL / RUSTFS_* / SESSION_COOKIE_NAME / SITE_URL are
#         supplied here, at container start — never baked into the image)

################################################################################
# 1) deps — install dependencies only, cached independently of source changes
################################################################################
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

################################################################################
# 2) builder — generate the Prisma client, then build the Next.js app
################################################################################
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# Copy only what `prisma generate` needs first, so editing application code
# later doesn't invalidate this layer's cache.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npx prisma generate

# Build-time-only placeholders. src/lib/env.ts validates these eagerly at
# import time (fail-fast-at-boot by design), and the root layout imports it,
# so `next build` runs that validation even though nothing here is
# statically generated against a real DB/RustFS connection (no
# generateStaticParams in this app). These values are never used for a real
# connection and do not exist in the final runtime image below.
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=nuru" \
    RUSTFS_ENDPOINT="http://127.0.0.1:9000" \
    RUSTFS_ACCESS_KEY="build" \
    RUSTFS_SECRET_KEY="build" \
    RUSTFS_BUCKET="build" \
    RUSTFS_PUBLIC_URL="http://127.0.0.1:9000" \
    NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN npm run build

################################################################################
# 3) migrator — same artifacts as `builder`, only job is `prisma db push` /
# `prisma db seed` against the production database. No migrations directory
# is tracked in this project (schema is synced directly, no migration
# history) — `db push` diffs prisma/schema against the live database and
# applies whatever DDL is needed. The runner image below is a Next.js
# standalone build and does NOT carry the Prisma CLI, devDependencies (tsx,
# needed by the seed script), or the prisma/ source folder — file tracing
# only bundles what server code actually imports at runtime (@prisma/client),
# not CLI-only packages. Build and push this as a second tag
# (--target migrator) and run it as a one-off `docker run`, never as part of
# the long-running Swarm service — see deployment/scripts/migrate.sh.
#
# --accept-data-loss is required for db push to run non-interactively at all
# (no TTY to confirm a prompt in `docker run`). This means a column
# drop/type-narrowing change WILL be applied without asking — always run
# scripts/backup.sh before scripts/migrate.sh in production.
################################################################################
FROM builder AS migrator
CMD ["npx", "prisma", "db", "push", "--accept-data-loss"]

################################################################################
# 4) runner — minimal runtime image: standalone server + static assets only
################################################################################
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# .next/standalone already contains its own minimal node_modules (only what
# was actually traced from the build) plus server.js — the static assets and
# public folder are deliberately excluded from it and copied separately.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Real signal (queries the DB — see src/app/api/health/route.ts), not a
# static 200. Also consumed by Traefik's own loadbalancer healthcheck in
# deployment/docker-compose.yml; this one covers `docker service ps` status
# and any orchestrator that only understands the image's own HEALTHCHECK.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
