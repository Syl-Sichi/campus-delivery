"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const nextStatus: Record<string, { status: string; label: string }> = {
  ASSIGNED: { status: "PICKED_UP", label: "Picked Up" },
  PICKED_UP: { status: "IN_TRANSIT", label: "Start Delivery" },
  IN_TRANSIT: { status: "DELIVERED", label: "Mark Delivered" },
};

export function RiderDeliveryActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const next = nextStatus[status];
  if (!next) return null;

  async function update() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next.status }),
      });

      if (res.ok) {
        // If delivered, free up the rider
        if (next.status === "DELIVERED") {
          await fetch("/api/rider/status", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "AVAILABLE" }),
          });
        }
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={update} disabled={loading}>
      {loading ? "Updating..." : next.label}
    </Button>
  );
}
