import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { format } from "date-fns";
import { VendorOrderActions } from "@/components/vendor-order-actions";

export default async function VendorDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const vendor = await db.vendor.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendor) redirect("/dashboard");

  const orders = await db.order.findMany({
    where: {
      vendorId: vendor.id,
      status: { notIn: ["DELIVERED", "CANCELLED"] },
    },
    include: {
      items: { include: { menuItem: true } },
      customer: { select: { name: true, phone: true } },
      address: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const todayStats = await db.order.aggregate({
    where: {
      vendorId: vendor.id,
      createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      status: { not: "CANCELLED" },
    },
    _count: true,
    _sum: { total: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{vendor.name}</h1>
          <p className="text-muted-foreground">
            {vendor.isOpen ? (
              <span className="text-green-600">Open</span>
            ) : (
              <span className="text-red-600">Closed</span>
            )}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Today&apos;s Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayStats._count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Today&apos;s Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(todayStats._sum.total || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Orders */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Active Orders ({orders.length})</h2>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No active orders right now.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer.name} • {format(order.createdAt, "h:mm a")}
                      </p>
                    </div>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </div>

                  <div className="text-sm space-y-1">
                    {order.items.map((item) => (
                      <p key={item.id}>
                        {item.quantity}× {item.menuItem.name}
                      </p>
                    ))}
                  </div>

                  {order.address && (
                    <p className="text-sm text-muted-foreground">
                      Deliver to: {order.address.label} ({order.address.building} {order.address.room})
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold">{formatCurrency(order.total)}</span>
                    <VendorOrderActions orderId={order.id} status={order.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
