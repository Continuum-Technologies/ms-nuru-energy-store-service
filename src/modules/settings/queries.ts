import { db } from "@/infrastructure/database/client";

/**
 * Lazily creates the single settings row on first read — no seed step
 * required, and every field already has a sensible schema default.
 */
export async function getStoreSettings() {
  const existing = await db.storeSettings.findFirst({
    include: {
      updatedBy: {
        select: { id: true, name: true, role: true },
      },
    },
  });
  if (existing) {
    return existing;
  }
  return db.storeSettings.create({
    data: {},
    include: {
      updatedBy: {
        select: { id: true, name: true, role: true },
      },
    },
  });
}
