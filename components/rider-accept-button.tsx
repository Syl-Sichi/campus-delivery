"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RiderAcceptButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function accept() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/accept`, {
        method: "POST",
      });

      if (res.ok) {
        router.push("/rider/active");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to accept");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={accept} disabled={loading}>
      {loading ? "Accepting..." : "Accept Delivery"}
    </Button>
  );
}
