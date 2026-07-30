import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requirePermission, ForbiddenError, type Permission } from "@/lib/permissions";
import { UnauthorizedError } from "@/lib/auth/session";
import { uploadImage, InvalidImageError } from "@/infrastructure/storage/upload";

// Which permission gates an upload depends on which entity it's for — one
// endpoint serves Category/Brand/Product images rather than three near-
// identical route handlers, but still gates each correctly.
const FOLDER_PERMISSIONS: Record<string, Permission> = {
  products: "products.edit",
  categories: "categories.manage",
  brands: "brands.manage",
};

/**
 * Accepts a multipart form with `file` and `folder` fields, checks the
 * permission for that folder, and uploads to RustFS. Returns `{ url, key }` on
 * success — `key` is what a later delete call needs.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder");

  if (!(file instanceof File) || typeof folder !== "string" || !(folder in FOLDER_PERMISSIONS)) {
    return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
  }

  try {
    await requirePermission(FOLDER_PERMISSIONS[folder]);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Not permitted" }, { status: 403 });
    }
    throw error;
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const uploaded = await uploadImage(buffer, file.type, folder);
    return NextResponse.json(uploaded);
  } catch (error) {
    if (error instanceof InvalidImageError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
