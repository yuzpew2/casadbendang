"use client";

import { useState } from "react";
import { useBookingStore } from "@/store/useBookingStore";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { createBooking } from "@/lib/supabase";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";

interface SummaryCardProps {
    propertyId: string;
    whatsappNumber: string;
    propertyName: string;
}

export function SummaryCard({ propertyId, whatsappNumber, propertyName }: SummaryCardProps) {
    const { dateRange, guestCount, selectedAddOns, getTotalPrice, getNights, basePrice, cleaningFee } = useBookingStore();
    const [isLoading, setIsLoading] = useState(false);

    const totalPrice = getTotalPrice();
    const nights = getNights();

    const handleBook = async () => {
        if (!dateRange.from || !dateRange.to) {
            toast.error("Please select your dates first");
            return;
        }

        setIsLoading(true);

        try {
            // Create pending booking in Supabase
            const booking = await createBooking({
                property_id: propertyId,
                start_date: format(dateRange.from, "yyyy-MM-dd"),
                end_date: format(dateRange.to, "yyyy-MM-dd"),
                num_guests: guestCount,
                total_price: totalPrice,
                add_ons: selectedAddOns.map(a => ({ name: a.name, price: a.price })),
            });

            if (!booking) {
                toast.error("Failed to create booking. Please try again.");
                return;
            }

            toast.success("Booking request created! Redirecting to WhatsApp...");

            // Generate WhatsApp link and open
            const link = generateWhatsAppLink({
                propertyId,
                propertyName,
                startDate: dateRange.from,
                endDate: dateRange.to,
                nights,
                guests: guestCount,
                totalPrice,
                addOns: selectedAddOns.map(a => ({ name: a.name, price: a.price })),
                whatsappNumber,
            });

            // Small delay to show success toast
            setTimeout(() => {
                window.open(link, "_blank");
            }, 500);

        } catch (error) {
            console.error("Booking error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="sticky top-8 shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-orange-50 rounded-t-lg">
                <CardTitle className="text-2xl font-bold">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Check-in:</span>
                    <span className="font-medium">{dateRange.from ? format(dateRange.from, "PPP") : "Select date"}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Check-out:</span>
                    <span className="font-medium">{dateRange.to ? format(dateRange.to, "PPP") : "Select date"}</span>
                </div>

                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">RM{basePrice} × {nights} nights</span>
                        <span className="font-medium">RM{basePrice * nights}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cleaning fee</span>
                        <span className="font-medium">RM{cleaningFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Guests</span>
                        <span className="font-medium">{guestCount}</span>
                    </div>
                </div>

                {selectedAddOns.length > 0 && (
                    <div className="border-t pt-4 space-y-2">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Add-ons</span>
                        {selectedAddOns.map((addon) => (
                            <div key={addon.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{addon.name}</span>
                                <span className="font-medium">RM{addon.price}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-between text-xl font-bold border-t pt-4">
                    <span>Total</span>
                    <span className="text-primary">RM{totalPrice}</span>
                </div>
            </CardContent>
            <CardFooter className="pb-6">
                <Button
                    className="w-full py-6 text-lg rounded-xl gap-2"
                    disabled={!dateRange.from || !dateRange.to || isLoading}
                    onClick={handleBook}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating booking...
                        </>
                    ) : (
                        <>
                            <MessageCircle className="w-5 h-5" />
                            Book via WhatsApp
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
