import { signOut } from "@/auth";
import type { UserRole } from "@/lib/db/schema";
import { Boxes, ClipboardList, FlaskConical, LogOut, ShoppingCart } from "lucide-react";
import Link from "next/link";

const navItems: Record<UserRole, { href: string; label: string }[]> = {
  admin: [{ href: "/admin", label: "Admin" }],
  seller: [{ href: "/seller", label: "Seller" }],
  buyer: [{ href: "/buyer", label: "Buyer" }],
};

export function DashboardShell({
  children,
  name,
  role,
}: {
  children: React.ReactNode;
  name?: string | null;
  role: UserRole;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-700 text-white">
              <FlaskConical className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold">AasaMedChem</span>
              <span className="block text-xs uppercase tracking-wide text-slate-500">
                Inventory & Orders
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 sm:flex">
              {navItems[role].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="hidden text-right text-sm sm:block">
              <p className="font-medium">{name}</p>
              <p className="capitalize text-slate-500">{role}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export function Metric({
  icon,
  label,
  value,
}: {
  icon: "products" | "orders" | "cart";
  label: string;
  value: string | number;
}) {
  const Icon =
    icon === "products" ? Boxes : icon === "orders" ? ClipboardList : ShoppingCart;

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-emerald-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}
