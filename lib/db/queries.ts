import { and, desc, eq, isNull, or, sql } from "drizzle-orm";
import { db, hasDatabaseUrl } from "./index";
import { orderItems, orders, products, units, users } from "./schema";

export async function getUserByEmail(email: string) {
  if (!hasDatabaseUrl()) return null;
  const [user] = await db().select().from(users).where(eq(users.email, email));
  return user ?? null;
}

export async function getUserById(id: string) {
  if (!hasDatabaseUrl()) return null;
  const [user] = await db().select().from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role?: "buyer" | "seller" | "admin";
}) {
  const [user] = await db()
    .insert(users)
    .values({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role ?? "buyer",
    })
    .returning();
  return user;
}

export async function listSellers() {
  if (!hasDatabaseUrl()) return [];
  return db()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isFlagged: users.isFlagged,
      commissionBps: users.commissionBps,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "seller"))
    .orderBy(desc(users.createdAt));
}

export async function updateSellerControls(input: {
  sellerId: string;
  isFlagged: boolean;
  commissionBps: number;
}) {
  await db()
    .update(users)
    .set({
      isFlagged: input.isFlagged,
      commissionBps: input.commissionBps,
    })
    .where(and(eq(users.id, input.sellerId), eq(users.role, "seller")));
}

export async function listProducts() {
  if (!hasDatabaseUrl()) return [];
  return db()
    .select({
      id: products.id,
      sellerId: products.sellerId,
      name: products.name,
      sku: products.sku,
      description: products.description,
      category: products.category,
      baseUnit: products.baseUnit,
      basePricePaise: products.basePricePaise,
      stockBaseQty: products.stockBaseQty,
      minOrderQty: products.minOrderQty,
      isActive: products.isActive,
      createdAt: products.createdAt,
      sellerName: users.name,
      sellerEmail: users.email,
      sellerIsFlagged: users.isFlagged,
    })
    .from(products)
    .leftJoin(users, eq(products.sellerId, users.id))
    .where(
      and(
        eq(products.isActive, true),
        or(isNull(products.sellerId), eq(users.isFlagged, false)),
      ),
    )
    .orderBy(desc(products.createdAt));
}

export async function listAllProductsForAdmin() {
  if (!hasDatabaseUrl()) return [];
  return db()
    .select({
      id: products.id,
      sellerId: products.sellerId,
      name: products.name,
      sku: products.sku,
      description: products.description,
      category: products.category,
      baseUnit: products.baseUnit,
      basePricePaise: products.basePricePaise,
      stockBaseQty: products.stockBaseQty,
      minOrderQty: products.minOrderQty,
      isActive: products.isActive,
      createdAt: products.createdAt,
      sellerName: users.name,
      sellerEmail: users.email,
      sellerIsFlagged: users.isFlagged,
    })
    .from(products)
    .leftJoin(users, eq(products.sellerId, users.id))
    .orderBy(desc(products.createdAt));
}

export async function listProductsForSeller(sellerId: string) {
  if (!hasDatabaseUrl()) return [];
  return db()
    .select()
    .from(products)
    .where(eq(products.sellerId, sellerId))
    .orderBy(desc(products.createdAt));
}

export async function createSellerProduct(input: {
  sellerId: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  baseUnit: "g" | "mL" | "unit";
  basePricePaise: number;
  stockBaseQty: string;
  minOrderQty: string;
}) {
  const seller = await getUserById(input.sellerId);
  if (!seller || seller.role !== "seller") throw new Error("Seller not found.");
  if (seller.isFlagged) {
    throw new Error("This seller is flagged and cannot list new products.");
  }

  const [product] = await db()
    .insert(products)
    .values({
      ...input,
      sku: input.sku.toUpperCase(),
      isActive: true,
    })
    .returning();
  return product;
}

export async function updateSellerProduct(input: {
  sellerId: string;
  productId: string;
  basePricePaise: number;
  stockBaseQty: string;
  isActive: boolean;
}) {
  await db()
    .update(products)
    .set({
      basePricePaise: input.basePricePaise,
      stockBaseQty: input.stockBaseQty,
      isActive: input.isActive,
    })
    .where(and(eq(products.id, input.productId), eq(products.sellerId, input.sellerId)));
}

export async function listUnits() {
  if (!hasDatabaseUrl()) return [];
  return db().select().from(units);
}

export async function listOrders() {
  if (!hasDatabaseUrl()) return [];
  return db()
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalPaise: orders.totalPaise,
      commissionBps: orders.commissionBps,
      commissionPaise: orders.commissionPaise,
      buyerProof: orders.buyerProof,
      deliveryStatus: orders.deliveryStatus,
      notes: orders.notes,
      createdAt: orders.createdAt,
      buyerName: users.name,
      buyerEmail: users.email,
      sellerId: orders.sellerId,
    })
    .from(orders)
    .innerJoin(users, eq(orders.buyerId, users.id))
    .orderBy(desc(orders.createdAt));
}

export async function listOrdersForBuyer(buyerId: string) {
  if (!hasDatabaseUrl()) return [];
  return db()
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalPaise: orders.totalPaise,
      commissionPaise: orders.commissionPaise,
      buyerProof: orders.buyerProof,
      sellerReviewNotes: orders.sellerReviewNotes,
      deliveryStatus: orders.deliveryStatus,
      notes: orders.notes,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.buyerId, buyerId))
    .orderBy(desc(orders.createdAt));
}

