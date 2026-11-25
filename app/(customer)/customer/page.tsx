import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Star, Clock, MapPin } from "lucide-react";

export default async function CustomerHomePage() {
  const vendors = await db.vendor.findMany({
    where: { isVerified: true },
    include: {
      zone: true,
      _count: { select: { menuItems: true } },
    },
    orderBy: { rating: "desc" },
    take: 20,
  });

  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 md:p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Hungry?</h1>
        <p className="opacity-90 mb-4">Order from your favorite campus spots and get it delivered fast.</p>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/customer/vendors?category=${cat.slug}`}
                className="flex-shrink-0 px-4 py-2 bg-white border rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Vendors */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Campus Vendors</h2>
          <Link href="/customer/vendors" className="text-sm text-primary hover:underline">
            See all
          </Link>
        </div>

        {vendors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No vendors available yet.</p>
              <p className="text-sm mt-1">Check back soon or ask campus canteens to join!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <Link key={vendor.id} href={`/customer/vendors/${vendor.slug}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-xl flex items-center justify-center">
                    {vendor.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vendor.coverImage}
                        alt={vendor.name}
                        className="w-full h-full object-cover rounded-t-xl"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-slate-300">
                        {vendor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{vendor.name}</CardTitle>
                      {vendor.isOpen ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Open</Badge>
                      ) : (
                        <Badge variant="secondary">Closed</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        {vendor.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {vendor.preparationTime} min
                      </span>
                      {vendor.zone && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {vendor.zone.name}
                        </span>
                      )}
                    </div>
                    {vendor.minOrderAmount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Min. order {formatCurrency(vendor.minOrderAmount)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
