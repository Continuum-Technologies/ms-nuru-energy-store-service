import { db } from "@/infrastructure/database/client";

const DEFAULT_STORE_SETTINGS = {
  id: "default",
  businessName: "Nuru Energy",
  logoUrl: null,
  phone: null,
  whatsapp: null,
  whatsappOrderingEnabled: true,
  email: null,
  address: null,
  county: "Nairobi",
  businessHours: null,
  facebookUrl: null,
  instagramUrl: null,
  tiktokUrl: null,
  currency: "KES",
  vatRate: 16.0,
  pricesIncludeVat: true,
  deliveryInfo: null,
  collectionInfo: null,
  warrantyPolicySummary: null,
  returnPolicySummary: null,
  quotationTermsDefault: null,
  mpesaPaybill: null,
  mpesaTill: null,
  bankName: null,
  bankAccountName: null,
  bankAccountNumber: null,
  bankBranch: null,
  orderNotificationEmails: null,
  lowStockThresholdDefault: 5,
  seoTitleSuffix: "| Nuru Energy",
  seoDefaultDescription: null,
  updatedAt: new Date(),
  updatedById: null,
  updatedBy: null,
};

/**
 * Lazily creates the single settings row on first read — no seed step
 * required, and every field already has a sensible schema default.
 */
export async function getStoreSettings() {
  try {
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
    return await db.storeSettings.create({
      data: {},
      include: {
        updatedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });
  } catch {
    // If DB is unreachable (e.g. during Docker build / CI static analysis phase)
    return DEFAULT_STORE_SETTINGS;
  }
}
