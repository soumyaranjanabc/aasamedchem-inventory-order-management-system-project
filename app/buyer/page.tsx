import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { DbEmptyState } from "@/components/db-empty-state";
import { hasDatabaseUrl } from "@/lib/db";
import { listOrdersForBuyer, listProducts } from "@/lib/db/queries";
import { formatInr } from "@/lib/money";
import { formatQuantity } from "@/lib/units/convert";
import { redirect } from "next/navigation";
import { createQuotationAction, placeOrderAction } from "./actions";
import { QuotationForm } from "./quotation-form";

export default async function BuyerPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "buyer") redirect("/login");

  const [products, orders] = await Promise.all([
    listProducts(),
    listOrdersForBuyer(session.user.id),
  ]);

  return (
    <DashboardShell name={session.user.name} role={session.user.role}>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Buyer workspace</h1>
        <p className="mt-2 text-slate-600">
          Browse seller listings, submit buyer proof, and place approved orders.
        </p>
      </div>
      {!hasDatabaseUrl() ? <DbEmptyState /> : null}
      <section className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          {products.map((product) => (
            <article key={product.id} className="rounded-md border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                    {product.category}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{product.description}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Seller: {product.sellerName ?? "AasaMedChem"}
                  </p>
                </div>
                <div className="rounded-md bg-slate-50 px-3 py-2 text-sm">
                  <p className="text-slate-500">Price</p>
                  <p className="font-semibold">
                    {formatInr(product.basePricePaise)} / {product.baseUnit}
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-slate-500">SKU</dt>
                  <dd className="font-medium">{product.sku}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Stock</dt>
                  <dd className="font-medium">
                    {formatQuantity(product.stockBaseQty, product.baseUnit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Minimum</dt>
                  <dd className="font-medium">
                    {formatQuantity(product.minOrderQty, product.baseUnit)}
                  </dd>
                </div>
              </dl>
              <QuotationForm product={product} action={createQuotationAction} />
            </article>
          ))}
          {products.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-white p-8 text-sm text-slate-500">
              No products are available yet.
            </div>
          ) : null}
        </div>
        <aside className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold">Your orders</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{order.orderNumber}</p>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs capitalize">
                    {order.status}
                  </span>
                </div>
                <p className="mt-2 font-semibold">{formatInr(order.totalPaise)}</p>
                <p className="mt-1 text-sm text-slate-500">{order.deliveryStatus}</p>
                {order.sellerReviewNotes ? (
                  <p className="mt-2 text-sm text-slate-600">
                    Seller note: {order.sellerReviewNotes}
                  </p>
                ) : null}
                {order.status === "approved" ? (
                  <form action={placeOrderAction} className="mt-3">
                    <input type="hidden" name="orderId" value={order.id} />
                    <button className="h-9 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800">
                      Place order
                    </button>
                  </form>
                ) : null}
              </div>
            ))}
            {orders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">
                Your quotations will appear here.
              </p>
            ) : null}
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
