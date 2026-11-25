# Campus Delivery

**Campus Food Delivery Platform + Logistics Engine**

A full-stack platform designed specifically for university and college campuses. Handles food delivery, general package logistics, campus zones, rider dispatch, and multi-role operations (Students, Vendors, Riders, Admins).

## Features (MVP)

- Multi-role authentication (Customer / Vendor / Rider / Admin)
- Campus zone management
- Vendor onboarding & menu management
- Food ordering with cart & checkout
- Real-time order status tracking
- Rider dispatch & delivery management
- Basic logistics engine (zone-based matching)
- Admin dashboard
- Locker / pickup point foundation
- Modern, mobile-first UI optimized for campus use

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js (NextAuth v5)
- **Styling**: Tailwind CSS + shadcn/ui patterns
- **State**: Zustand + TanStack Query
- **Validation**: Zod
- **Deployment**: Vercel (frontend) + Neon/Railway (database)

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Syl-Sichi/campus-delivery.git
cd campus-delivery
npm install
```

### 2. Environment Setup

Copy the example env file:

```bash
cp .env.example .env
```

Fill in the values (especially `DATABASE_URL` and `AUTH_SECRET`).

### 3. Database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed   # optional demo data
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
campus-delivery/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login / Register
│   ├── (customer)/         # Student/Staff ordering experience
│   ├── (vendor)/           # Vendor dashboard
│   ├── (rider)/            # Rider app
│   ├── (admin)/            # Admin panel
│   └── api/                # API routes
├── components/             # Reusable UI components
├── lib/                    # Utilities, auth, db client
├── prisma/                 # Schema, migrations, seed
├── types/                  # Shared TypeScript types
└── public/                 # Static assets
```

## Roles

| Role     | Description                              |
|----------|------------------------------------------|
| CUSTOMER | Students & staff who place orders        |
| VENDOR   | Canteens, restaurants, cloud kitchens    |
| RIDER    | Campus delivery partners                 |
| ADMIN    | Platform & campus operations managers    |

## Roadmap

- [x] Project foundation & database schema
- [x] Authentication & roles
- [ ] Customer ordering flow
- [ ] Vendor dashboard
- [ ] Rider dispatch & tracking
- [ ] Logistics engine improvements
- [ ] Real-time updates (WebSockets)
- [ ] Locker network
- [ ] Campus map integration
- [ ] Payments (Paystack / Flutterwave)
- [ ] Mobile apps (React Native)

## License

MIT
