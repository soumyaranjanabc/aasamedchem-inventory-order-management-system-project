export function isMissingTableError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const candidate = error as {
    code?: unknown;
    cause?: { code?: unknown; message?: unknown };
    message?: unknown;
  };

  return (
    candidate.code === "42P01" ||
    candidate.cause?.code === "42P01" ||
    String(candidate.message ?? "").includes("relation") ||
    String(candidate.cause?.message ?? "").includes("relation")
  );
}

export const databaseSetupMessage =
  "Database tables are missing. Run npm run db:push, then npm run db:seed.";
