export function DbEmptyState() {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Connect Neon by copying <code>.env.example</code> to{" "}
      <code>.env.local</code>, setting <code>DATABASE_URL</code> and{" "}
      <code>AUTH_SECRET</code>, then run <code>npm run db:push</code> and{" "}
      <code>npm run db:seed</code>.
    </div>
  );
}
