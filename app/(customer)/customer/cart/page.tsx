"use client";

import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { items, vendorName, updateQuantity, removeItem, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const deliveryFee = 300; // Fixed for MVP
  const serviceFee = Math.round(subtotal() * 0.05);
  const total = subtotal() + deliveryFee + serviceFee;

  async function placeOrder() {
    if (items.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            notes: i.notes,
          })),
          notes,
          deliveryType: "DELIVERY",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to place order");
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/customer/orders/${data.orderId}`);
    } catch {
      alert("Something went wrong");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-xl font-semibold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some items from a campus vendor to get started.</p>
        <Link href="/customer">
          <Button>Browse Vendors</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Your Cart</h1>
      <p className="text-muted-foreground">From {vendorName}</p>

      <Card>
        <CardContent className="divide-y p-0">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex items-center justify-between p-4 gap-3">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-6 text-center">{item.quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-500"
                  onClick={() => removeItem(item.menuItemId)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full border rounded-md p-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Any special instructions? (e.g. extra spicy, no onions)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery fee</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service fee</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={placeOrder} disabled={loading}>
        {loading ? "Placing order..." : `Place Order • ${formatCurrency(total)}`}
      </Button>
    </div>
  );
}
