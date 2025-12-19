"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

export function GuestSelector() {
    const { guestCount, setGuestCount } = useBookingStore();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Number of Guests</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">{guestCount} Guests</span>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            disabled={guestCount <= 1}
                            onClick={() => setGuestCount(guestCount - 1)}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            onClick={() => setGuestCount(guestCount + 1)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
