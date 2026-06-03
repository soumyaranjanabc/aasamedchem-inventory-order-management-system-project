"use server";

import { auth } from "@/auth";
import { createQuotation, placeApprovedOrder } from "@/lib/db/queries";
import { hasDatabaseUrl } from "@/lib/db";
import { convertToBase } from "@/lib/units/convert";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const quotationSchema = z.object({
  productId: z.string().uuid(),
  orderedUnit: z.string().min(1),
  orderedQty: z.coerce.number().positive(),
  buyerProof: z.string().min(8),
  notes: z.string().optional(),
});

const placeOrderSchema = z.object({
  orderId: z.string().uuid(),
});

export async function createQuotationAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "buyer") {
    return { error: "You must be signed in as a buyer." };
  }

  if (!hasDatabaseUrl()) {
    return { error: "Connect Neon before creating quotations." };
  }

  const parsed = quotationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Choose a product, compatible unit, and valid quantity." };
  }

  try {
    const baseQty = convertToBase(
      parsed.data.orderedQty,
      parsed.data.orderedUnit,
    );

    await createQuotation({
      buyerId: session.user.id,
      productId: parsed.data.productId,
      orderedUnit: parsed.data.orderedUnit,
      orderedQty: parsed.data.orderedQty.toFixed(6),
      baseQty: baseQty.toFixed(6),
      buyerProof: parsed.data.buyerProof,
      notes: parsed.data.notes,
    });

    revalidatePath("/buyer");
    return { ok: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create quotation.",
    };
  }
}

export async function placeOrderAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "buyer") {
    throw new Error("You must be signed in as a buyer.");
  }

  const parsed = placeOrderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid order.");

  await placeApprovedOrder({
    buyerId: session.user.id,
    orderId: parsed.data.orderId,
  });
  revalidatePath("/buyer");
  revalidatePath("/seller");
}
