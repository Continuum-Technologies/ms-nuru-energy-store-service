/**
 * Placeholder business contact info for the quotation PDF header — mirrors
 * the same values already shown in `storefront-footer.tsx`/the header's
 * contact bar rather than inventing new ones. There's no Settings/
 * BusinessSettings model yet; once one exists, this constant is what it
 * would replace.
 */
export const BUSINESS_INFO = {
  name: "Nuru Energy Store",
  phone: "+254 719 375 096",
  email: "info@nuruenergy.co.ke",
  address: "Nairobi Store • Countrywide Delivery across Kenya",
} as const;
