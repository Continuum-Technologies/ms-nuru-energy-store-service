import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StaffRole, ProductStatus, InventoryMovementType, PageType } from "../src/generated/prisma/client";
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

    const existing = await db.brand.findUnique({ where: { slug: brandData.slug } });
    if (!existing) {
      const created = await db.brand.create({ data: brandData });
      brandMap.set(created.slug, created.id);
    } else {
      brandMap.set(existing.slug, existing.id);
    }
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

  // Pass 1: Create categories if they don't exist yet
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

    const existing = await db.category.findUnique({ where: { slug: categoryData.slug } });
    if (!existing) {
      const created = await db.category.create({ data: categoryData });
      categoryMap.set(created.slug, created.id);
    } else {
      categoryMap.set(existing.slug, existing.id);
    }
  }

  // Pass 2: Connect parent categories if parentSlug is set
  for (const row of records) {
    if (row.parentSlug && categoryMap.has(row.parentSlug)) {
      const parentId = categoryMap.get(row.parentSlug)!;
      const currentCat = await db.category.findUnique({ where: { slug: row.slug } });
      if (currentCat && !currentCat.parentId) {
        await db.category.update({
          where: { slug: row.slug },
          data: { parentId },
        });
      }
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

    const existingProduct = await db.product.findFirst({
      where: {
        OR: [{ slug: productData.slug }, { sku: productData.sku }],
      },
    });
    let product = existingProduct;

    if (!existingProduct) {
      product = await db.product.create({ data: productData });

      const invItem = await db.inventoryItem.create({
        data: {
          productId: product.id,
          quantityOnHand,
          reorderLevel: 5,
          lowStockThreshold: 3,
        },
      });

      if (quantityOnHand > 0) {
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
    } else {
      product = await db.product.update({
        where: { id: existingProduct.id },
        data: productData,
      });

      const existingInvItem = await db.inventoryItem.findUnique({
        where: { productId: product.id },
      });

      if (!existingInvItem) {
        await db.inventoryItem.create({
          data: {
            productId: product.id,
            quantityOnHand,
            reorderLevel: 5,
            lowStockThreshold: 3,
          },
        });
      }
    }
  }

  console.log(`✓ Seeded Products & Inventory from CSV.`);
}

async function activateAllDraftProducts() {
  const result = await db.product.updateMany({
    where: { status: "DRAFT" },
    data: { status: "ACTIVE" },
  });
  console.log(`✓ Activated ${result.count} products from DRAFT to ACTIVE.`);
}

async function seedSolutionPages() {
  console.log("🌱 Seeding Solution Pages...");

  const solutions = [
    {
      type: PageType.SOLUTION,
      title: "Home Solar Power Systems",
      slug: "home-solar",
      isPublished: true,
      seoTitle: "Home Solar Power Systems in Kenya | Hybrid & Off-Grid Solar Packages",
      seoDescription: "Custom home solar power solutions in Kenya. Complete solar panel, hybrid inverter, and lithium battery packages for zero electricity bills.",
      seoKeywords: "home solar power kenya, residential solar systems nairobi, 5kw solar inverter price, solar batteries kenya",
      body: `## Complete Solar Energy Independence for Kenyan Homes

Rising electricity tariffs and frequent power blackouts make solar power the smartest investment for Kenyan homeowners. Nuru Energy designs, supplies, and supports robust residential solar packages tailored to your exact energy demands.

---

### What's Inside a Home Solar Package?

1. **High-Efficiency Monocrystalline Solar Panels**: Tier-1 panels capturing maximum energy even during overcast weather.
2. **Pure Sine Wave Hybrid Inverters**: Seamlessly manage solar harvest, battery charging, and grid backup with sub-10ms automatic switchover.
3. **Long-Life Lithium LiFePO4 & Gel Batteries**: High cycle life (6,000+ cycles on lithium) ensuring uninterrupted nighttime power for lighting, entertainment, and refrigeration.
4. **Surge Protection & Certified Switchgear**: Complete DC/AC isolators, lightning arrestors, and distribution boards meeting EPRA standards.

---

### Recommended System Sizing

- **3kVA / 2.4kW System**: Ideal for 2–3 bedroom homes running LED lights, smart TVs, refrigerators, laptops, and security cameras.
- **5kVA / 5kW System**: The most popular Kenyan package. Easily powers refrigerators, deep freezers, washing machines, microwaves, pressure pumps, and home entertainment.
- **8kVA – 10kVA System**: Designed for large villas and rural homesteads running borehole pumps, water heaters, heavy kitchen appliances, and EV chargers.

---

### Why Choose Nuru Energy?

- **Genuine Certified Equipment**: Authorized distributor for Sunsynk, Deye, Felicity, Must, and Jinko Solar.
- **Countrywide Delivery & Installation**: Experienced solar technicians across all 47 counties in Kenya.
- **Warranty & After-Sales Support**: Up to 10-year warranties on lithium batteries and 25-year performance warranties on solar panels.`,
    },
    {
      type: PageType.SOLUTION,
      title: "Farm & Irrigation Solar",
      slug: "farm-irrigation",
      isPublished: true,
      seoTitle: "Farm & Agricultural Solar Power Solutions Kenya | Irrigation & Agribusiness",
      seoDescription: "Solar irrigation pumps, farm machinery, and agribusiness power solutions in Kenya. Eliminate fuel costs with reliable solar energy.",
      seoKeywords: "solar water pumping kenya, farm solar power nairobi, solar irrigation kits, chaff cutter solar kenya",
      body: `## Reliable Solar Power for Agribusiness and Farming

Diesel and petrol pumps eat up over 40% of smallholder farming profits in Kenya. Switching to solar irrigation and farm equipment provides zero-fuel water pumping, reliable feed processing, and uninterrupted poultry incubation.

---

### Agribusiness Solar Applications

1. **Solar Water Pumping & Drip Irrigation**: Direct DC and AC solar pumps delivering high flow rates for tomatoes, capsicum, avocados, and maize without expensive fuel bills.
2. **Livestock & Dairy Farming**: Continuous water supply for cattle troughs, automatic solar-powered milking machines, and milk chilling.
3. **Feed Processing & Chaff Cutting**: Heavy-duty single-phase and three-phase motor drives for chaff cutters, feed crushers, and hammer mills.
4. **Egg Incubation**: AC/DC automatic incubators with automatic egg turning and dual 12V battery backup to prevent hatch loss during power cuts.

---

### System Sizing & Consultation

Every farm has unique requirements based on water table depth, acreage, and daily water volume. Our agricultural engineers calculate dynamic head, daily yield, and pipe friction losses to configure the optimal solar pump and panel array.`,
    },
    {
      type: PageType.SOLUTION,
      title: "Office & Business Power Backup",
      slug: "business-backup",
      isPublished: true,
      seoTitle: "Commercial Solar Backup & UPS Systems in Kenya | Business Continuity",
      seoDescription: "Zero-downtime commercial power backup packages for Kenyan shops, offices, clinics, and supermarkets. Inverters, lithium batteries, and silent diesel generators.",
      seoKeywords: "business power backup kenya, commercial solar system nairobi, ups backup office, silent diesel generator kenya",
      body: `## Keep Your Business Running 24/7 Without Interruptions

Every hour of power outage costs Kenyan businesses revenue, leads, and customer trust. Nuru Energy provides commercial power backup packages engineered for instant switchover and 24/7 operation.

---

### Engineered for Commercial Applications

- **Retail Shops & Supermarkets**: Instant power for POS checkout counters, barcode scanners, CCTV cameras, and LED display lighting.
- **Medical Clinics & Pharmacies**: Temperature-critical vaccine refrigeration, laboratory analyzers, and diagnostic equipment.
- **Corporate Offices & Tech Hubs**: Server rooms, WiFi routers, workstations, and VoIP PBX phone systems.
- **Workshops & Manufacturing**: Heavy surge-tolerant inverters and silent diesel generators for continuous machinery operation.

---

### Inverter UPS vs. Silent Diesel Generators

- **Hybrid Solar / Inverter UPS**: Sub-10ms switchover, zero noise, zero emissions, and zero maintenance. Perfect for urban offices and tech setups.
- **Silent Diesel Generators**: Heavy-duty backup for multi-day grid failures and high-load industrial machinery with automatic transfer switches (ATS).`,
    },
    {
      type: PageType.SOLUTION,
      title: "Borehole Water Pumping Systems",
      slug: "borehole-systems",
      isPublished: true,
      seoTitle: "Solar Borehole Pumping Systems in Kenya | Submersible Solar Pumps",
      seoDescription: "Complete solar submersible borehole pumping solutions in Kenya. Stainless steel pumps, MPPT drive controllers, and tank automation float switches.",
      seoKeywords: "solar borehole pump kenya, submersible solar pump price nairobi, solar water pump installation kenya",
      body: `## Solar Powered Deep-Well Borehole Pumping

Pumping water from deep boreholes in Kenya has never been more reliable or economical. Solar borehole pumps run directly on sunlight using high-efficiency MPPT Variable Frequency Drives (VFD) without requiring batteries or diesel fuel.

---

### Complete Borehole System Components

1. **Stainless Steel Submersible Pump**: Multi-stage centrifugal pump engineered for high sand tolerance and corrosion resistance.
2. **Solar MPPT Variable Frequency Controller**: Tracks maximum solar irradiation from sunrise to sunset, adjusting motor speed for peak water delivery.
3. **Solar PV Array & Mounting Structures**: Rigid galvanized steel ground-mount or rooftop racks oriented for maximum Kenyan equatorial sunshine.
4. **Automated Float Switches & Level Sensors**: Prevents pump dry-run damage and automatically shuts off pumping when the header tank is full.
5. **Submersible Drop Cable & HDPE Piping**: Heavy-duty waterproof cabling and high-pressure PN16 piping tailored to your borehole depth.

---

### How to Get Sized

Provide us with:
1. Total borehole depth & static water rest level (m)
2. Desired daily water yield (m³ or litres per day)
3. Horizontal pipeline distance to storage tank
4. Height of storage tank above ground level

Our technical team will produce a certified sizing report within 2 hours.`,
    },
  ];

  for (const sol of solutions) {
    await db.page.upsert({
      where: { slug: sol.slug },
      update: sol,
      create: sol,
    });
  }

  console.log(`✓ Seeded ${solutions.length} Solution Pages.`);
}

async function seedStaticAndPolicyPages() {
  console.log("🌱 Seeding Static & Policy Pages...");

  const pages = [
    {
      type: PageType.STATIC,
      title: "About Nuru Energy",
      slug: "about-us",
      isPublished: true,
      seoTitle: "About Nuru Energy | Kenya's Trusted Solar & Power Retailer",
      seoDescription: "Learn about Nuru Energy — authorized distributor of genuine solar panels, lithium batteries, hybrid inverters, generators, and water pumps in Kenya.",
      seoKeywords: "about nuru energy, solar supplier kenya, genuine solar panels nairobi, epra certified solar dealer",
      body: `## Powering Kenya’s Homes, Farms, and Enterprises

** Nuru Energy** is Kenya’s dedicated single-store retailer for premium renewable energy systems, backup power equipment, and agricultural pumping solutions. Headquartered in Nairobi with delivery coverage across all 47 counties, we bridge the gap between world-class energy engineering and local accessibility.

---

### Our Core Principles

1. **100% Genuine Equipment Only**: We partner directly with certified global manufacturers including Sunsynk, Deye, Jinko Solar, Felicity, Must, and Honda to eliminate counterfeit and sub-standard equipment from the Kenyan market.
2. **EPRA-Compliant Engineering**: Every solar kit and commercial backup package is engineered to meet Energy and Petroleum Regulatory Authority (EPRA) standards and Kenya Bureau of Standards (KEBS) requirements.
3. **Transparent Pricing in KES**: Direct, upfront pricing with no hidden charges. Every quotation clearly breaks down hardware, cables, switchgear, and optional installation.
4. **Countrywide Support & Delivery**: From Turkana to Kilifi, our logistics partners ensure fragile solar panels, heavy batteries, and pumping machinery arrive safely and on time.

---

### Physical Showroom & Distribution

Visit our central showroom and pickup depot in Nairobi to inspect hardware, test inverters under load, and consult directly with our technical sales engineers.`,
    },
    {
      type: PageType.STATIC,
      title: "Contact & Store Location",
      slug: "contact-us",
      isPublished: true,
      seoTitle: "Contact Nuru Energy | Nairobi Showroom & Technical Support",
      seoDescription: "Contact Nuru Energy for solar equipment quotations, technical support, and store directions in Nairobi, Kenya.",
      seoKeywords: "contact nuru energy, solar shop nairobi, solar quotation kenya, nuru energy phone number",
      body: `## Get in Touch with Our Technical Team

Whether you are sizing a new residential solar system, replacing old lead-acid batteries with lithium, or equipping a borehole pump, our technical engineers are ready to assist.

---

### How We Can Help You

- **Custom Quotations & Bills of Quantities (BOQ)**: Send us your load list or borehole depth report for a certified proposal within 24 hours.
- **Equipment Availability & In-Store Inspection**: Check real-time stock and schedule hardware testing at our showroom.
- **Bulk & Agribusiness Pricing**: Special contractor and cooperative discounts for bulk agricultural machinery and irrigation kits.`,
    },
    {
      type: PageType.POLICY,
      title: "Delivery & Countrywide Shipping Policy",
      slug: "delivery-shipping",
      isPublished: true,
      seoTitle: "Delivery & Countrywide Shipping Policy | Nuru Energy Kenya",
      seoDescription: "Learn about Nuru Energy delivery options across Nairobi and all 47 Kenyan counties via Fargo, G4S, Speedaf, and dedicated transit.",
      seoKeywords: "solar delivery kenya, parcel delivery nairobi, countrywide shipping kenya, fargo courier solar",
      body: `## Fast, Safe, and Insured Countrywide Delivery

At Nuru Energy, we understand that solar panels, lithium batteries, and industrial generators require specialized handling during transit. We have built a secure nationwide logistics network covering all 47 counties in Kenya.

---

### 1. Delivery Options & Timelines

- **Nairobi Metropolitan (Same-Day / Next-Day Delivery)**: Orders placed before 12:00 PM are delivered the same business day. Orders placed after 12:00 PM are delivered the following morning.
- **Major Kenyan Towns (24–48 Hours)**: Daily parcel dispatches to Mombasa, Kisumu, Nakuru, Eldoret, Nyeri, Meru, Machakos, Naivasha, Kericho, and Kisii via trusted couriers (Fargo Courier, G4S, Speedaf, and regional coach parcel desks).
- **Remote & Rural Locations (48–72 Hours)**: Delivery to local sub-county parcel collection centers or direct site delivery by special arrangement.
- **Store Collection (Free)**: Ready for immediate collection at our Nairobi store during business hours (Monday – Saturday, 8:00 AM – 6:00 PM).

---

### 2. Specialized Packaging for Fragile & Heavy Equipment

- **Solar Panels (400W–650W)**: Shipped in reinforced palletized crates with edge protectors to prevent micro-cracks during transit.
- **Lithium & Gel Batteries**: Packed in shock-absorbent upright cartons with terminal insulators.
- **Pumps & Generators**: Tested, drained of fluids (for generators), and secured on heavy-duty transit bases.

---

### 3. Tracking & Inspection Upon Receipt

Customers receive an SMS and WhatsApp tracking receipt once their shipment is dispatched. We advise inspecting the outer packaging upon delivery before signing the courier consignment note.`,
    },
    {
      type: PageType.POLICY,
      title: "Warranty & Returns Policy",
      slug: "warranty-returns",
      isPublished: true,
      seoTitle: "Warranty & Return Policy | Genuine Solar Hardware Warranties Kenya",
      seoDescription: "Read Nuru Energy's warranty terms and 7-day return policy for solar inverters, lithium batteries, panels, and water pumps in Kenya.",
      seoKeywords: "solar warranty kenya, sunsynk warranty nairobi, return policy nuru energy, battery warranty kenya",
      body: `## Peace of Mind with Genuine Manufacturer Warranties

 Nuru Energy sells exclusively genuine, factory-certified equipment. Every purchase is backed by official manufacturer warranties and our local technical service center in Nairobi.

---

### 1. Standard Warranty Coverage

- **Lithium LiFePO4 Battery Banks**: Up to **5 to 10 Years** manufacturer warranty (minimum 6,000 cycles at 80% DoD).
- **Hybrid & Off-Grid Solar Inverters**: **2 to 5 Years** replacement and repair warranty depending on brand (Sunsynk, Deye, Felicity, Must).
- **Monocrystalline & Polycrystalline Solar Panels**: **12-Year Workmanship Warranty** + **25-Year Linear Power Output Guarantee** (minimum 80% output at year 25).
- **Generators, Water Pumps & Farm Machinery**: **1-Year Warranty** covering mechanical defects and motor windings.
- **Solar Charge Controllers & Accessories**: **1 to 2 Years** replacement warranty.

---

### 2. 7-Day Defective Return & Exchange Guarantee

If any product is found to have an out-of-the-box manufacturing defect within **7 days** of purchase, Nuru Energy will inspect, repair, or immediately replace the item at no cost to the customer.

---

### 3. Warranty Exclusions

Warranties do not cover damage resulting from:
- Incorrect DIY wiring or reverse battery polarity connections.
- Lightning strikes or external power surges where proper surge protection / SPD switchgear was omitted.
- Water ingress into non-waterproof inverter enclosures.
- Operating pumps dry without water level sensors.`,
    },
    {
      type: PageType.POLICY,
      title: "Frequently Asked Questions (FAQ)",
      slug: "faq",
      isPublished: true,
      seoTitle: "Frequently Asked Questions | Solar & Power Equipment Kenya",
      seoDescription: "Find answers to common questions about solar sizing, lithium battery lifespan, delivery, payment modes, and installation across Kenya.",
      seoKeywords: "solar faq kenya, how to size solar system kenya, solar battery lifespan, mpesa solar store",
      body: `## Frequently Asked Questions

---

### 1. How do I determine what size solar system I need for my home?
To size your system accurately, make a list of appliances you wish to run (e.g., 10 LED bulbs, 55" TV, double-door fridge, laptop, WiFi router). A typical 3-bedroom Kenyan home runs comfortably on a **5kW hybrid inverter** paired with a **5kWh or 10kWh lithium battery** and **6 to 8 solar panels (550W each)**. You can also [Request a Free Custom Quotation](/request-quotation) for an exact calculation.

---

### 2. What payment methods do you accept?
We support multiple secure Kenyan payment options:
- **M-PESA Buy Goods Till & Paybill**: Fast, verified mobile checkout.
- **Direct Bank Wire / EFT / RTGS**: Standard corporate invoicing and proforma bank transfers.
- **Card & Cash on Store Pickup**: Visa and Mastercard payments at our Nairobi counter.

---

### 3. Do you provide installation services outside Nairobi?
Yes. We have a certified network of EPRA-licensed solar technicians and electrical engineers covering Nairobi, Central Kenya, Rift Valley, Western, Coast, and Eastern regions. Installation can be bundled into your equipment quotation.

---

### 4. What is the difference between Gel and Lithium solar batteries?
- **Lithium (LiFePO4)**: 6,000+ cycles (10–15 years lifespan), 90% depth of discharge, fast 2-hour charging, compact and lightweight.
- **Gel Deep Cycle**: 1,200–1,500 cycles (3–4 years lifespan), 50% recommended depth of discharge, heavier footprint, but lower upfront cost.

---

### 5. Can a hybrid solar inverter work without batteries?
Yes. Modern hybrid inverters (such as Sunsynk and Must) can operate in **grid-tied solar mode** without batteries during daytime sunshine hours, blending solar power directly with KPLC grid power. However, batteries are required if you need power during nighttime or during power outages.`,
    },
    {
      type: PageType.POLICY,
      title: "Privacy Policy",
      slug: "privacy-policy",
      isPublished: true,
      seoTitle: "Privacy Policy | Nuru Energy Kenya",
      seoDescription: "Our privacy policy explains how Nuru Energy collects, protects, and handles customer data in compliance with the Kenya Data Protection Act 2019.",
      seoKeywords: "privacy policy nuru energy, kenya data protection act, customer data solar",
      body: `## Commitment to Customer Privacy

 Nuru Energy is committed to protecting the privacy of our customers and website visitors in accordance with the **Kenya Data Protection Act, 2019**.

---

### 1. Information We Collect
We collect personal information necessary to process orders, deliver equipment, and generate accurate quotations:
- Full Name and Company Name (for business accounts)
- Contact details (Phone number, WhatsApp number, Email address)
- Delivery and billing address (County, Town, Street/Building)
- Equipment inquiries and site specifications

---

### 2. How We Use Your Information
- To process, verify, and dispatch your equipment orders.
- To provide SMS and WhatsApp shipment tracking updates.
- To generate official tax invoices, delivery notes, and warranty certificates.
- We **never** sell, rent, or trade your personal information to third-party marketing companies.

---

### 3. Data Security
All order transactions and customer records are transmitted over encrypted HTTPS connections and stored on secure enterprise database infrastructure with strict role-based access control.`,
    },
    {
      type: PageType.POLICY,
      title: "Terms and Conditions of Sale",
      slug: "terms-conditions",
      isPublished: true,
      seoTitle: "Terms and Conditions of Sale | Nuru Energy Kenya",
      seoDescription: "Read the official terms and conditions for purchasing solar, power, and machinery equipment at Nuru Energy in Kenya.",
      seoKeywords: "terms of sale nuru energy, quotation terms solar kenya, sales conditions nairobi",
      body: `## Official Terms & Conditions of Sale

By browsing this storefront, requesting quotations, or placing orders with Nuru Energy, you agree to the following terms and conditions:

---

### 1. Pricing and Quotations
- All prices displayed on the storefront are quoted in **Kenyan Shillings (KES)**.
- Formal quotation documents issued by Nuru Energy remain valid for **14 calendar days** from the date of issue.
- Prices are subject to revision in the event of major statutory tax amendments or foreign exchange fluctuations for non-confirmed orders.

---

### 2. Payment Terms
- Full payment or verified payment arrangement is required prior to equipment dispatch from our Nairobi warehouse.
- Payments must be made exclusively through official company channels (Official M-PESA Paybill/Till, Company Bank Accounts).

---

### 3. Title and Risk of Loss
- Risk of loss transfers to the customer upon handover of goods to the designated courier or upon customer collection at our showroom.
- Title and ownership of equipment pass to the buyer upon receipt of full cleared payment.`,
    },
  ];

  for (const page of pages) {
    await db.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  console.log(`✓ Seeded ${pages.length} Static & Policy Pages.`);
}

async function main() {
  console.log("🚀 Starting Nuru Energy CSV-driven Seed...");
  await seedOwner();
  const brandMap = await seedBrandsFromCsv();
  const categoryMap = await seedCategoriesFromCsv();
  await seedProductsFromCsv(brandMap, categoryMap);
  await activateAllDraftProducts();
  await seedSolutionPages();
  await seedStaticAndPolicyPages();
  console.log("✅ Seed, activation, solutions and policy pages completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
