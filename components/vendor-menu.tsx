"use client";

import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isPopular: boolean;
}

interface VendorMenuProps {
  vendor: {
    id: string;
    name: string;
    isOpen: boolean;
    minOrderAmount: number;
  };
  groupedMenu: Record<string, MenuItem[]>;
}

export function VendorMenu({ vendor, groupedMenu }: VendorMenuProps) {
  const { items, addItem, updateQuantity, totalItems, subtotal } = useCart();

  function getQuantity(menuItemId: string) {
    return items.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
  }

  return (
    <div className="space-y-8 pb-24">
      {Object.entries(groupedMenu).map(([category, menuItems]) => (
        <section key={category}>
          <h2 className="text-lg font-semibold mb-3">{category}</h2>
          <div className="space-y-3">
            {menuItems.map((item) => {
              const qty = getQuantity(item.id);
              return (
                <Card key={item.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{item.name}</h3>
                        {item.isPopular && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                      <p className="font-semibold mt-1">{formatCurrency(item.price)}</p>
                    </div>

                    {vendor.isOpen && (
                      <div className="flex items-center gap-2">
                        {qty > 0 ? (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, qty - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-6 text-center font-medium">{qty}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, qty + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() =>
                              addItem({
                                menuItemId: item.id,
                                name: item.name,
                                price: item.price,
                                vendorId: vendor.id,
                                vendorName: vendor.name,
                              })
                            }
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      {/* Sticky cart bar */}
      {totalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-50">
          <div className="container mx-auto max-w-3xl flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{totalItems()} item{totalItems() > 1 ? "s" : ""}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(subtotal())}</p>
            </div>
            <Link href="/customer/cart">
              <Button className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
