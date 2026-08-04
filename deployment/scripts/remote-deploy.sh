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

set -a
source .env
set +a

if [[ -n "${NURU_VERSION:-}" ]]; then
  export NURU_VERSION
fi

echo "[remote-deploy] Deploying nuru-energy with NURU_VERSION=${NURU_VERSION:-latest}..."
docker stack deploy --with-registry-auth --resolve-image=always -c docker-compose.yml nuru-energy

echo "[remote-deploy] Cleaning up dangling and old images..."
docker image prune -af --filter "until=24h" 2>/dev/null || true
echo "[remote-deploy] Done. Watch rollout with: docker service ls"
