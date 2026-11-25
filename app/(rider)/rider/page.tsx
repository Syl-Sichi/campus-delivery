import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { format } from "date-fns";
import { RiderAcceptButton } from "@/components/rider-accept-button";
import { RiderStatusToggle } from "@/components/rider-status-toggle";

export default async function RiderAvailablePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rider = await db.rider.findUnique({
    where: { userId: session.user.id },
  });

  if (!rider) redirect("/dashboard");

  // Orders ready for pickup that have no rider yet
  const availableOrders = await db.order.findMany({
    where: {
      status: "READY_FOR_PICKUP",
      riderId: null,
      deliveryType: "DELIVERY",
    },
    include: {
      vendor: { select: { name: true } },
      address: true,
      items: { include: { menuItem: { select: { name: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Available Deliveries</h1>
        <RiderStatusToggle currentStatus={rider.status} />
      </div>

      {rider.status === "OFFLINE" && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            You are offline. Go online to see and accept deliveries.
          </CardContent>
        </Card>
      )}

      {rider.status !== "OFFLINE" && availableOrders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No deliveries available right now. Check back soon!
          </CardContent>
        </Card>
      )}

      {rider.status !== "OFFLINE" && availableOrders.length > 0 && (
        <div className="space-y-4">
          {availableOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{order.vendor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.orderNumber} • {format(order.createdAt, "h:mm a")}
                    </p>
                  </div>
                  <Badge className={getOrderStatusColor(order.status)}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </div>

                <div className="text-sm">
                  {order.items.map((item) => (
                    <p key={item.id}>
                      {item.quantity}× {item.menuItem.name}
                    </p>
                  ))}
                </div>

                {order.address && (
                  <p className="text-sm text-muted-foreground">
                    Deliver to: {order.address.label} — {order.address.building}{" "}
                    {order.address.room}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-semibold">{formatCurrency(order.deliveryFee)} delivery fee</span>
                  <RiderAcceptButton orderId={order.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
