import { config } from "dotenv";
import { hash } from "bcryptjs";
import { eq, isNull } from "drizzle-orm";
import { db } from "../lib/db";
import { products, units, users } from "../lib/db/schema";

config({ path: ".env.local" });

async function main() {
  const database = db();

  await database
    .insert(units)
    .values([
      { symbol: "g", name: "Grams", dimension: "weight", toBaseFactor: "1" },
      { symbol: "kg", name: "Kilograms", dimension: "weight", toBaseFactor: "1000" },
      { symbol: "mL", name: "Milliliters", dimension: "volume", toBaseFactor: "1" },
      { symbol: "L", name: "Liters", dimension: "volume", toBaseFactor: "1000" },
      { symbol: "unit", name: "Unit", dimension: "count", toBaseFactor: "1" },
    ])
    .onConflictDoNothing({ target: units.symbol });

  const [adminHash, sellerHash, buyerHash] = await Promise.all([
    hash("Admin@123", 12),
    hash("Seller@123", 12),
    hash("Buyer@123", 12),
  ]);

  await database
    .insert(users)
    .values([
      {
        name: "Aasa Admin",
        email: "admin@aasa.com",
        passwordHash: adminHash,
        role: "admin",
      },
      {
        name: "Aasa Seller",
        email: "seller@aasa.com",
        passwordHash: sellerHash,
        role: "seller",
      },
      {
        name: "Aasa Buyer",
        email: "buyer@aasa.com",
        passwordHash: buyerHash,
        role: "buyer",
      },
    ])
    .onConflictDoNothing({ target: users.email });

  const [seller] = await database
    .select()
    .from(users)
    .where(eq(users.email, "seller@aasa.com"));
  if (!seller) throw new Error("Seed seller was not created.");

  await database
    .insert(products)
    .values([
      {
        sellerId: seller.id,
        name: "Sodium Chloride AR Grade",
        sku: "AMC-NACL-AR-001",
        description: "Analytical reagent grade sodium chloride for laboratory use.",
        category: "Salts",
        baseUnit: "g",
        basePricePaise: 12,
        stockBaseQty: "250000.000000",
        minOrderQty: "100.000000",
      },
      {
        sellerId: seller.id,
        name: "Ethanol 99.9%",
        sku: "AMC-ETH-999-005",
        description: "High-purity ethanol supplied for controlled lab workflows.",
        category: "Solvents",
        baseUnit: "mL",
        basePricePaise: 8,
        stockBaseQty: "500000.000000",
        minOrderQty: "500.000000",
      },
      {
        sellerId: seller.id,
        name: "Nitrile Gloves Box",
        sku: "AMC-NGLV-M-100",
        description: "Powder-free nitrile gloves, medium size, 100 pieces per box.",
        category: "Consumables",
        baseUnit: "unit",
        basePricePaise: 45000,
        stockBaseQty: "120.000000",
        minOrderQty: "1.000000",
      },
      {
        sellerId: seller.id,
        name: "Acetonitrile HPLC Grade",
        sku: "AMC-ACN-HPLC-010",
        description: "HPLC grade acetonitrile for chromatography and synthesis.",
        category: "Solvents",
        baseUnit: "mL",
        basePricePaise: 24,
        stockBaseQty: "85000.000000",
        minOrderQty: "1000.000000",
      },
    ])
    .onConflictDoNothing({ target: products.sku });

  await database
    .update(products)
    .set({ sellerId: seller.id })
    .where(isNull(products.sellerId));
}

main()
  .then(() => {
    console.log("Seed complete.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
