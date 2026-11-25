import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "ASSIGNED",
    "PICKED_UP",
    "IN_TRANSIT",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization: vendor owns the order, or rider assigned, or admin
    const isVendor = order.vendor.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isVendor && !isAdmin) {
      // Check if rider
      const rider = await db.rider.findUnique({ where: { userId: session.user.id } });
      if (!rider || order.riderId !== rider.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updated = await db.order.update({
      where: { id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.status === "PICKED_UP" ? { pickedUpAt: new Date() } : {}),
        ...(parsed.data.status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
        ...(parsed.data.status === "CANCELLED" ? { cancelledAt: new Date() } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
