"use server";

import { signIn } from "@/auth";
import { createUser, getUserByEmail } from "@/lib/db/queries";
import { hasDatabaseUrl } from "@/lib/db";
import { databaseSetupMessage, isMissingTableError } from "@/lib/db/errors";
import type { UserRole } from "@/lib/db/schema";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["buyer", "seller"]).default("buyer"),
});

export async function loginAction(formData: FormData) {
  if (!hasDatabaseUrl()) {
    return { error: "Add DATABASE_URL in .env.local before signing in." };
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  if (!hasDatabaseUrl()) {
    return { error: "Add DATABASE_URL in .env.local before registering." };
  }

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Use a valid name, email, and 8+ character password." };
  }

  try {
    const email = parsed.data.email.toLowerCase();
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const passwordHash = await hash(parsed.data.password, 12);
    await createUser({
      name: parsed.data.name,
      email,
      passwordHash,
      role: parsed.data.role as Extract<UserRole, "buyer" | "seller">,
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return { error: databaseSetupMessage };
    }
    throw error;
  }

  redirect("/login?registered=1");
}
