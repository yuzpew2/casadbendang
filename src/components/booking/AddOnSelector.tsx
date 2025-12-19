"use client";

import { useBookingStore } from "@/store/useBookingStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Gift, Check } from "lucide-react";

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

    if (addOns.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Enhance Your Stay
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Select add-ons to customize your experience (optional)
                </p>
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
                                    "h-auto flex-col items-start p-4 hover:border-primary transition-all relative",
                                    isSelected && "border-primary bg-primary/5 ring-2 ring-primary"
                                )}
                                onClick={() => toggleAddOn(addon)}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                <div className="flex w-full justify-between items-center">
                                    <span className="font-bold text-left">{addon.name}</span>
                                    <span className="text-primary font-bold">+RM{addon.price}</span>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
