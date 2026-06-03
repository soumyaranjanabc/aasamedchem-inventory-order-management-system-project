import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { getUserByEmail } from "@/lib/db/queries";
import { authConfig } from "@/auth.config";
import { isMissingTableError } from "@/lib/db/errors";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        let user;
        try {
          user = await getUserByEmail(parsed.data.email.toLowerCase());
          if (!user) return null;
        } catch (error) {
          if (isMissingTableError(error)) return null;
          throw error;
        }

        const passwordIsValid = await compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!passwordIsValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
