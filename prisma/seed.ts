import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create campus zones
  const zones = await Promise.all([
    prisma.campusZone.upsert({
      where: { code: "HOSTEL_A" },
      update: {},
      create: { name: "Hostel A", code: "HOSTEL_A", description: "Main student hostels - Block A" },
    }),
    prisma.campusZone.upsert({
      where: { code: "HOSTEL_B" },
      update: {},
      create: { name: "Hostel B", code: "HOSTEL_B", description: "Student hostels - Block B" },
    }),
    prisma.campusZone.upsert({
      where: { code: "ACADEMIC" },
      update: {},
      create: { name: "Academic Area", code: "ACADEMIC", description: "Lecture halls and faculties" },
    }),
    prisma.campusZone.upsert({
      where: { code: "FOOD_COURT" },
      update: {},
      create: { name: "Food Court", code: "FOOD_COURT", description: "Central food court and canteens" },
    }),
  ]);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "meals" },
      update: {},
      create: { name: "Meals", slug: "meals", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: "snacks" },
      update: {},
      create: { name: "Snacks", slug: "snacks", sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: "drinks" },
      update: {},
      create: { name: "Drinks", slug: "drinks", sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: "local" },
      update: {},
      create: { name: "Local Dishes", slug: "local", sortOrder: 4 },
    }),
  ]);

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@campusdelivery.local" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@campusdelivery.local",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create demo customer
  const customerPassword = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "student@university.edu" },
    update: {},
    create: {
      name: "Demo Student",
      email: "student@university.edu",
      password: customerPassword,
      role: "CUSTOMER",
      studentId: "STU-2024-001",
      phone: "+2348000000001",
    },
  });

  // Create demo vendor user + vendor
  const vendorPassword = await bcrypt.hash("vendor123", 12);
  const vendorUser = await prisma.user.upsert({
    where: { email: "canteen@university.edu" },
    update: {},
    create: {
      name: "Main Canteen",
      email: "canteen@university.edu",
      password: vendorPassword,
      role: "VENDOR",
      phone: "+2348000000002",
    },
  });

  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      name: "Main Campus Canteen",
      slug: "main-campus-canteen",
      description: "The most popular canteen on campus. Local and continental dishes.",
      zoneId: zones[3].id, // Food Court
      isOpen: true,
      isVerified: true,
      preparationTime: 15,
      minOrderAmount: 500,
      rating: 4.5,
      totalReviews: 128,
    },
  });

  // Link categories to vendor
  for (const cat of categories) {
    await prisma.vendorCategory.upsert({
      where: { vendorId_categoryId: { vendorId: vendor.id, categoryId: cat.id } },
      update: {},
      create: { vendorId: vendor.id, categoryId: cat.id },
    });
  }

  // Create menu items
  const menuItems = [
    { name: "Jollof Rice + Chicken", description: "Spicy jollof rice with grilled chicken", price: 1500, categoryId: categories[3].id, isPopular: true },
    { name: "Fried Rice + Turkey", description: "Special fried rice with turkey", price: 1800, categoryId: categories[3].id, isPopular: true },
    { name: "Beans + Bread", description: "Hot beans with soft bread", price: 800, categoryId: categories[0].id },
    { name: "Indomie Special", description: "Indomie with egg, vegetables and sausage", price: 1000, categoryId: categories[1].id, isPopular: true },
    { name: "Shawarma", description: "Chicken shawarma wrap", price: 1200, categoryId: categories[1].id },
    { name: "Chapman", description: "Refreshing campus chapman drink", price: 500, categoryId: categories[2].id },
    { name: "Bottled Water", description: "75cl pure water", price: 200, categoryId: categories[2].id },
    { name: "Meat Pie", description: "Freshly baked meat pie", price: 400, categoryId: categories[1].id },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: {
        vendorId: vendor.id,
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId,
        isPopular: item.isPopular || false,
        isAvailable: true,
      },
    });
  }

  // Create second vendor
  const vendor2User = await prisma.user.upsert({
    where: { email: "smoothie@university.edu" },
    update: {},
    create: {
      name: "Smoothie Hub",
      email: "smoothie@university.edu",
      password: vendorPassword,
      role: "VENDOR",
    },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { userId: vendor2User.id },
    update: {},
    create: {
      userId: vendor2User.id,
      name: "Smoothie Hub",
      slug: "smoothie-hub",
      description: "Fresh juices, smoothies and healthy snacks.",
      zoneId: zones[3].id,
      isOpen: true,
      isVerified: true,
      preparationTime: 10,
      minOrderAmount: 0,
      rating: 4.7,
      totalReviews: 64,
    },
  });

  await prisma.menuItem.createMany({
    data: [
      { vendorId: vendor2.id, name: "Mango Smoothie", description: "Fresh mango blend", price: 800, isPopular: true, isAvailable: true },
      { vendorId: vendor2.id, name: "Banana Protein Shake", description: "Banana + protein powder", price: 1000, isAvailable: true },
      { vendorId: vendor2.id, name: "Fresh Orange Juice", description: "Freshly squeezed", price: 600, isAvailable: true },
      { vendorId: vendor2.id, name: "Yoghurt Parfait", description: "Yoghurt with granola and fruits", price: 900, isPopular: true, isAvailable: true },
    ],
  });

  // Create demo rider
  const riderPassword = await bcrypt.hash("rider123", 12);
  const riderUser = await prisma.user.upsert({
    where: { email: "rider@university.edu" },
    update: {},
    create: {
      name: "Demo Rider",
      email: "rider@university.edu",
      password: riderPassword,
      role: "RIDER",
      phone: "+2348000000003",
      studentId: "STU-2024-099",
    },
  });

  await prisma.rider.upsert({
    where: { userId: riderUser.id },
    update: {},
    create: {
      userId: riderUser.id,
      zoneId: zones[0].id,
      status: "AVAILABLE",
      vehicleType: "bicycle",
      isVerified: true,
    },
  });

  // Create address for customer
  await prisma.address.create({
    data: {
      userId: customer.id,
      zoneId: zones[0].id,
      label: "My Hostel Room",
      building: "Hostel A",
      room: "A-204",
      isDefault: true,
    },
  });

  console.log("Seed completed successfully!");
  console.log("\nDemo accounts:");
  console.log("  Admin:    admin@campusdelivery.local / admin123");
  console.log("  Customer: student@university.edu / customer123");
  console.log("  Vendor:   canteen@university.edu / vendor123");
  console.log("  Rider:    rider@university.edu / rider123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
