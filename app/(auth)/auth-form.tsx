"use client";

import { useFormState, useFormStatus } from "react-dom";

type AuthAction = (formData: FormData) => Promise<{ error?: string } | void>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Working..." : label}
    </button>
  );
}

export function AuthForm({
  action,
  mode,
}: {
  action: AuthAction;
  mode: "login" | "register";
}) {
  const [state, formAction] = useFormState(async (_: unknown, formData: FormData) => {
    return action(formData);
  }, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "register" ? (
        <>
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              name="name"
              required
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Account type
            <select
              name="role"
              defaultValue="buyer"
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </label>
        </>
      ) : null}
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : undefined}
          className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-emerald-700"
        />
      </label>
      {state?.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <SubmitButton label={mode === "login" ? "Sign in" : "Create account"} />
    </form>
  );
}
