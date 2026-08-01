import "server-only";
import { db } from "@/infrastructure/database/client";
import { normalizeKenyanPhone } from "@/lib/phone";

type TransactionClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];
type DbClient = typeof db | TransactionClient;

export interface CustomerCheckoutInput {
  name: string;
  phone: string;
  email?: string;
  // Optional — a quotation request (unlike checkout) collects no delivery
  // address at all; only checkout ever supplies these.
  county?: string;
  town?: string;
  deliveryLocation?: string;
  deliveryInstructions?: string;
}

/**
 * Finds or creates a `Customer` by phone (the natural unique key) — "guest
 * checkout" means no login/password required, not that we never persist who
 * the customer is. Called from both order checkout and quotation requests so
 * future order-history/total-spend/repeat-order features (PRD §21) have
 * real data to build on. An existing customer's name/email/county/town are
 * refreshed to whatever was just submitted, since contact details can
 * change between orders. Accepts an optional transaction client so the
 * caller can include this in the same atomic transaction as order/quotation
 * creation.
 */
export async function getOrCreateCustomer(input: CustomerCheckoutInput, client: DbClient = db) {
  const phone = normalizeKenyanPhone(input.phone);

  // Checked up front, not caught-and-retried after a failed write: Postgres
  // aborts the *whole* transaction on any failed statement, so a second
  // query on the same `tx` after a unique-constraint error is impossible —
  // it would just fail again with "current transaction is aborted." Rare
  // case: a different phone already owns this exact email (Customer.email
  // is @unique); when that happens, we simply don't set the email rather
  // than failing the whole checkout/quotation over a contact-info collision.
  let email = input.email;
  if (email) {
    const emailOwner = await client.customer.findUnique({ where: { email } });
    if (emailOwner && emailOwner.phone !== phone) {
      email = undefined;
    }
  }

  const customer = await client.customer.upsert({
    where: { phone },
    update: { name: input.name, email, county: input.county, town: input.town },
    create: { name: input.name, phone, email, county: input.county, town: input.town },
  });

  if (input.county && input.town) {
    await saveCustomerAddress(customer.id, { ...input, county: input.county, town: input.town }, client);
  }

  return customer;
}

/** Skips creating a duplicate when the exact same address already exists; marks the first address as default, leaves later ones as-is. */
async function saveCustomerAddress(
  customerId: string,
  input: { county: string; town: string; deliveryLocation?: string; deliveryInstructions?: string },
  client: DbClient,
): Promise<void> {
  const existing = await client.customerAddress.findFirst({
    where: {
      customerId,
      county: input.county,
      town: input.town,
      deliveryLocation: input.deliveryLocation ?? null,
      deliveryInstructions: input.deliveryInstructions ?? null,
    },
  });
  if (existing) return;

  const addressCount = await client.customerAddress.count({ where: { customerId } });

  await client.customerAddress.create({
    data: {
      customerId,
      county: input.county,
      town: input.town,
      deliveryLocation: input.deliveryLocation,
      deliveryInstructions: input.deliveryInstructions,
      isDefault: addressCount === 0,
    },
  });
}
