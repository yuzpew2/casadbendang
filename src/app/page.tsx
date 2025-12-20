"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { Gallery } from "@/components/sections/Gallery";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { GuestSelector } from "@/components/booking/GuestSelector";
import { RoomSelector } from "@/components/booking/RoomSelector";
import { AddOnSelector } from "@/components/booking/AddOnSelector";
import { SummaryCard } from "@/components/booking/SummaryCard";
import { useBookingStore } from "@/store/useBookingStore";
import { getProperty, getActiveAddOns, getPropertyImages } from "@/lib/supabase";
import type { Property, AddOn, PropertyImage } from "@/types/database";
import {
    Waves,
    Mountain,
    UtensilsCrossed,
    Car,
    Wind,
    Wifi,
    Tv,
    WashingMachine,
    Loader2,
    Instagram,
    Facebook
} from "lucide-react";

// TikTok icon (not in Lucide)
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
    );
}

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
    const setRoomPrices = useBookingStore((state) => state.setRoomPrices);
    const [property, setProperty] = useState<Property | null>(null);
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [images, setImages] = useState<PropertyImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const propertyData = await getProperty();

                if (propertyData) {
                    setProperty(propertyData);
                    setRoomPrices({
                        price_3_rooms: propertyData.price_3_rooms,
                        price_4_rooms: propertyData.price_4_rooms,
                        price_6_rooms: propertyData.price_6_rooms,
                    });

                    const [addOnsData, imagesData] = await Promise.all([
                        getActiveAddOns(propertyData.id),
                        getPropertyImages(propertyData.id)
                    ]);
                    setAddOns(addOnsData);
                    setImages(imagesData);
                }
            } catch (error) {
                console.error("Error fetching property data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [setRoomPrices]);

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
    const whatsappNumber = property?.whatsapp_number || "60193452907";
    const propertyId = property?.id || "";
    const logoUrl = property?.logo_url;

    // Use images from database or fallback
    const heroImages = images.length > 0
        ? images.map(img => img.url)
        : ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000"];

    // Room prices
    const roomPrices = {
        price_3_rooms: property?.price_3_rooms || 350,
        price_4_rooms: property?.price_4_rooms || 450,
        price_6_rooms: property?.price_6_rooms || 650,
    };

    // Convert AddOn to the format expected by AddOnSelector
    const addOnItems = addOns.map(addon => ({
        id: addon.id,
        name: addon.name,
        price: addon.price,
    }));

    // Social media links
    const socialLinks = {
        instagram: property?.instagram_url,
        facebook: property?.facebook_url,
        tiktok: property?.tiktok_url,
    };

    return (
        <div className="min-h-screen bg-[#fafaf9]">
            {/* Header with Logo */}
            {logoUrl && (
                <header className="absolute top-0 left-0 right-0 z-20 p-4">
                    <div className="container mx-auto">
                        <Image
                            src={logoUrl}
                            alt={propertyName}
                            width={120}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                </header>
            )}

            {/* Hero Section */}
            <Hero
                title={propertyName}
                description={description}
                images={heroImages}
            />

            <section className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Booking Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Plan Your Stay</h2>
                            <p className="text-muted-foreground mb-8">
                                Select your preferred dates, room configuration, and customize your stay with our available add-ons.
                                The pricing will update automatically based on your selections.
                            </p>

                            <div className="space-y-8">
                                <RoomSelector prices={roomPrices} />
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
                            timeoutHours={property?.pending_timeout_hours || 24}
                        />
                    </div>
                </div>
            </section>

            {/* Photo Gallery */}
            {images.length > 0 && (
                <Gallery
                    images={images.map(img => ({ url: img.url, alt_text: img.alt_text }))}
                    title="Explore Our Homestay"
                />
            )}

            {/* Footer with Social Links */}
            <footer className="bg-white border-t py-12">
                <div className="container mx-auto px-4 text-center">
                    {logoUrl && (
                        <div className="mb-4 flex justify-center">
                            <Image
                                src={logoUrl}
                                alt={propertyName}
                                width={100}
                                height={33}
                                className="object-contain"
                            />
                        </div>
                    )}
                    <p className="font-bold text-xl uppercase tracking-widest text-primary">{propertyName}</p>

                    {/* Social Media Icons */}
                    {(socialLinks.instagram || socialLinks.facebook || socialLinks.tiktok) && (
                        <div className="flex justify-center gap-4 mt-6">
                            {socialLinks.instagram && (
                                <Link
                                    href={socialLinks.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white hover:scale-110 transition-transform"
                                >
                                    <Instagram className="w-5 h-5" />
                                </Link>
                            )}
                            {socialLinks.facebook && (
                                <Link
                                    href={socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-full bg-blue-600 text-white hover:scale-110 transition-transform"
                                >
                                    <Facebook className="w-5 h-5" />
                                </Link>
                            )}
                            {socialLinks.tiktok && (
                                <Link
                                    href={socialLinks.tiktok}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-full bg-black text-white hover:scale-110 transition-transform"
                                >
                                    <TikTokIcon className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    )}

                    <p className="mt-6 text-muted-foreground">© 2025 {propertyName} Homestay. Dedicated to providing cozy tropical experiences.</p>
                </div>
            </footer>
        </div>
    );
}
