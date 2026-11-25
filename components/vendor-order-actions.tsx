"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const nextStatus: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY_FOR_PICKUP",
};

const labels: Record<string, string> = {
  PENDING: "Confirm Order",
  CONFIRMED: "Start Preparing",
  PREPARING: "Mark Ready",
};

export function VendorOrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const next = nextStatus[status];
  if (!next) return null;

  async function updateStatus() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={updateStatus} disabled={loading}>
      {loading ? "Updating..." : labels[status]}
    </Button>
  );
}
