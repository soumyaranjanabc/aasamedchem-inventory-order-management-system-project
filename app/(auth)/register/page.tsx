import { AuthForm } from "../auth-form";
import { registerAction } from "../actions";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create a buyer or seller account. Admin access is created from the
          seed script so it is not publicly self-registered.
        </p>
        <div className="mt-6">
          <AuthForm action={registerAction} mode="register" />
        </div>
        <p className="mt-5 text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-medium text-emerald-700" href="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
