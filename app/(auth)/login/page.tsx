import { AuthForm } from "../auth-form";
import { loginAction } from "../actions";
import Link from "next/link";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { registered?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Access your AasaMedChem workspace.
        </p>
        {searchParams.registered ? (
          <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Account created. Sign in with your new buyer account.
          </p>
        ) : null}
        <div className="mt-6">
          <AuthForm action={loginAction} mode="login" />
        </div>
        <p className="mt-5 text-sm text-slate-600">
          New buyer?{" "}
          <Link className="font-medium text-emerald-700" href="/register">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
