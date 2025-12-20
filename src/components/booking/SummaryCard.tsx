"use client";

import { useState } from "react";
import { useBookingStore } from "@/store/useBookingStore";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { createBooking } from "@/lib/supabase";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, MessageCircle, User, Phone } from "lucide-react";

interface SummaryCardProps {
    propertyId: string;
    whatsappNumber: string;
    propertyName: string;
    timeoutHours?: number;
}

export function SummaryCard({ propertyId, whatsappNumber, propertyName, timeoutHours = 24 }: SummaryCardProps) {
    const { dateRange, guestCount, roomCount, selectedAddOns, getTotalPrice, getNights, getRoomPrice } = useBookingStore();
    const [isLoading, setIsLoading] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");

    const totalPrice = getTotalPrice();
    const nights = getNights();
    const roomPrice = getRoomPrice();
    const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);

    const handleBook = async () => {
        if (!dateRange.from || !dateRange.to) {
            toast.error("Please select your dates first");
            return;
        }

        if (!guestName.trim()) {
            toast.error("Please enter your name");
            return;
        }

        if (!guestPhone.trim()) {
            toast.error("Please enter your phone number");
            return;
        }

        setIsLoading(true);

        try {
            // Create pending booking in Supabase with customer info
            const result = await createBooking({
                property_id: propertyId,
                guest_name: guestName.trim(),
                guest_phone: guestPhone.trim(),
                start_date: format(dateRange.from, "yyyy-MM-dd"),
                end_date: format(dateRange.to, "yyyy-MM-dd"),
                num_guests: guestCount,
                room_count: roomCount,
                total_price: totalPrice,
                add_ons: selectedAddOns.map(a => ({ name: a.name, price: a.price })),
            });

            if (!result.success) {
                // Handle different error types
                if (result.error === 'overlap') {
                    toast.error(result.message || "These dates are no longer available.");
                } else {
                    toast.error(result.message || "Failed to create booking. Please try again.");
                }
                setIsLoading(false);
                return;
            }

            toast.success("Booking request created! Redirecting to WhatsApp...");

            // Generate WhatsApp link with booking reference
            const link = generateWhatsAppLink({
                propertyId,
                propertyName,
                startDate: dateRange.from,
                endDate: dateRange.to,
                nights,
                guests: guestCount,
                roomCount,
                totalPrice,
                addOns: selectedAddOns.map(a => ({ name: a.name, price: a.price })),
                whatsappNumber,
                guestName: guestName.trim(),
                guestPhone: guestPhone.trim(),
                bookingRef: result.booking!.id.slice(0, 8).toUpperCase(),
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
                {/* Customer Info */}
                <div className="space-y-3 pb-4 border-b">
                    <p className="text-sm font-medium text-muted-foreground">Your Information</p>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Your Name"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Phone Number (e.g., 0123456789)"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Date Summary */}
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Check-in:</span>
                    <span className="font-medium">{dateRange.from ? format(dateRange.from, "PPP") : "Select date"}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Check-out:</span>
                    <span className="font-medium">{dateRange.to ? format(dateRange.to, "PPP") : "Select date"}</span>
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{roomCount} Rooms × {nights} nights</span>
                        <span className="font-medium">RM{roomPrice * nights}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>@ RM{roomPrice}/night</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Guests</span>
                        <span className="font-medium">{guestCount}</span>
                    </div>
                </div>

                {/* Add-ons */}
                {selectedAddOns.length > 0 && (
                    <div className="border-t pt-4 space-y-2">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Add-ons</span>
                        {selectedAddOns.map((addon) => (
                            <div key={addon.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{addon.name}</span>
                                <span className="font-medium">RM{addon.price}</span>
                            </div>
                        ))}
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-muted-foreground">Add-ons subtotal</span>
                            <span>RM{addOnsTotal}</span>
                        </div>
                    </div>
                )}

                {/* Total */}
                <div className="flex justify-between text-xl font-bold border-t pt-4">
                    <span>Total</span>
                    <span className="text-primary">RM{totalPrice}</span>
                </div>

                {/* Auto-cancel warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                    <p className="text-amber-800">
                        <strong>⏰ Important:</strong> Please confirm your booking via WhatsApp within {timeoutHours} hours.
                        Unconfirmed bookings will be automatically cancelled to free up dates for other guests.
                    </p>
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
