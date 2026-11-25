"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RiderStatusToggle({ currentStatus }: { currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isOnline = currentStatus !== "OFFLINE";

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/rider/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isOnline ? "OFFLINE" : "AVAILABLE" }),
      });

      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={isOnline ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={loading}
    >
      {loading ? "..." : isOnline ? "Go Offline" : "Go Online"}
    </Button>
  );
}
