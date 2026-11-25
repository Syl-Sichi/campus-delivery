import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { VendorMenu } from "@/components/vendor-menu";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function VendorPage({ params }: Props) {
  const { slug } = await params;

  const vendor = await db.vendor.findUnique({
    where: { slug },
    include: {
      zone: true,
      menuItems: {
        where: { isAvailable: true },
        orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }],
        include: { category: true },
      },
    },
  });

  if (!vendor) notFound();

  // Group menu items by category
  const grouped = vendor.menuItems.reduce(
    (acc, item) => {
      const key = item.category?.name || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, typeof vendor.menuItems>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Vendor Header */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-primary/20 to-blue-100 flex items-center justify-center">
          <span className="text-6xl font-bold text-primary/30">{vendor.name.charAt(0)}</span>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{vendor.name}</h1>
              {vendor.description && (
                <p className="text-muted-foreground mt-1">{vendor.description}</p>
              )}
            </div>
            {vendor.isOpen ? (
              <Badge className="bg-green-100 text-green-700">Open</Badge>
            ) : (
              <Badge variant="secondary">Closed</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {vendor.rating.toFixed(1)} ({vendor.totalReviews} reviews)
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              ~{vendor.preparationTime} min
            </span>
            {vendor.zone && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {vendor.zone.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <VendorMenu
        vendor={{
          id: vendor.id,
          name: vendor.name,
          isOpen: vendor.isOpen,
          minOrderAmount: vendor.minOrderAmount,
        }}
        groupedMenu={grouped}
      />
    </div>
  );
}
