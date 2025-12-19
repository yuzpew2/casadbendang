"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { GuestSelector } from "@/components/booking/GuestSelector";
import { AddOnSelector } from "@/components/booking/AddOnSelector";
import { SummaryCard } from "@/components/booking/SummaryCard";
import { useBookingStore } from "@/store/useBookingStore";
import { getProperty, getActiveAddOns } from "@/lib/supabase";
import type { Property, AddOn } from "@/types/database";
import {
    Waves,
    Mountain,
    UtensilsCrossed,
    Car,
    Wind,
    Wifi,
    Tv,
    WashingMachine,
    Loader2
} from "lucide-react";

// Map amenity names to Lucide icons
const amenityIcons: Record<string, React.ReactNode> = {
    "Private Pool": <Waves className="w-5 h-5 text-primary" />,
    "Paddy Field View": <Mountain className="w-5 h-5 text-primary" />,
    "Fully Equipped Kitchen": <UtensilsCrossed className="w-5 h-5 text-primary" />,
    "Free Parking": <Car className="w-5 h-5 text-primary" />,
    "Air Conditioning": <Wind className="w-5 h-5 text-primary" />,
    "Wi-Fi": <Wifi className="w-5 h-5 text-primary" />,
    "Smart TV": <Tv className="w-5 h-5 text-primary" />,
    "Washing Machine": <WashingMachine className="w-5 h-5 text-primary" />,
};

const AMENITIES = [
    "Private Pool",
    "Paddy Field View",
    "Fully Equipped Kitchen",
    "Free Parking",
    "Air Conditioning",
    "Wi-Fi",
    "Smart TV",
    "Washing Machine"
];

export default function Home() {
    const setPrices = useBookingStore((state) => state.setPrices);
    const [property, setProperty] = useState<Property | null>(null);
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const propertyData = await getProperty();

                if (propertyData) {
                    setProperty(propertyData);
                    setPrices(propertyData.price_per_night, propertyData.cleaning_fee);

                    const addOnsData = await getActiveAddOns(propertyData.id);
                    setAddOns(addOnsData);
                }
            } catch (error) {
                console.error("Error fetching property data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [setPrices]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading Casa Bendang...</p>
                </div>
            </div>
        );
    }

    // Fallback to defaults if no property data
    const propertyName = property?.name || "Casa Bendang";
    const description = property?.description || "Experience the serene beauty of a modern tropical homestay amidst the lush paddy fields of Malaysia.";
    const images = property?.images || ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000"];
    const whatsappNumber = property?.whatsapp_number || "60193452907";
    const propertyId = property?.id || "";

    // Convert AddOn to the format expected by AddOnSelector
    const addOnItems = addOns.map(addon => ({
        id: addon.id,
        name: addon.name,
        price: addon.price,
    }));

    return (
        <div className="min-h-screen bg-[#fafaf9]">
            {/* Hero Section */}
            <Hero
                title={propertyName}
                description={description}
                images={images}
            />

            <section className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Booking Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Plan Your Stay</h2>
                            <p className="text-muted-foreground mb-8">
                                Select your preferred dates and customize your stay with our available add-ons.
                                The pricing will update automatically based on your selections.
                            </p>

                            <div className="space-y-8">
                                <BookingCalendar propertyId={propertyId} />
                                <GuestSelector />
                                {addOnItems.length > 0 && (
                                    <AddOnSelector addOns={addOnItems} />
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-12">
                            <h3 className="text-2xl font-bold mb-6">Amenities</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {AMENITIES.map((amenity) => (
                                    <div
                                        key={amenity}
                                        className="flex items-center gap-3 p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {amenityIcons[amenity] || <div className="w-5 h-5 rounded-full bg-primary" />}
                                        <span className="text-sm font-medium">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="relative">
                        <SummaryCard
                            propertyId={propertyId}
                            propertyName={propertyName}
                            whatsappNumber={whatsappNumber}
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="font-bold text-xl uppercase tracking-widest text-primary">{propertyName}</p>
                    <p className="mt-4 text-muted-foreground">© 2025 {propertyName} Homestay. Dedicated to providing cozy tropical experiences.</p>
                </div>
            </footer>
        </div>
    );
}
