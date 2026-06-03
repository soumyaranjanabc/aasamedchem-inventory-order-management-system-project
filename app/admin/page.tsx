import { auth } from "@/auth";
import { DashboardShell, Metric } from "@/components/dashboard-shell";
import { DbEmptyState } from "@/components/db-empty-state";
import { hasDatabaseUrl } from "@/lib/db";
import {
  getDashboardMetrics,
  listAllProductsForAdmin,
  listOrders,
  listSellers,
} from "@/lib/db/queries";
import { formatInr } from "@/lib/money";
import { formatQuantity } from "@/lib/units/convert";
import { redirect } from "next/navigation";
import { updateSellerControlsAction } from "./actions";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const [metrics, products, orders, sellers] = await Promise.all([
    getDashboardMetrics(),
    listAllProductsForAdmin(),
    listOrders(),
    listSellers(),
  ]);

  return (
    <DashboardShell name={session.user.name} role={session.user.role}>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Admin dashboard</h1>
        <p className="mt-2 text-slate-600">
          Manage sellers, commission, catalog health, and buyer orders.
        </p>
      </div>
      {!hasDatabaseUrl() ? <DbEmptyState /> : null}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric icon="products" label="Active products" value={metrics.productCount} />
        <Metric icon="products" label="Low stock items" value={metrics.lowStockCount} />
        <Metric icon="orders" label="Open quotations" value={metrics.quotedOrderCount} />
      </section>
      <section className="mt-8 rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">Seller controls</h2>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {sellers.map((seller) => (
            <form
              key={seller.id}
              action={updateSellerControlsAction}
              className="rounded-md border border-slate-200 p-4"
            >
              <input type="hidden" name="sellerId" value={seller.id} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{seller.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{seller.email}</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="isFlagged"
                    defaultChecked={seller.isFlagged}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-700"
                  />
                  Flag
                </label>
              </div>
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Commission %
                <input
                  name="commissionPercent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={(seller.commissionBps / 100).toFixed(2)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700"
                />
              </label>
              <button
                type="submit"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Save seller
              </button>
            </form>
          ))}
          {sellers.length === 0 ? (
            <p className="text-sm text-slate-500">No sellers have registered yet.</p>
          ) : null}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold">Inventory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Seller</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium">{product.name}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {product.sellerName ?? "Unassigned"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{product.sku}</td>
                    <td className="px-5 py-3">
                      {formatQuantity(product.stockBaseQty, product.baseUnit)}
                    </td>
                    <td className="px-5 py-3">
                      {formatInr(product.basePricePaise)} / {product.baseUnit}
                    </td>
                  </tr>
                ))}
                {products.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-slate-500" colSpan={5}>
                      No products yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold">Recent orders</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 8).map((order) => (
              <div key={order.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{order.orderNumber}</p>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs capitalize text-slate-700">
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{order.buyerName}</p>
                <p className="mt-2 font-semibold">{formatInr(order.totalPaise)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Commission: {formatInr(order.commissionPaise)}
                </p>
              </div>
            ))}
            {orders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">No orders yet.</p>
            ) : null}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
