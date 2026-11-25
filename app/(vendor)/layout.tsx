import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VendorNav } from "@/components/vendor-nav";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "VENDOR" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <VendorNav user={session.user} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
