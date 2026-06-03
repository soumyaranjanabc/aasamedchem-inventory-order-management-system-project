"use server";

import { auth } from "@/auth";
import { hasDatabaseUrl } from "@/lib/db";
import { updateSellerControls } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const sellerControlsSchema = z.object({
  sellerId: z.string().uuid(),
  isFlagged: z.coerce.boolean().default(false),
  commissionPercent: z.coerce.number().min(0).max(100),
});

export async function updateSellerControlsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Only admins can update seller controls.");
  }

  if (!hasDatabaseUrl()) {
    throw new Error("Connect Neon before updating sellers.");
  }

  const parsed = sellerControlsSchema.safeParse({
    ...Object.fromEntries(formData),
    isFlagged: formData.get("isFlagged") === "on",
  });

  if (!parsed.success) {
    throw new Error("Use a valid seller and commission percentage.");
  }

  await updateSellerControls({
    sellerId: parsed.data.sellerId,
    isFlagged: parsed.data.isFlagged,
    commissionBps: Math.round(parsed.data.commissionPercent * 100),
  });

  revalidatePath("/admin");
}
