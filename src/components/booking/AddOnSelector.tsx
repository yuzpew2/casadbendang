"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Gift } from "lucide-react";

interface AddOnItem {
    id: string;
    name: string;
    price: number;
}

interface AddOnSelectorProps {
    addOns: AddOnItem[];
}

export function AddOnSelector({ addOns }: AddOnSelectorProps) {
    const { selectedAddOns, toggleAddOn } = useBookingStore();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Enhance Your Stay (Add-ons)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addOns.map((addon) => {
                        const isSelected = selectedAddOns.find(i => i.id === addon.id);
                        return (
                            <Button
                                key={addon.id}
                                variant="outline"
                                className={cn(
                                    "h-auto flex-col items-start p-4 hover:border-primary transition-all",
                                    isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                                )}
                                onClick={() => toggleAddOn(addon)}
                            >
                                <div className="flex w-full justify-between items-center">
                                    <span className="font-bold">{addon.name}</span>
                                    <span className="text-primary font-bold">RM{addon.price}</span>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
