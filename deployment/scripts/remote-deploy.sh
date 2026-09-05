#!/usr/bin/env bash
# =============================================================================
# Day-2 deploy — pulls the version tagged by CI and redeploys the stack.
# Invoked over SSH by .github/workflows/build-and-publish.yml after it pushes
# a new image; NURU_VERSION is passed in as an env var by that SSH step.
#
# Does NOT run migrations automatically — a bad migration should never be
# silently applied by a routine deploy. Run scripts/migrate.sh by hand after
# reviewing what a release changes, same as the first-time setup.
#
# Usage (normally invoked by CI, not by hand):
#   NURU_VERSION=1.0.3 ./remote-deploy.sh
# =============================================================================

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

DEPLOY_TAG="${NURU_VERSION:-}"

set -a
source .env
set +a

if [[ -n "${DEPLOY_TAG}" ]]; then
  export NURU_VERSION="${DEPLOY_TAG}"
elif [[ -z "${NURU_VERSION:-}" ]]; then
  DETECTED_TAG=$(docker service inspect nuru-energy_nuru-web --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}' 2>/dev/null | sed -E 's/.*:([^@]+).*/\1/' || true)
  if [[ -n "${DETECTED_TAG}" ]]; then
    export NURU_VERSION="${DETECTED_TAG}"
  fi
fi

IMAGE="${DOCKER_IMAGE:-shamirj/nuru-energy-store}"

echo "[remote-deploy] Deploying nuru-energy with NURU_VERSION=${NURU_VERSION:-latest}..."
docker stack deploy --with-registry-auth --resolve-image=always -c docker-compose.yml nuru-energy

if docker service inspect nuru-energy_nuru-web >/dev/null 2>&1; then
  echo "[remote-deploy] Rolling out image ${IMAGE}:${NURU_VERSION:-latest} to nuru-energy_nuru-web..."
  docker service update --image "${IMAGE}:${NURU_VERSION:-latest}" nuru-energy_nuru-web
fi

echo "[remote-deploy] Cleaning up dangling and old images..."
docker image prune -af --filter "until=24h" 2>/dev/null || true
echo "[remote-deploy] Done. Watch rollout with: docker service ls"
