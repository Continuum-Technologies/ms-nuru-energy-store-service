import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StaffRole } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

// There is no signup flow — staff accounts are created by other staff — so
// something has to create the very first login. This seed does that once.
const seedEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  OWNER_EMAIL: z.email("OWNER_EMAIL must be a valid email"),
  OWNER_PASSWORD: z.string().min(8, "OWNER_PASSWORD must be at least 8 characters"),
});

const { DATABASE_URL, OWNER_EMAIL, OWNER_PASSWORD } = seedEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  OWNER_EMAIL: process.env.OWNER_EMAIL,
  OWNER_PASSWORD: process.env.OWNER_PASSWORD,
});

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });

async function main() {
  const existing = await db.adminUser.findUnique({ where: { email: OWNER_EMAIL } });
  if (existing) {
    console.log(`Owner account already exists for ${OWNER_EMAIL}, skipping.`);
    return;
  }

  const passwordHash = await hashPassword(OWNER_PASSWORD);

  await db.adminUser.create({
    data: {
      name: "Store Owner",
      email: OWNER_EMAIL,
      passwordHash,
      role: StaffRole.OWNER,
    },
  });

  console.log(`Created Owner account for ${OWNER_EMAIL}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
