-- Prisma's multi-schema feature (prisma/schema/schema.prisma: schemas = ["nuru"])
-- does not create the schema itself — every migration assumes it already
-- exists. The official postgres image runs every *.sql in
-- /docker-entrypoint-initdb.d/ once, on first container start against an
-- empty data directory, before the app ever connects.
CREATE SCHEMA IF NOT EXISTS nuru;
