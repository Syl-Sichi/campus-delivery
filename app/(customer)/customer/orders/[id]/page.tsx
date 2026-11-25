import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { format } from "date-fns";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      vendor: true,
      items: { include: { menuItem: true } },
      address: true,
      rider: { include: { user: { select: { name: true, phone: true } } } },
    },
  });

  if (!order || order.customerId !== session.user.id) notFound();

  const steps = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "ASSIGNED",
    "PICKED_UP",
    "IN_TRANSIT",
    "DELIVERED",
  ];

  const currentStep = steps.indexOf(order.status);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {format(order.createdAt, "MMM d, yyyy • h:mm a")}
          </p>
        </div>
        <Badge className={getOrderStatusColor(order.status)}>
          {getOrderStatusLabel(order.status)}
        </Badge>
      </div>

      {/* Status timeline */}
      {order.status !== "CANCELLED" && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {steps.slice(0, 8).map((step, idx) => {
                const done = idx <= currentStep;
                const active = idx === currentStep;
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        done ? "bg-primary" : "bg-slate-200"
                      } ${active ? "ring-4 ring-primary/20" : ""}`}
                    />
                    <span className={`text-sm ${done ? "font-medium" : "text-muted-foreground"}`}>
                      {getOrderStatusLabel(step)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendor */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{order.vendor.name}</p>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}× {item.menuItem.name}
              </span>
              <span>{formatCurrency(item.totalPrice)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery info */}
      {order.address && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{order.address.label}</p>
            <p className="text-muted-foreground">
              {order.address.building} {order.address.room && `• Room ${order.address.room}`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rider */}
      {order.rider && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rider</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{order.rider.user.name}</p>
            {order.rider.user.phone && (
              <p className="text-muted-foreground">{order.rider.user.phone}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Totals */}
      <Card>
        <CardContent className="p-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service fee</span>
            <span>{formatCurrency(order.serviceFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{order.notes}</CardContent>
        </Card>
      )}
    </div>
  );
}
