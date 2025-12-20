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
import { getProperty, getActiveAddOns, getPropertyImages, getActiveAmenities, getActiveCampaigns, getSocialPosts } from "@/lib/supabase";
import type { Property, AddOn, PropertyImage, Amenity, Campaign, SocialPost } from "@/types/database";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    Facebook,
    Check,
    Coffee,
    Bed,
    Bath
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
// Dynamic icon map for amenities
const amenityIconMap: Record<string, React.ReactNode> = {
    "Waves": <Waves className="w-5 h-5 text-primary" />,
    "Mountain": <Mountain className="w-5 h-5 text-primary" />,
    "UtensilsCrossed": <UtensilsCrossed className="w-5 h-5 text-primary" />,
    "Car": <Car className="w-5 h-5 text-primary" />,
    "Wind": <Wind className="w-5 h-5 text-primary" />,
    "Wifi": <Wifi className="w-5 h-5 text-primary" />,
    "Tv": <Tv className="w-5 h-5 text-primary" />,
    "WashingMachine": <WashingMachine className="w-5 h-5 text-primary" />,
    "Check": <Check className="w-5 h-5 text-primary" />,
    "Coffee": <Coffee className="w-5 h-5 text-primary" />,
    "Bed": <Bed className="w-5 h-5 text-primary" />,
    "Bath": <Bath className="w-5 h-5 text-primary" />,
};

export default function Home() {
    const setRoomPrices = useBookingStore((state) => state.setRoomPrices);
    const [property, setProperty] = useState<Property | null>(null);
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [images, setImages] = useState<PropertyImage[]>([]);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
    const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
    const [showCampaign, setShowCampaign] = useState(false);
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

                    const [addOnsData, imagesData, amenitiesData, campaignsData, socialPostsData] = await Promise.all([
                        getActiveAddOns(propertyData.id),
                        getPropertyImages(propertyData.id),
                        getActiveAmenities(propertyData.id),
                        getActiveCampaigns(propertyData.id),
                        getSocialPosts(propertyData.id)
                    ]);
                    setAddOns(addOnsData);
                    setImages(imagesData);
                    setAmenities(amenitiesData);
                    setSocialPosts(socialPostsData);

                    // Show campaign popup if there's an active campaign
                    if (campaignsData.length > 0) {
                        setActiveCampaign(campaignsData[0]);
                        setShowCampaign(true);
                    }
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

                        {amenities.length > 0 && (
                            <div className="border-t pt-12">
                                <h3 className="text-2xl font-bold mb-6">Amenities</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {amenities.map((amenity) => (
                                        <div
                                            key={amenity.id}
                                            className="flex items-center gap-3 p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            {amenityIconMap[amenity.icon] || <Check className="w-5 h-5 text-primary" />}
                                            <span className="text-sm font-medium">{amenity.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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

            {/* Social Wall */}
            {socialPosts.length > 0 && (
                <section className="container mx-auto px-4 py-12 bg-gray-50">
                    <h2 className="text-3xl font-bold mb-8 text-center text-primary font-[family-name:var(--font-playfair-display)] italic">
                        Social Highlights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {socialPosts.map((post) => (
                            <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                                <div className="flex-1 flex justify-center items-center p-4 bg-gray-100/50">
                                    <div className="w-full overflow-hidden flex justify-center" dangerouslySetInnerHTML={{ __html: post.embed_code }} />
                                </div>
                                {post.caption && (
                                    <div className="p-4 border-t">
                                        <p className="text-sm text-gray-600 line-clamp-3">{post.caption}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Google Maps Section */}
            {property?.google_maps_url && (
                <section className="container mx-auto px-4 py-12">
                    <h2 className="text-3xl font-bold mb-6 text-center">Find Us</h2>
                    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg border">
                        <div
                            className="w-full h-full"
                            dangerouslySetInnerHTML={{ __html: property.google_maps_url }}
                        />
                    </div>
                </section>
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
                    <p className="font-[family-name:var(--font-playfair)] font-bold text-2xl tracking-wide text-primary italic">{propertyName}</p>

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

                    <p className="mt-6 text-muted-foreground">
                        © 2025 {propertyName} Homestay. {property?.footer_description || "Dedicated to providing cozy tropical experiences."}
                    </p>
                </div>
            </footer>

            {/* Campaign Popup */}
            {showCampaign && activeCampaign && (
                <Dialog open={showCampaign} onOpenChange={setShowCampaign}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-primary text-center">
                                {activeCampaign.title}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* We don't have image upload for campaigns yet, but support it in UI */}
                            {activeCampaign.image_url && (
                                <div className="relative h-48 w-full rounded-lg overflow-hidden">
                                    <Image
                                        src={activeCampaign.image_url}
                                        fill
                                        className="object-cover"
                                        alt={activeCampaign.title}
                                    />
                                </div>
                            )}
                            <p className="text-lg text-center">{activeCampaign.message}</p>
                            <div className="flex gap-2 justify-center pt-2">
                                <Button className="w-full" onClick={() => setShowCampaign(false)}>
                                    Okay, got it!
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
