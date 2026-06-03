import { auth } from "@/auth";
import { FlaskConical, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user?.role) redirect(`/${session.user.role}`);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-700 text-white">
            <FlaskConical className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            AasaMedChem
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Inventory, unit conversion, INR pricing, quotations, and order
            tracking for chemical and medical supply workflows.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Sign Up
            </Link>
          </div>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["Admin", "Products, inventory, approvals, and full order visibility."],
            ["Seller", "Stock visibility and quotation activity for sales teams."],
            ["Buyer", "Product browsing, compatible units, and quotation requests."],
          ].map(([title, copy]) => (
            <article key={title} className="rounded-md border border-slate-200 bg-white p-5">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
