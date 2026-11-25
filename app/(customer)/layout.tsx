import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerNav } from "@/components/customer-nav";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <CustomerNav user={session.user} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
