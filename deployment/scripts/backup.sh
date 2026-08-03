#!/usr/bin/env bash
# =============================================================================
# Postgres backup — pg_dump the nuru_db database to a timestamped, gzipped
# file under $DATA_DIR/backups. Run manually or from a host cron entry, e.g.:
#   0 2 * * * /opt/nuru-energy-store/deployment/scripts/backup.sh >> /var/log/nuru-backup.log 2>&1
# =============================================================================

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

set -a
source .env
set +a

DATA_DIR="${DATA_DIR:-/opt/nuru-data}"
BACKUP_DIR="${DATA_DIR}/backups"
mkdir -p "$BACKUP_DIR"

CONTAINER=$(docker ps --filter "name=nuru-energy_postgres" --format '{{.ID}}' | head -1)
if [[ -z "$CONTAINER" ]]; then
  echo "[backup] postgres container not found — is the stack running?" >&2
  exit 1
fi

OUT_FILE="${BACKUP_DIR}/nuru-$(date +%Y%m%d-%H%M%S).sql.gz"
echo "[backup] Dumping nuru_db to ${OUT_FILE}..."
docker exec "$CONTAINER" pg_dump -U nuru -d nuru_db | gzip > "$OUT_FILE"
echo "[backup] Done: ${OUT_FILE}"

# Keep the last 5 backups only.
ls -1t "${BACKUP_DIR}"/nuru-*.sql.gz 2>/dev/null | tail -n +6 | xargs -r rm --