export async function listOrdersForSeller(sellerId: string) {
  if (!hasDatabaseUrl()) return [];
  return db()
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalPaise: orders.totalPaise,
      commissionPaise: orders.commissionPaise,
      buyerProof: orders.buyerProof,
      sellerReviewNotes: orders.sellerReviewNotes,
      deliveryStatus: orders.deliveryStatus,
      notes: orders.notes,
      createdAt: orders.createdAt,
      buyerName: users.name,
      buyerEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(orders.buyerId, users.id))
    .where(eq(orders.sellerId, sellerId))
    .orderBy(desc(orders.createdAt));
}

export async function getDashboardMetrics() {
  if (!hasDatabaseUrl()) {
    return { productCount: 0, lowStockCount: 0, quotedOrderCount: 0 };
  }

  const [productCount] = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.isActive, true));

  const [lowStockCount] = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        sql`${products.stockBaseQty} <= ${products.minOrderQty}`,
      ),
    );

  const [quotedOrderCount] = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.status, "quoted"));

  return {
    productCount: productCount.count,
    lowStockCount: lowStockCount.count,
    quotedOrderCount: quotedOrderCount.count,
  };
}

export async function createQuotation(input: {
  buyerId: string;
  productId: string;
  orderedUnit: string;
  orderedQty: string;
  baseQty: string;
  buyerProof: string;
  notes?: string;
}) {
  const [product] = await db()
    .select()
    .from(products)
    .where(eq(products.id, input.productId));

  if (!product || !product.isActive) {
    throw new Error("Product not found.");
  }

  if (!product.sellerId) {
    throw new Error("This product is not linked to a seller yet.");
  }

  const seller = await getUserById(product.sellerId);
  if (!seller || seller.role !== "seller") {
    throw new Error("Seller not found.");
  }

  if (seller.isFlagged) {
    throw new Error("This seller is currently flagged and cannot accept orders.");
  }

  const baseQtyNumber = Number(input.baseQty);
  if (baseQtyNumber < Number(product.minOrderQty)) {
    throw new Error("Quantity is below the product minimum order quantity.");
  }

  if (baseQtyNumber > Number(product.stockBaseQty)) {
    throw new Error("Requested quantity exceeds available stock.");
  }

  const lineTotalPaise = Math.round(baseQtyNumber * product.basePricePaise);
  const commissionPaise = Math.round((lineTotalPaise * seller.commissionBps) / 10000);
  const orderNumber = `AMC-${Date.now()}`;

  const [order] = await db()
    .insert(orders)
    .values({
      orderNumber,
      buyerId: input.buyerId,
      sellerId: seller.id,
      status: "quoted",
      totalPaise: lineTotalPaise,
      commissionBps: seller.commissionBps,
      commissionPaise,
      buyerProof: input.buyerProof,
      deliveryStatus: "Awaiting seller validation",
      notes: input.notes ?? "",
    })
    .returning();

  await db().insert(orderItems).values({
    orderId: order.id,
    productId: product.id,
    orderedUnit: input.orderedUnit,
    orderedQty: input.orderedQty,
    baseQty: input.baseQty,
    unitPricePaise: product.basePricePaise,
    lineTotalPaise,
  });

  return order;
}

export async function reviewQuotation(input: {
  sellerId: string;
  orderId: string;
  approved: boolean;
  sellerReviewNotes: string;
}) {
  await db()
    .update(orders)
    .set({
      status: input.approved ? "approved" : "rejected",
      sellerReviewNotes: input.sellerReviewNotes,
      deliveryStatus: input.approved ? "Approved. Buyer can place order" : "Rejected",
      approvedAt: input.approved ? new Date() : null,
    })
    .where(
      and(
        eq(orders.id, input.orderId),
        eq(orders.sellerId, input.sellerId),
        eq(orders.status, "quoted"),
      ),
    );
}

export async function placeApprovedOrder(input: { buyerId: string; orderId: string }) {
  const orderRows = await db()
    .select()
    .from(orders)
    .where(and(eq(orders.id, input.orderId), eq(orders.buyerId, input.buyerId)));

  const order = orderRows[0];
  if (!order || order.status !== "approved") {
    throw new Error("Only seller-approved quotations can be placed as orders.");
  }

  const items = await db()
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  for (const item of items) {
    await db()
      .update(products)
      .set({
        stockBaseQty: sql`${products.stockBaseQty} - ${item.baseQty}`,
      })
      .where(
        and(
          eq(products.id, item.productId),
          sql`${products.stockBaseQty} >= ${item.baseQty}`,
        ),
      );
  }

  await db()
    .update(orders)
    .set({
      status: "confirmed",
      deliveryStatus: "Order placed",
      placedAt: new Date(),
    })
    .where(and(eq(orders.id, input.orderId), eq(orders.buyerId, input.buyerId)));
}

export async function updateDeliveryStatus(input: {
  sellerId: string;
  orderId: string;
  status: "processing" | "shipped" | "fulfilled";
}) {
  await db()
    .update(orders)
    .set({
      status: input.status,
      deliveryStatus:
        input.status === "processing"
          ? "Processing"
          : input.status === "shipped"
            ? "Shipped"
            : "Delivered",
    })
    .where(and(eq(orders.id, input.orderId), eq(orders.sellerId, input.sellerId)));
}
