import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.role) redirect("/login");

  redirect(`/${session.user.role}`);
}
