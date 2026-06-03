"use server";

import { auth } from "@/auth";
import { hasDatabaseUrl } from "@/lib/db";
import {
  createSellerProduct,
  reviewQuotation,
  updateDeliveryStatus,
  updateSellerProduct,
} from "@/lib/db/queries";
import { rupeesToPaise } from "@/lib/money";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  description: z.string().min(1),
  category: z.string().min(1),
  baseUnit: z.enum(["g", "mL", "unit"]),
  basePriceRupees: z.coerce.number().positive(),
  stockBaseQty: z.coerce.number().nonnegative(),
  minOrderQty: z.coerce.number().positive(),
});

const productUpdateSchema = z.object({
  productId: z.string().uuid(),
  basePriceRupees: z.coerce.number().positive(),
  stockBaseQty: z.coerce.number().nonnegative(),
  isActive: z.coerce.boolean().default(false),
});

const reviewSchema = z.object({
  orderId: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
  sellerReviewNotes: z.string().optional(),
});

const deliverySchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["processing", "shipped", "fulfilled"]),
});

export async function createSellerProductAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "seller") {
    throw new Error("Only sellers can list products.");
  }

  if (!hasDatabaseUrl()) throw new Error("Connect Neon before listing products.");

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error("Fill every product field with valid values.");
  }

  await createSellerProduct({
    sellerId: session.user.id,
    name: parsed.data.name,
    sku: parsed.data.sku,
    description: parsed.data.description,
    category: parsed.data.category,
    baseUnit: parsed.data.baseUnit,
    basePricePaise: rupeesToPaise(parsed.data.basePriceRupees),
    stockBaseQty: parsed.data.stockBaseQty.toFixed(6),
    minOrderQty: parsed.data.minOrderQty.toFixed(6),
  });
  revalidatePath("/seller");
}

export async function updateSellerProductAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "seller") {
    throw new Error("Only sellers can update products.");
  }

  const parsed = productUpdateSchema.safeParse({
    ...Object.fromEntries(formData),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) throw new Error("Use valid stock and price values.");

  await updateSellerProduct({
    sellerId: session.user.id,
    productId: parsed.data.productId,
    basePricePaise: rupeesToPaise(parsed.data.basePriceRupees),
    stockBaseQty: parsed.data.stockBaseQty.toFixed(6),
    isActive: parsed.data.isActive,
  });

  revalidatePath("/seller");
  revalidatePath("/buyer");
}

export async function reviewQuotationAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "seller") {
    throw new Error("Only sellers can review quotations.");
  }

  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Choose approve or reject.");

  await reviewQuotation({
    sellerId: session.user.id,
    orderId: parsed.data.orderId,
    approved: parsed.data.decision === "approve",
    sellerReviewNotes: parsed.data.sellerReviewNotes ?? "",
  });

  revalidatePath("/seller");
  revalidatePath("/buyer");
}

export async function updateDeliveryStatusAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "seller") {
    throw new Error("Only sellers can update delivery.");
  }

  const parsed = deliverySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Choose a valid delivery status.");

  await updateDeliveryStatus({
    sellerId: session.user.id,
    orderId: parsed.data.orderId,
    status: parsed.data.status,
  });

  revalidatePath("/seller");
  revalidatePath("/buyer");
}
