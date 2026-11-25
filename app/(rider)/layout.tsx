import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RiderNav } from "@/components/rider-nav";

export default async function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "RIDER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <RiderNav user={session.user} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
