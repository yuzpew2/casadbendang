"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useBookingStore } from "@/store/useBookingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlockedDates } from "@/lib/supabase";
import { Loader2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { eachDayOfInterval, isSameDay } from "date-fns";
import type { DateRange } from "react-day-picker";

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

    // Check if a date is blocked
    const isDateBlocked = useCallback((date: Date) => {
        return blockedDates.some(blocked => isSameDay(new Date(blocked), date));
    }, [blockedDates]);

    // Validate if selected range contains any blocked dates
    const hasBlockedDatesInRange = useCallback((from: Date, to: Date): boolean => {
        const daysInRange = eachDayOfInterval({ start: from, end: to });
        return daysInRange.some(day => isDateBlocked(day));
    }, [isDateBlocked]);

    // Handle date selection with validation
    const handleSelect = (range: DateRange | undefined) => {
        if (!range) {
            setDateRange({ from: undefined, to: undefined });
            return;
        }

        // If both dates are selected, validate the range
        if (range.from && range.to) {
            if (hasBlockedDatesInRange(range.from, range.to)) {
                toast.error("Your selected dates include unavailable dates. Please choose different dates.");
                // Reset selection
                setDateRange({ from: undefined, to: undefined });
                return;
            }
        }

        setDateRange({ from: range.from, to: range.to });
    };

    // Combine past dates and blocked dates for disabled matcher
    const disabledDates = [
        { before: new Date() }, // Disable past dates
        ...blockedDates.map(date => new Date(date)) // Disable blocked dates
    ];

    return (
        <Card id="booking-section">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    Select Your Dates
                </CardTitle>
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
                        onSelect={handleSelect}
                        disabled={disabledDates}
                        className="rounded-md border-none flex justify-center"
                        numberOfMonths={2}
                        modifiers={{
                            blocked: blockedDates
                        }}
                        modifiersStyles={{
                            blocked: {
                                backgroundColor: "hsl(var(--destructive) / 0.1)",
                                color: "hsl(var(--destructive))",
                                textDecoration: "line-through"
                            }
                        }}
                    />
                )}
                {blockedDates.length > 0 && !isLoading && (
                    <p className="text-sm text-muted-foreground text-center mt-4">
                        <span className="inline-block w-3 h-3 bg-destructive/10 rounded mr-1"></span>
                        Strikethrough dates are unavailable
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
