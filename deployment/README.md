# Nuru Energy Store — Production Deployment

Standalone Docker Swarm stack. No dependency on any other Zaam repo or
shared cluster — everything this app needs (reverse proxy + TLS, Postgres,
object storage, the app itself) is defined in `docker-compose.yml`.

## Architecture

```
Internet
   │  :80/:443
   ▼
Traefik (TLS via Let's Encrypt, HTTP-01)
   │  Host(nuruenergy.co.ke)                       → nuru-web:3000  (includes /admin)
   │  Host(nuruenergy.co.ke) && PathPrefix(/media) → rustfs:9000
   ▼
nuru-web (Next.js standalone) ── postgres:5432 (schema: nuru)
                               └─ rustfs:9000  (product images)

Traefik dashboard — separate, non-public :8080 entrypoint (see below)
```

Only one domain was purchased — no subdomain DNS is available — so the admin
dashboard is a path on the same domain, `https://nuruenergy.co.ke/admin`,
exactly like local dev. There's only ever one app/container either way.

Product images are served at `https://nuruenergy.co.ke/media/*` (Traefik
strips the `/media` prefix before forwarding to RustFS) rather than a
separate subdomain.

## Prerequisites

- A Linux VPS with Docker Engine 26+ (`curl -fsSL https://get.docker.com | sh`)
- DNS A record for `nuruenergy.co.ke` pointed at this host's public IP
  **before** first deploy (Let's Encrypt's HTTP-01 challenge needs it
  resolvable)
- Ports 80 and 443 open publicly. Port 8080 (Traefik dashboard) must be
  reachable from the host itself but **not** open to the public internet —
  see "Traefik dashboard" below.
- This repo cloned on the host at `~/nuru-energy-store-service` — CI's deploy
  step (`git pull --ff-only`) and `scripts/remote-deploy.sh` both assume that
  path. The deploy user needs a deploy key with read access to the repo and
  must be in the `docker` group.

## First-time setup

```bash
git clone <this-repo-url> ~/nuru-energy-store-service
cd ~/nuru-energy-store-service/deployment
cp .env.template .env
nano .env   # fill in every value — see comments in the file
chmod 600 .env

./deploy.sh
```

`deploy.sh` initialises Swarm, creates the overlay networks and data
directories, and deploys the stack. Once `nuru-web` shows `1/1` in
`docker service ls`:

```bash
./scripts/backup.sh   # nothing to back up yet on a fresh DB, but build the habit
./scripts/migrate.sh
```

syncs the Prisma schema (`prisma db push` — this project doesn't track
migration history, see the Dockerfile's `migrator` stage) and seeds the Owner
account from `OWNER_EMAIL`/`OWNER_PASSWORD` in `.env`. Log in at
`https://nuruenergy.co.ke/admin`, then rotate that password from the
dashboard.

## Day-2 deploys (CI)

`.github/workflows/build-and-publish.yml` builds and pushes two image tags
on every push to `main` — the app image and the `migrate-<tag>` migrator
image (see the Dockerfile's `migrator` stage) — then SSHes into this host and
runs `scripts/remote-deploy.sh`, which re-runs `docker stack deploy` with the
new `NURU_VERSION`. It does **not** sync the schema automatically; after a
release that changes `prisma/schema`, run `./scripts/backup.sh` then
`./scripts/migrate.sh` by hand — `db push` runs with `--accept-data-loss`
(required to run non-interactively), so a destructive change is applied
without asking.

Required GitHub repository secrets for that workflow:

| Secret                                       | Purpose                                   |
| -------------------------------------------- | ----------------------------------------- |
| `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` | push the built images                     |
| `DEPLOY_HOST`                              | production host's SSH address             |
| `DEPLOY_USER`                              | SSH user (must be in the`docker` group) |
| `DEPLOY_SSH_KEY`                           | private key for that user                 |

Required repository variable: `DOCKER_IMAGE_PREFIX` (your Docker Hub
namespace, e.g. `shamirj`).

## Traefik dashboard

Enabled, but deliberately kept off the public web — it lives on its own
entrypoint (`:8080`), separate from the `web`/`websecure` entrypoints the app
uses, specifically so its `PathPrefix(/api)` router can never shadow the
app's own real `/api/*` routes (uploads, health) on the public domain. It's
also behind HTTP basic auth (`TRAEFIK_DASHBOARD_AUTH` in `.env`).

**Firewall port 8080 off from the public internet** — only 22 (SSH), 80 and
443 should be reachable from outside. On Ubuntu with `ufw`:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
# 8080 is simply never allowed — ufw defaults to deny incoming
```

Access the dashboard through an SSH tunnel, never directly:

```bash
ssh -L 8080:localhost:8080 <user>@<host>
# then open http://localhost:8080/dashboard/ in your local browser
```

Regenerate `TRAEFIK_DASHBOARD_AUTH` any time with `htpasswd -nB admin` (see
`.env.template` for the exact format), then redeploy.

## Operations

```bash
# Service status
docker service ls

# Logs
docker service logs -f nuru-energy_nuru-web

# Manual rollback to a previous version
NURU_VERSION=1.0.4 docker stack deploy --with-registry-auth -c docker-compose.yml nuru-energy

# Backup
./scripts/backup.sh   # pg_dump → $DATA_DIR/backups, keeps last 5

# Force-restart a stuck service
docker service update --force nuru-energy_nuru-web
```

## Troubleshooting

- **502 from Traefik** — check `nuru-web` is healthy: `docker service ps nuru-energy_nuru-web`.
- **Certs not issuing** — DNS must resolve to this host before the first
  request; check `docker service logs nuru-energy_traefik` for ACME errors.
- **Migrator image not found** — `scripts/migrate.sh` pulls
  `${DOCKER_IMAGE}:migrate-${NURU_VERSION}`; confirm the workflow run for
  that version actually pushed the migrator tag (check the Actions log).
- **Dashboard unreachable** — confirm the SSH tunnel is up and port 8080 is
  actually bound on the host: `docker service ps nuru-energy_traefik`. A 401
  means the tunnel and routing are fine, just re-check `TRAEFIK_DASHBOARD_AUTH`.
