"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useBookingStore } from "@/store/useBookingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlockedDates } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface BookingCalendarProps {
    propertyId: string;
}

export function BookingCalendar({ propertyId }: BookingCalendarProps) {
    const { dateRange, setDateRange } = useBookingStore();
    const [blockedDates, setBlockedDates] = useState<Date[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchBlockedDates() {
            if (!propertyId) {
                setIsLoading(false);
                return;
            }

            try {
                const dates = await getBlockedDates(propertyId);
                setBlockedDates(dates);
            } catch (error) {
                console.error("Error fetching blocked dates:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchBlockedDates();
    }, [propertyId]);

    // Combine past dates and blocked dates for disabled matcher
    const disabledDates = [
        { before: new Date() }, // Disable past dates
        ...blockedDates.map(date => new Date(date)) // Disable blocked dates
    ];

    return (
        <Card id="booking-section">
            <CardHeader>
                <CardTitle className="text-xl">Select Your Dates</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => range && setDateRange({ from: range.from, to: range.to })}
                        disabled={disabledDates}
                        className="rounded-md border-none flex justify-center"
                        numberOfMonths={2}
                        modifiers={{
                            blocked: blockedDates
                        }}
                        modifiersStyles={{
                            blocked: {
                                backgroundColor: "hsl(var(--muted))",
                                color: "hsl(var(--muted-foreground))",
                                textDecoration: "line-through"
                            }
                        }}
                    />
                )}
                {blockedDates.length > 0 && !isLoading && (
                    <p className="text-sm text-muted-foreground text-center mt-4">
                        Strikethrough dates are unavailable
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
