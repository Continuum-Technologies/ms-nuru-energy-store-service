import { NextResponse } from "next/server";
import { db } from "@/infrastructure/database/client";

/**
 * Liveness/readiness probe for the container orchestrator (Docker Swarm
 * HEALTHCHECK, Traefik load-balancer health check). Actually queries the
 * database rather than returning a static 200 — a genuine signal, not a
 * fabricated "online" badge (CLAUDE.md's no-fabricated-status rule).
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
