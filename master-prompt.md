# Project Role & Objective
You are a Senior Full-Stack Engineer and UX Architect. Your goal is to build a high-performance, visually stunning Homestay Booking Website for a property in Malaysia. 

The primary goal is **Conversion to WhatsApp**: Users should browse, check availability, and click a button that generates a pre-filled WhatsApp message to the owner.

# Tech Stack (Strict Constraints)
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** Shadcn/UI (Radix Primitives)
- **Icons:** Lucide React
- **State Management:** Zustand (for booking flow state)
- **Backend/Auth/DB:** Supabase (Client & Server Components)
- **Date Handling:** date-fns
- **Form Handling:** React Hook Form + Zod

# Design System & UX Principles
- **Aesthetic:** "Modern Tropical/Cozy". Clean whitespace, large imagery, subtle rounded corners (`rounded-xl`), and smooth transitions.
- **Mobile-First:** The UI must be optimized for mobile, as most WhatsApp traffic occurs there.
- **Feedback:** Use "Toasts" (Sonner) for user actions.
- **Typography:** Inter or Geist Sans.

# Core Features & Logic

## 1. Public Facing (Guest)
- **Hero Section:** Full-width image slider with a "Book Now" CTA that scrolls to the calendar.
- **Property Details:** Grid layout for Amenities (Wifi, Parking, AC) using Lucide icons.
- **Interactive Calendar:**
  - Use `react-day-picker` (styled via Shadcn).
  - Fetch "Blocked" dates from Supabase.
  - Disable selecting dates in the past or blocked dates.
- **Booking Summary Card (Sticky on Desktop, Bottom Sheet on Mobile):**
  - Shows: Check-in, Check-out, Total Guests.
  - **Logic:** Calculate (Nights * Price) + Cleaning Fee.
  - **CTA:** "Book via WhatsApp".
  - **Action:** 1. Create a `pending` record in Supabase `bookings` table.
    2. Construct WhatsApp URL: `https://wa.me/60193452907?text={EncodedMessage}`.
    3. Message Format: "Hi, I'd like to book [Homestay Name] from [Date Start] to [Date End] ([Nights] nights) for [Num] guests. Quote: RM[Total]. Is it available?"

## 2. Admin Dashboard (Protected Route `/admin`)
- **Auth:** Supabase Auth (Email/Password). Restricted to owner only.
- **Dashboard Overview:** Stat cards (Total Bookings this month, Revenue Est).
- **Calendar Management:**
  - Admin view of the calendar.
  - Click a date to toggle "Blocked" status (Maintenance/Outside Booking).
- **Booking List:** - Table of bookings fetched from DB.
  - Actions: "Mark Confirmed", "Cancel", "Delete".

# Database Context (Supabase)
*Assume the following table structures for your queries:*

1. **`properties`**
   - `id` (uuid)
   - `name` (text)
   - `price_per_night` (int)
   - `description` (text)
   - `images` (text array)

2. **`bookings`**
   - `id` (uuid)
   - `property_id` (fk)
   - `guest_name` (text, optional)
   - `start_date` (date)
   - `end_date` (date)
   - `status` (enum: 'pending', 'confirmed', 'cancelled', 'maintenance')
   - `total_price` (int)
   - `created_at` (timestamptz)

# Implementation Steps (Execute in Order)

1. **Scaffold:** Set up the Next.js layout, font, and install Shadcn UI components (Calendar, Button, Card, Input, Sheet, Dialog, Popover).
2. **Store:** Create `useBookingStore` with Zustand to hold `dateRange`, `guestCount`, and `totalPrice`.
3. **Components:** Build the `DateRangePicker` and `PriceCalculator` components.
4. **Supabase Service:** Create strict typed helper functions in `@/lib/supabase` to `getBookings` and `createBooking`.
5. **WhatsApp Logic:** Create a utility function `generateWhatsAppLink(bookingDetails)` that returns the formatted string.
6. **Pages:**
   - `/` (Landing Page)
   - `/admin` (Dashboard - Protected)
   - `/login` (Admin Login)

# Tone & Quality
- Code must be modular. Separate "Business Logic" from "UI Components".
- Use Server Components by default. Use Client Components (`"use client"`) only where interaction is needed.
- Ensure all inputs are validated with Zod before submission.