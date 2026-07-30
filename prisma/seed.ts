import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StaffRole, ProductStatus, InventoryMovementType } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const seedEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  OWNER_EMAIL: z.email({ message: "OWNER_EMAIL must be a valid email" }).optional().default("owner@nuruenergy.co.ke"),
  OWNER_PASSWORD: z.string().min(8, "OWNER_PASSWORD must be at least 8 characters").optional().default("NuruEnergy2026!Secured"),
});

const parsedEnv = seedEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  OWNER_EMAIL: process.env.OWNER_EMAIL,
  OWNER_PASSWORD: process.env.OWNER_PASSWORD,
});

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: parsedEnv.DATABASE_URL }) });

/**
 * Robust CSV parser handling quoted fields, escaped quotes, and newlines.
 */
function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const parseLine = (line: string): string[] => {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    return fields;
  };

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx];
      });
      rows.push(row);
    }
  }

  return rows;
}

async function seedOwner() {
  const existing = await db.adminUser.findUnique({ where: { email: parsedEnv.OWNER_EMAIL } });
  if (!existing) {
    const passwordHash = await hashPassword(parsedEnv.OWNER_PASSWORD);
    await db.adminUser.create({
      data: {
        name: "Lisper Wairimu Mathenge",
        email: parsedEnv.OWNER_EMAIL,
        passwordHash,
        role: StaffRole.OWNER,
      },
    });
    console.log(`✓ Owner account created for ${parsedEnv.OWNER_EMAIL}`);
  } else {
    console.log(`- Owner account already exists (${parsedEnv.OWNER_EMAIL})`);
  }
}

async function seedBrandsFromCsv() {
  const filePath = path.join(process.cwd(), "prisma", "seeds", "brands.csv");
  if (!fs.existsSync(filePath)) {
    console.log("⚠ No brands.csv found, skipping brand seed.");
    return new Map<string, string>();
  }

  console.log("🌱 Reading Brands from prisma/seeds/brands.csv...");
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const records = parseCsv(rawContent);

  const brandMap = new Map<string, string>();

  for (const row of records) {
    const brandData = {
      name: row.name,
      slug: row.slug,
      countryOfOrigin: row.countryOfOrigin || null,
      websiteUrl: row.websiteUrl || null,
      description: row.description || null,
      isFeatured: row.isFeatured === "true",
      isActive: row.isActive === "true",
      seoTitle: row.seoTitle || null,
      seoDescription: row.seoDescription || null,
    };

    const created = await db.brand.upsert({
      where: { slug: brandData.slug },
      update: brandData,
      create: brandData,
    });
    brandMap.set(created.slug, created.id);
  }

  console.log(`✓ Seeded ${records.length} Brands from CSV.`);
  return brandMap;
}

async function seedCategoriesFromCsv() {
  const filePath = path.join(process.cwd(), "prisma", "seeds", "categories.csv");
  if (!fs.existsSync(filePath)) {
    console.log("⚠ No categories.csv found, skipping category seed.");
    return new Map<string, string>();
  }

  console.log("🌱 Reading Categories from prisma/seeds/categories.csv...");
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const records = parseCsv(rawContent);

  const categoryMap = new Map<string, string>();

  // Pass 1: Upsert all categories without parentId
  for (const row of records) {
    const categoryData = {
      name: row.name,
      slug: row.slug,
      description: row.description || null,
      displayOrder: Number.parseInt(row.displayOrder || "0", 10),
      isActive: row.isActive === "true",
      isFeatured: row.isFeatured === "true",
      seoTitle: row.seoTitle || null,
      seoDescription: row.seoDescription || null,
      seoKeywords: row.seoKeywords || null,
      canonicalUrl: row.canonicalUrl || null,
    };

    const created = await db.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData,
    });
    categoryMap.set(created.slug, created.id);
  }

  // Pass 2: Connect parent categories if parentSlug is set
  for (const row of records) {
    if (row.parentSlug && categoryMap.has(row.parentSlug)) {
      const parentId = categoryMap.get(row.parentSlug)!;
      await db.category.update({
        where: { slug: row.slug },
        data: { parentId },
      });
    }
  }

  console.log(`✓ Seeded ${records.length} Categories from CSV.`);
  return categoryMap;
}

async function seedProductsFromCsv(brandMap: Map<string, string>, categoryMap: Map<string, string>) {
  const filePath = path.join(process.cwd(), "prisma", "seeds", "products.csv");
  if (!fs.existsSync(filePath)) {
    console.log("- No products.csv found, skipping product seed.");
    return;
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const records = parseCsv(rawContent);
  if (records.length === 0) {
    console.log("- products.csv is empty, skipping product seed.");
    return;
  }

  console.log(`🌱 Reading Products from prisma/seeds/products.csv (${records.length} items)...`);

  for (const row of records) {
    const brandId = row.brandSlug ? brandMap.get(row.brandSlug) || null : null;
    const categoryId = row.categorySlug ? categoryMap.get(row.categorySlug) || null : null;
    if (!categoryId) {
      console.warn(`⚠ Skipping product "${row.name}": Category slug "${row.categorySlug}" not found.`);
      continue;
    }

    const quantityOnHand = Number.parseInt(row.quantityOnHand || "0", 10);

    const productData = {
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      model: row.model || null,
      shortDescription: row.shortDescription || null,
      fullDescription: row.fullDescription || null,
      status: (row.status as ProductStatus) || ProductStatus.ACTIVE,
      sellingPrice: Number.parseFloat(row.sellingPrice || "0"),
      previousPrice: row.previousPrice ? Number.parseFloat(row.previousPrice) : null,
      costPrice: row.costPrice ? Number.parseFloat(row.costPrice) : null,
      weightKg: row.weightKg ? Number.parseFloat(row.weightKg) : null,
      dimensions: row.dimensions || null,
      installationAvailable: row.installationAvailable === "true",
      installationRequired: row.installationRequired === "true",
      brandId,
      categoryId,
      seoTitle: row.seoTitle || null,
      seoDescription: row.seoDescription || null,
      seoKeywords: row.seoKeywords || null,
      canonicalUrl: row.canonicalUrl || null,
      publishedAt: new Date(),
    };

    const product = await db.product.upsert({
      where: { slug: productData.slug },
      update: productData,
      create: productData,
    });

    const invItem = await db.inventoryItem.upsert({
      where: { productId: product.id },
      update: {
        quantityOnHand,
        reorderLevel: 5,
        lowStockThreshold: 3,
      },
      create: {
        productId: product.id,
        quantityOnHand,
        reorderLevel: 5,
        lowStockThreshold: 3,
      },
    });

    const existingMovements = await db.inventoryMovement.count({
      where: { inventoryItemId: invItem.id },
    });

    if (existingMovements === 0 && quantityOnHand > 0) {
      await db.inventoryMovement.create({
        data: {
          inventoryItemId: invItem.id,
          productId: product.id,
          type: InventoryMovementType.OPENING_STOCK,
          quantityChange: quantityOnHand,
          previousQuantity: 0,
          newQuantity: quantityOnHand,
          reason: "CSV Seed initial stock",
        },
      });
    }
  }

  console.log(`✓ Seeded Products & Inventory from CSV.`);
}

async function main() {
  console.log("🚀 Starting Nuru Energy Store CSV-driven Seed...");
  await seedOwner();
  const brandMap = await seedBrandsFromCsv();
  const categoryMap = await seedCategoriesFromCsv();
  await seedProductsFromCsv(brandMap, categoryMap);
  console.log("✅ Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
