import { auth } from "@/auth";
import { DashboardShell, Metric } from "@/components/dashboard-shell";
import { DbEmptyState } from "@/components/db-empty-state";
import { hasDatabaseUrl } from "@/lib/db";
import { getUserById, listOrdersForSeller, listProductsForSeller } from "@/lib/db/queries";
import { formatInr } from "@/lib/money";
import { redirect } from "next/navigation";
import {
  createSellerProductAction,
  reviewQuotationAction,
  updateDeliveryStatusAction,
  updateSellerProductAction,
} from "./actions";

export default async function SellerPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "seller") redirect("/login");

  const [products, orders, seller] = await Promise.all([
    listProductsForSeller(session.user.id),
    listOrdersForSeller(session.user.id),
    getUserById(session.user.id),
  ]);

  return (
    <DashboardShell name={session.user.name} role={session.user.role}>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Seller dashboard</h1>
        <p className="mt-2 text-slate-600">
          List products, update price and stock, validate buyers, and manage delivery.
        </p>
      </div>
      {!hasDatabaseUrl() ? <DbEmptyState /> : null}
      {seller?.isFlagged ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Your seller account is flagged by admin. New listings and buyer orders are blocked.
        </div>
      ) : null}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric icon="products" label="Your products" value={products.length} />
        <Metric
          icon="orders"
          label="Seller commission"
          value={`${((seller?.commissionBps ?? 0) / 100).toFixed(2)}%`}
        />
        <Metric icon="orders" label="Incoming orders" value={orders.length} />
      </section>

      <section className="mt-8 rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">List a product</h2>
        </div>
        <form action={createSellerProductAction} className="grid gap-4 p-5 md:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Product name
            <input name="name" required className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            SKU
            <input name="sku" required className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Category
            <input name="category" required className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Base unit
            <select name="baseUnit" className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700">
              <option value="g">g</option>
              <option value="mL">mL</option>
              <option value="unit">unit</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Price per base unit (INR)
            <input name="basePriceRupees" type="number" step="0.01" min="0" required className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Stock in base unit
            <input name="stockBaseQty" type="number" step="0.001" min="0" required className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Minimum order quantity
            <input name="minOrderQty" type="number" step="0.001" min="0" required className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Description
            <input name="description" required className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" />
          </label>
          <div className="flex items-end">
            <button type="submit" className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
              Add product
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">Your listings</h2>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <form key={product.id} action={updateSellerProductAction} className="rounded-md border border-slate-200 p-4">
              <input type="hidden" name="productId" value={product.id} />
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">{product.category}</p>
              <h3 className="mt-2 font-semibold">{product.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{product.sku}</p>
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Price per {product.baseUnit} (INR)
                <input name="basePriceRupees" type="number" step="0.01" min="0" defaultValue={(product.basePricePaise / 100).toFixed(2)} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" />
              </label>
              <label className="mt-3 block text-sm font-medium text-slate-700">
                Stock ({product.baseUnit})
                <input name="stockBaseQty" type="number" step="0.001" min="0" defaultValue={Number(product.stockBaseQty)} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700" />
              </label>
              <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="isActive" defaultChecked={product.isActive} className="h-4 w-4 rounded border-slate-300 text-emerald-700" />
                Active listing
              </label>
              <button type="submit" className="mt-4 h-10 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800">
                Save listing
              </button>
            </form>
          ))}
          {products.length === 0 ? (
            <p className="text-sm text-slate-500">You have not listed products yet.</p>
          ) : null}
        </div>
      </section>

      <section className="mt-8 rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">Buyer validation and orders</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.map((order) => (
            <article key={order.id} className="px-5 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {order.buyerName} · {order.buyerEmail}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">Proof: {order.buyerProof}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Delivery: {order.deliveryStatus}
                  </p>
                </div>
                <div className="text-sm md:text-right">
                  <p className="font-semibold">{formatInr(order.totalPaise)}</p>
                  <p className="text-slate-500">Admin commission {formatInr(order.commissionPaise)}</p>
                  <span className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs capitalize">
                    {order.status}
                  </span>
                </div>
              </div>
              {order.status === "quoted" ? (
                <form action={reviewQuotationAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                  <input type="hidden" name="orderId" value={order.id} />
                  <input name="sellerReviewNotes" placeholder="Review note for buyer" className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-700" />
                  <button name="decision" value="approve" className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
                    Approve
                  </button>
                  <button name="decision" value="reject" className="h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800">
                    Reject
                  </button>
                </form>
              ) : null}
              {["confirmed", "processing", "shipped"].includes(order.status) ? (
                <form action={updateDeliveryStatusAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input type="hidden" name="orderId" value={order.id} />
                  <select name="status" className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-700">
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="fulfilled">Delivered</option>
                  </select>
                  <button className="h-10 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800">
                    Update delivery
                  </button>
                </form>
              ) : null}
            </article>
          ))}
          {orders.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500">No buyer requests yet.</p>
          ) : null}
        </div>
      </section>
    </DashboardShell>
  );
}
