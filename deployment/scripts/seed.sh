#!/usr/bin/env bash
# =============================================================================
# Manual Seed Script for Nuru Energy
#
# Runs seeding as a one-off docker container against the migrator image.
# Non-destructive: Existing products, brands, and categories in the database
# are preserved and will NOT be overwritten if already present.
#
# Usage: cd deployment && ./scripts/seed.sh
# =============================================================================

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

set -a
source .env
set +a

IMAGE="${DOCKER_IMAGE:-shamirj/nuru-energy-store}"
if [[ -z "${NURU_VERSION:-}" ]]; then
  DETECTED_TAG=$(docker service inspect nuru-energy_nuru-web --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}' 2>/dev/null | sed -E 's/.*:([^@]+).*/\1/' || true)
  TAG="${DETECTED_TAG:-latest}"
else
  TAG="${NURU_VERSION}"
fi
MIGRATOR_IMAGE="${IMAGE}:migrate-${TAG}"
DATABASE_URL="postgresql://nuru:${POSTGRES_PASSWORD}@postgres:5432/nuru_db?schema=nuru"

echo "[seed] Running manual database seed with ${MIGRATOR_IMAGE}..."
docker run --rm \
  --network nuru-energy_nuru-data \
  -e DATABASE_URL="${DATABASE_URL}" \
  -e OWNER_EMAIL="${OWNER_EMAIL}" \
  -e OWNER_PASSWORD="${OWNER_PASSWORD}" \
  --entrypoint npx \
  "${MIGRATOR_IMAGE}" prisma db seed

echo "[seed] Manual seed completed."
