import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  switch (role) {
    case "VENDOR":
      redirect("/vendor");
    case "RIDER":
      redirect("/rider");
    case "ADMIN":
      redirect("/admin");
    default:
      redirect("/customer");
  }
}
