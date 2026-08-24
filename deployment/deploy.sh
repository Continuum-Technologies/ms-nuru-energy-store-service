#!/usr/bin/env bash
# =============================================================================
# Nuru Energy — first-time production bootstrap
# =============================================================================
# Idempotent: safe to re-run. Initialises Docker Swarm on this node (if not
# already), creates the overlay networks, creates the host data directories,
# and deploys the stack defined in docker-compose.yml.
#
# After this succeeds for the first time, run scripts/migrate.sh once to
# sync the Prisma schema and seed the Owner account. Day-2 deploys (new
# image versions) go through scripts/remote-deploy.sh, driven by CI — this
# script is only for standing the stack up from nothing.
#
# Usage: cd deployment && ./deploy.sh
# =============================================================================

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[deploy]${NC} $*"; }
ok()    { echo -e "${GREEN}[deploy]${NC} $*"; }
warn()  { echo -e "${YELLOW}[deploy]${NC} $*"; }
error() { echo -e "${RED}[deploy]${NC} $*" >&2; }

command -v docker >/dev/null || { error "Docker is not installed."; exit 1; }

if [[ ! -f .env ]]; then
  error ".env not found. Copy .env.template to .env and fill in every value first."
  exit 1
fi

set -a
source .env
set +a

REQUIRED_VARS=(ACME_EMAIL POSTGRES_PASSWORD RUSTFS_ACCESS_KEY RUSTFS_SECRET_KEY TRAEFIK_DASHBOARD_AUTH)
missing=()
for var in "${REQUIRED_VARS[@]}"; do
  [[ -z "${!var:-}" ]] && missing+=("$var")
done
if [[ ${#missing[@]} -gt 0 ]]; then
  error "Missing required values in .env: ${missing[*]}"
  exit 1
fi

# ── Swarm init ─────────────────────────────────────────────────────────────
if ! docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null | grep -q active; then
  info "Initialising Docker Swarm..."
  docker swarm init
  ok "Swarm initialised"
else
  info "Docker Swarm already active on this node — skipping init"
fi

# ── Overlay networks ─────────────────────────────────────────────────────────
for net in nuru-public nuru-data; do
  if ! docker network inspect "$net" >/dev/null 2>&1; then
    info "Creating overlay network: $net"
    docker network create --driver overlay "$net"
  else
    info "Network $net already exists — skipping"
  fi
done

# ── Host data directories ────────────────────────────────────────────────────
DATA_DIR="${DATA_DIR:-/opt/nuru-data}"
info "Ensuring data directories under $DATA_DIR..."
mkdir -p "$DATA_DIR"/{postgres,rustfs/data,rustfs/logs,traefik}
ok "Data directories ready"

# ── Deploy ────────────────────────────────────────────────────────────────
info "Deploying stack 'nuru-energy'..."
docker stack deploy --with-registry-auth --resolve-image=always -c docker-compose.yml nuru-energy
ok "Stack deployed"

echo
info "Next steps:"
echo "  1. Point nuruenergy.co.ke's A record at this host's public IP."
echo "  2. Firewall port 8080 (Traefik dashboard) off from the public internet — only 22, 80, 443 should be open. See README.md."
echo "  3. Watch replicas converge: docker service ls"
echo "  4. Once nuru-web is 1/1, run: ./scripts/migrate.sh   (syncs the schema, seeds the Owner account)"
echo "  5. Log in at https://nuruenergy.co.ke/admin with OWNER_EMAIL/OWNER_PASSWORD from .env, then rotate the password."
