import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

const roleRoutes = {
  admin: "/admin",
  seller: "/seller",
  buyer: "/buyer",
} as const;

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;

  const protectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/buyer") ||
    pathname.startsWith("/dashboard");

  if (!session && protectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session?.user?.role;
  if (!role) return NextResponse.next();

  if (
    (pathname.startsWith("/admin") && role !== "admin") ||
    (pathname.startsWith("/seller") && role !== "seller") ||
    (pathname.startsWith("/buyer") && role !== "buyer")
  ) {
    return NextResponse.redirect(new URL(roleRoutes[role], request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/buyer/:path*", "/dashboard"],
};
