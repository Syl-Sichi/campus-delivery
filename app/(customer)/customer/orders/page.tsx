import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { format } from "date-fns";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await db.order.findMany({
    where: { customerId: session.user.id },
    include: {
      vendor: { select: { name: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Your Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No orders yet.</p>
            <Link href="/customer" className="text-primary hover:underline text-sm mt-2 inline-block">
              Browse vendors
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/customer/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{order.vendor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.orderNumber} • {format(order.createdAt, "MMM d, h:mm a")}
                      </p>
                      <p className="text-sm mt-1">
                        {order.items.length} item{order.items.length > 1 ? "s" : ""} •{" "}
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
