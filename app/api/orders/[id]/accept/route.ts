import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rider = await db.rider.findUnique({
      where: { userId: session.user.id },
    });

    if (!rider) {
      return NextResponse.json({ error: "Not a rider" }, { status: 403 });
    }

    if (rider.status === "OFFLINE") {
      return NextResponse.json({ error: "You are offline" }, { status: 400 });
    }

    const { id } = await params;

    const order = await db.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.riderId) {
      return NextResponse.json({ error: "Order already assigned" }, { status: 400 });
    }

    if (order.status !== "READY_FOR_PICKUP") {
      return NextResponse.json({ error: "Order not ready for pickup" }, { status: 400 });
    }

    const updated = await db.order.update({
      where: { id },
      data: {
        riderId: rider.id,
        status: "ASSIGNED",
      },
    });

    // Mark rider as busy
    await db.rider.update({
      where: { id: rider.id },
      data: { status: "BUSY" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Accept order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
