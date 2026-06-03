import {
  bigint,
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["admin", "seller", "buyer"]);
export const unitDimensionEnum = pgEnum("unit_dimension", [
  "weight",
  "volume",
  "count",
]);
export const baseUnitEnum = pgEnum("base_unit", ["g", "mL", "unit"]);
export const orderStatusEnum = pgEnum("order_status", [
  "draft",
  "quoted",
  "approved",
  "rejected",
  "confirmed",
  "processing",
  "shipped",
  "fulfilled",
  "cancelled",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("buyer"),
  isFlagged: boolean("is_flagged").notNull().default(false),
  commissionBps: integer("commission_bps").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const units = pgTable("units", {
  id: uuid("id").defaultRandom().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  dimension: unitDimensionEnum("dimension").notNull(),
  toBaseFactor: numeric("to_base_factor", { precision: 30, scale: 15 }).notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  sellerId: uuid("seller_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  description: text("description").notNull().default(""),
  category: varchar("category", { length: 100 }).notNull(),
  baseUnit: baseUnitEnum("base_unit").notNull(),
  basePricePaise: bigint("base_price_paise", { mode: "number" }).notNull(),
  stockBaseQty: numeric("stock_base_qty", { precision: 20, scale: 6 }).notNull(),
  minOrderQty: numeric("min_order_qty", { precision: 20, scale: 6 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => users.id),
  sellerId: uuid("seller_id").references(() => users.id),
  status: orderStatusEnum("status").notNull().default("quoted"),
  totalPaise: bigint("total_paise", { mode: "number" }).notNull().default(0),
  commissionBps: integer("commission_bps").notNull().default(0),
  commissionPaise: bigint("commission_paise", { mode: "number" }).notNull().default(0),
  buyerProof: text("buyer_proof").notNull().default(""),
  sellerReviewNotes: text("seller_review_notes").notNull().default(""),
  deliveryStatus: varchar("delivery_status", { length: 80 }).notNull().default("Not placed"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  placedAt: timestamp("placed_at", { withTimezone: true }),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  orderedUnit: varchar("ordered_unit", { length: 20 }).notNull(),
  orderedQty: numeric("ordered_qty", { precision: 20, scale: 6 }).notNull(),
  baseQty: numeric("base_qty", { precision: 20, scale: 6 }).notNull(),
  unitPricePaise: bigint("unit_price_paise", { mode: "number" }).notNull(),
  lineTotalPaise: bigint("line_total_paise", { mode: "number" }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type UnitDimension = (typeof unitDimensionEnum.enumValues)[number];
export type BaseUnit = (typeof baseUnitEnum.enumValues)[number];
