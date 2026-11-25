import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { RiderDeliveryActions } from "@/components/rider-delivery-actions";

export default async function RiderActivePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rider = await db.rider.findUnique({
    where: { userId: session.user.id },
  });

  if (!rider) redirect("/dashboard");

  const activeOrders = await db.order.findMany({
    where: {
      riderId: rider.id,
      status: { in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"] },
    },
    include: {
      vendor: { select: { name: true } },
      address: true,
      customer: { select: { name: true, phone: true } },
      items: { include: { menuItem: { select: { name: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Active Deliveries</h1>

      {activeOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No active deliveries. Go accept some from the Available tab!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{order.vendor.name}</p>
                    <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
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
                  <div className="text-sm bg-slate-50 p-3 rounded-md">
                    <p className="font-medium">Deliver to</p>
                    <p>{order.address.label}</p>
                    <p className="text-muted-foreground">
                      {order.address.building} {order.address.room && `• Room ${order.address.room}`}
                    </p>
                    {order.customer.phone && (
                      <p className="text-muted-foreground mt-1">Customer: {order.customer.phone}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-semibold">{formatCurrency(order.deliveryFee)}</span>
                  <RiderDeliveryActions orderId={order.id} status={order.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
