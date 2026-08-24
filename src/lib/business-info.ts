import { getStoreSettings } from "@/modules/settings/queries";

/**
 * Business contact info for PDF headers (quotations/orders) — backed by
 * `StoreSettings`, editable from /admin/settings. Falls back to sensible
 * defaults for fields the owner hasn't filled in yet, so a fresh install's
 * PDFs never render a blank header.
 */
export async function getBusinessInfo() {
  const settings = await getStoreSettings();
  return {
    name: settings.businessName,
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    address: settings.address ?? "",
  };
}
