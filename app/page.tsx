
import { auth } from "@/auth";
import { FlaskConical, LogIn, UserPlus, Shield, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user?.role) redirect(`/${session.user.role}`);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* ── Molecule SVG background pattern ── */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mol" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
              {/* atoms */}
              <circle cx="80" cy="80" r="5" fill="#34d399" />
              <circle cx="30" cy="40" r="4" fill="#34d399" />
              <circle cx="130" cy="40" r="4" fill="#34d399" />
              <circle cx="30" cy="120" r="4" fill="#34d399" />
              <circle cx="130" cy="120" r="4" fill="#34d399" />
              <circle cx="80" cy="10" r="3" fill="#6ee7b7" />
              <circle cx="80" cy="150" r="3" fill="#6ee7b7" />
              {/* bonds */}
              <line x1="80" y1="80" x2="30" y2="40" stroke="#34d399" strokeWidth="1.2" />
              <line x1="80" y1="80" x2="130" y2="40" stroke="#34d399" strokeWidth="1.2" />
              <line x1="80" y1="80" x2="30" y2="120" stroke="#34d399" strokeWidth="1.2" />
              <line x1="80" y1="80" x2="130" y2="120" stroke="#34d399" strokeWidth="1.2" />
              <line x1="80" y1="80" x2="80" y2="10" stroke="#34d399" strokeWidth="1.2" />
              <line x1="80" y1="80" x2="80" y2="150" stroke="#34d399" strokeWidth="1.2" />
              <line x1="30" y1="40" x2="130" y2="40" stroke="#34d399" strokeWidth="0.8" strokeDasharray="4 3" />
              <line x1="30" y1="120" x2="130" y2="120" stroke="#34d399" strokeWidth="0.8" strokeDasharray="4 3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mol)" />
        </svg>
      </div>

      {/* ── Gradient glow orbs ── */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-emerald-900/30 blur-[100px]" />

      {/* ── Top gradient fade ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* ── Main content ── */}
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">

        {/* Eyebrow badge */}
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/60 px-4 py-1.5 text-xs font-medium tracking-widest text-emerald-400 uppercase backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Trusted Chemical & Medical Supply Platform
        </div>

        <div className="max-w-3xl">
          {/* Logo mark */}
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/50">
            <FlaskConical className="h-7 w-7" aria-hidden="true" />
          </span>

          {/* Headline */}
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Aasa
            <span className="text-emerald-400">Med</span>
            Chem
          </h1>

          {/* Tagline */}
          <p className="mt-4 text-xl font-medium text-emerald-300 sm:text-2xl">
            Precision supply. Simplified.
          </p>

          {/* Sub-description */}
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
            End-to-end inventory management, INR pricing, unit conversion, verified buyer workflows,
            and real-time quotation tracking — built for chemical and medical supply chains.
          </p>

          {/* Stats row */}
          <div className="mt-8 flex flex-wrap gap-6">
            {[
              ["3 Roles", "Admin · Seller · Buyer"],
              ["INR Pricing", "Paise-accurate billing"],
              ["Smart Units", "Auto base-unit conversion"],
            ].map(([stat, label]) => (
              <div key={stat} className="flex flex-col">
                <span className="text-lg font-semibold text-white">{stat}</span>
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-500 hover:shadow-emerald-800/50"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-6 text-sm font-semibold text-slate-200 backdrop-blur-sm transition hover:border-slate-500 hover:bg-slate-700/60"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Sign Up
            </Link>
          </div>
        </div>

        {/* ── Role cards ── */}
        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Admin",
              copy: "Products, inventory, approvals, and full order visibility.",
              tag: "Full control",
              features: ["Flag sellers", "Adjust commission", "Platform oversight"],
            },
            {
              icon: Package,
              title: "Seller",
              copy: "Stock visibility and quotation activity for sales teams.",
              tag: "Manage supply",
              features: ["List & edit products", "Verify buyers", "Track orders"],
            },
            {
              icon: ShoppingCart,
              title: "Buyer",
              copy: "Product browsing, compatible units, and quotation requests.",
              tag: "Browse & order",
              features: ["Browse catalog", "Request quotations", "Place orders"],
            },
          ].map(({ icon: Icon, title, copy, tag, features }) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm transition hover:border-emerald-800/60 hover:bg-slate-900/80"
            >
              {/* card glow on hover */}
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-emerald-800/20 to-transparent" />
              </div>

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-900/60 text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                    {tag}
                  </span>
                </div>

                <h2 className="mt-4 text-base font-semibold text-white">{title}</h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-400">{copy}</p>

                <ul className="mt-4 space-y-1.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="h-1 w-1 rounded-full bg-emerald-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom footnote */}
        <p className="mt-12 text-center text-xs text-slate-600">
          Secured with NextAuth · Powered by Neon PostgreSQL · Built on Next.js 14
        </p>
      </section>
    </main>
  );
}
