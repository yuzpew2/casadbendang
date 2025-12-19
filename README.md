# Casa Bendang - Homestay Booking Website

A modern, high-performance homestay booking website built with Next.js 15, TypeScript, Tailwind CSS, and Supabase. Designed for conversion to WhatsApp bookings.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e)

## Features

### Public Facing
- 🏠 **Hero Section** - Full-width image slider with "Book Now" CTA
- 📅 **Interactive Calendar** - Date range picker with blocked dates
- 💰 **Dynamic Pricing** - Automatic calculation based on nights + add-ons
- 📱 **WhatsApp Integration** - One-click booking via WhatsApp with pre-filled message
- 🎨 **Modern Tropical Design** - Clean, mobile-first UI

### Admin Dashboard
- 🔐 **Authentication** - Supabase Auth with protected routes
- 📊 **Overview Stats** - Bookings, revenue, maintenance blocks
- 📋 **Booking Management** - Confirm, cancel, delete bookings
- ⚙️ **Settings** - Configure pricing, WhatsApp number, property details
- ➕ **Add-ons Management** - CRUD for booking extras

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** Shadcn/UI (Radix Primitives)
- **Icons:** Lucide React
- **State:** Zustand
- **Database:** Supabase
- **Auth:** Supabase Auth
- **Date Handling:** date-fns
- **Forms:** React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### 1. Clone the repository

```bash
git clone https://github.com/yuzpew2/casadbendang.git
cd casadbendang
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Authentication > Users** and create an admin user

### 3. Configure environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yuzpew2/casadbendang)

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard
│   ├── login/          # Login page
│   ├── page.tsx        # Homepage
│   └── layout.tsx      # Root layout
├── components/
│   ├── booking/        # Booking components
│   ├── sections/       # Page sections
│   └── ui/             # UI components (shadcn)
├── lib/
│   ├── supabase.ts     # Supabase client helpers
│   ├── auth.ts         # Auth helpers
│   ├── whatsapp.ts     # WhatsApp link generator
│   └── schemas.ts      # Zod validation schemas
├── store/
│   └── useBookingStore.ts  # Zustand store
└── types/
    └── database.ts     # TypeScript types
```

## License

MIT
