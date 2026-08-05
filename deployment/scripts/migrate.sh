#!/usr/bin/env bash
# =============================================================================
# Sync the Prisma schema (db push — no migration history is tracked in this
# project) and seed the Owner account.
#
# Runs as one-off `docker run` containers against the "migrator" image
# (Dockerfile's `migrator` target) rather than execing into the long-running
# nuru-web service — the standalone runtime image doesn't carry the Prisma
# CLI or devDependencies (tsx, needed by the seed script). See the Dockerfile
# comment above the `migrator` stage for why.
#
# db push runs with --accept-data-loss (required to run non-interactively at
# all) — a destructive schema change (dropped column, narrowed type) is
# applied without asking. Always run scripts/backup.sh first.
#
# Usage: cd deployment && ./scripts/backup.sh && ./scripts/migrate.sh
# =============================================================================

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

set -a
source .env
set +a

IMAGE="${DOCKER_IMAGE:-shamirj/nuru-energy-store}"
TAG="${NURU_VERSION:-latest}"
MIGRATOR_IMAGE="${IMAGE}:migrate-${TAG}"
DATABASE_URL="postgresql://nuru:${POSTGRES_PASSWORD}@postgres:5432/nuru_db?schema=nuru"

echo "[migrate] Syncing schema with ${MIGRATOR_IMAGE} (prisma db push)..."
docker run --rm \
  --network nuru-energy_nuru-data \
  -e DATABASE_URL="${DATABASE_URL}" \
  "${MIGRATOR_IMAGE}"

echo "[migrate] Schema sync complete. (To seed CSV products/brands, run ./scripts/seed.sh manually)."

