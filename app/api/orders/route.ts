import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const orderSchema = z.object({
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().int().positive(),
      notes: z.string().optional(),
    })
  ).min(1),
  notes: z.string().optional(),
  deliveryType: z.enum(["DELIVERY", "PICKUP", "LOCKER"]).default("DELIVERY"),
  addressId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { items, notes, deliveryType, addressId } = parsed.data;

    // Fetch menu items and validate
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await db.menuItem.findMany({
      where: { id: { in: menuItemIds }, isAvailable: true },
      include: { vendor: true },
    });

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json({ error: "Some items are unavailable" }, { status: 400 });
    }

    // Ensure all items from same vendor
    const vendorIds = [...new Set(menuItems.map((m) => m.vendorId))];
    if (vendorIds.length > 1) {
      return NextResponse.json({ error: "All items must be from the same vendor" }, { status: 400 });
    }

    const vendor = menuItems[0].vendor;
    if (!vendor.isOpen) {
      return NextResponse.json({ error: "Vendor is currently closed" }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
      const totalPrice = menuItem.price * item.quantity;
      subtotal += totalPrice;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice,
        notes: item.notes,
      };
    });

    if (subtotal < vendor.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount is ${vendor.minOrderAmount}` },
        { status: 400 }
      );
    }

    const deliveryFee = deliveryType === "DELIVERY" ? 300 : 0;
    const serviceFee = Math.round(subtotal * 0.05);
    const total = subtotal + deliveryFee + serviceFee;

    // Get default address if needed
    let finalAddressId = addressId;
    if (deliveryType === "DELIVERY" && !finalAddressId) {
      const defaultAddress = await db.address.findFirst({
        where: { userId: session.user.id, isDefault: true },
      });
      finalAddressId = defaultAddress?.id;
    }

    const estimatedReady = new Date();
    estimatedReady.setMinutes(estimatedReady.getMinutes() + vendor.preparationTime);

    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: session.user.id,
        vendorId: vendor.id,
        addressId: finalAddressId,
        status: "PENDING",
        deliveryType,
        subtotal,
        deliveryFee,
        serviceFee,
        total,
        notes,
        estimatedReadyAt: estimatedReady,
        items: {
          create: orderItemsData,
        },
      },
    });

    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where: { customerId: session.user.id },
      include: {
        vendor: { select: { name: true, slug: true } },
        items: { include: { menuItem: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
