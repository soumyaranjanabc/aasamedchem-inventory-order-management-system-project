"use client";

import { compatibleUnits, formatQuantity } from "@/lib/units/convert";
import type { BaseUnit } from "@/lib/db/schema";
import { useFormState, useFormStatus } from "react-dom";

type Product = {
  id: string;
  baseUnit: BaseUnit;
  minOrderQty: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
    >
      {pending ? "Sending..." : "Request quote"}
    </button>
  );
}

export function QuotationForm({
  product,
  action,
}: {
  product: Product;
  action: (formData: FormData) => Promise<{ ok?: boolean; error?: string } | void>;
}) {
  const [state, formAction] = useFormState(async (_: unknown, formData: FormData) => {
    return action(formData);
  }, undefined);
  const units = compatibleUnits(product.baseUnit);

  return (
    <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px_auto]">
      <input type="hidden" name="productId" value={product.id} />
      <label className="text-sm font-medium text-slate-700">
        Quantity
        <input
          name="orderedQty"
          type="number"
          step="0.001"
          min="0"
          required
          placeholder={formatQuantity(product.minOrderQty, product.baseUnit)}
          className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Unit
        <select
          name="orderedUnit"
          className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700"
        >
          {units.map((unit) => (
            <option key={unit.symbol} value={unit.symbol}>
              {unit.symbol}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <SubmitButton />
      </div>
      <label className="sm:col-span-3 text-sm font-medium text-slate-700">
        Buyer proof
        <input
          name="buyerProof"
          required
          placeholder="GSTIN, license number, purchase authorization, or proof link"
          className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700"
        />
      </label>
      <label className="sm:col-span-3 text-sm font-medium text-slate-700">
        Notes
        <input
          name="notes"
          placeholder="Packaging, delivery, or quotation notes"
          className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700"
        />
      </label>
      {state?.error ? (
        <p className="sm:col-span-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="sm:col-span-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Quotation requested.
        </p>
      ) : null}
    </form>
  );
}
