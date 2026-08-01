import { generateReferenceNumber } from "@/lib/reference-number";

/** `NE-YYMMDD-XXXX` order numbers. */
export async function generateOrderNumber(isTaken: (orderNumber: string) => Promise<boolean>): Promise<string> {
  return generateReferenceNumber("NE", isTaken);
}
