import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["OFFLINE", "AVAILABLE", "BUSY"]),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const rider = await db.rider.update({
      where: { userId: session.user.id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json(rider);
  } catch (error) {
    console.error("Update rider status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
