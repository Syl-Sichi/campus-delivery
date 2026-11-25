"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Bike, Home, ShoppingBag, ClipboardList, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerNavProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function CustomerNav({ user }: CustomerNavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/customer", label: "Home", icon: Home },
    { href: "/customer/orders", label: "Orders", icon: ClipboardList },
    { href: "/customer/cart", label: "Cart", icon: ShoppingBag },
    { href: "/customer/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/customer" className="flex items-center gap-2 font-bold">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Bike className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:inline">Campus Delivery</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-slate-100"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="ml-2"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
