"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RoomCount } from "@/types/database";
import { Home } from "lucide-react";

interface RoomSelectorProps {
    prices: {
        price_3_rooms: number;
        price_4_rooms: number;
        price_6_rooms: number;
    };
}

const ROOM_OPTIONS: { count: RoomCount; label: string }[] = [
    { count: 3, label: "3 Rooms" },
    { count: 4, label: "4 Rooms" },
    { count: 6, label: "6 Rooms" },
];

export function RoomSelector({ prices }: RoomSelectorProps) {
    const { roomCount, setRoomCount } = useBookingStore();

    const getPrice = (count: RoomCount) => {
        switch (count) {
            case 3: return prices.price_3_rooms;
            case 4: return prices.price_4_rooms;
            case 6: return prices.price_6_rooms;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Select Rooms
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    {ROOM_OPTIONS.map((option) => (
                        <Button
                            key={option.count}
                            variant={roomCount === option.count ? "default" : "outline"}
                            className={`h-auto py-4 flex flex-col gap-1 ${roomCount === option.count
                                    ? "ring-2 ring-primary ring-offset-2"
                                    : ""
                                }`}
                            onClick={() => setRoomCount(option.count)}
                        >
                            <span className="text-lg font-bold">{option.label}</span>
                            <span className={`text-sm ${roomCount === option.count ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                RM{getPrice(option.count)}/night
                            </span>
                        </Button>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                    Price varies based on the number of rooms you need
                </p>
            </CardContent>
        </Card>
    );
}
