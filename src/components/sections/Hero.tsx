"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroProps {
    title: string;
    description: string;
    images: string[];
}

export function Hero({ title, description, images }: HeroProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance slider
    useEffect(() => {
        if (images.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [images.length]);

    const scrollToBooking = () => {
        const calendar = document.getElementById("booking-section");
        calendar?.scrollIntoView({ behavior: "smooth" });
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const currentImage = images[currentIndex] || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2000';

    return (
        <section className="relative h-[80vh] w-full overflow-hidden">
            {/* Background Image with Transition */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
                style={{ backgroundImage: `url(${currentImage})` }}
            >
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Navigation Arrows (only show if multiple images) */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                </>
            )}

            {/* Content */}
            <div className="relative flex h-full flex-col items-center justify-center px-4 text-center text-white">
                <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-bold tracking-tight md:text-7xl drop-shadow-lg italic">
                    {title}
                </h1>
                <p className="mt-6 max-w-2xl text-lg md:text-xl drop-shadow">
                    {description}
                </p>
                <div className="mt-10 flex gap-4">
                    <Button
                        size="lg"
                        className="rounded-full px-8 py-6 text-lg shadow-xl hover:scale-105 transition-transform"
                        onClick={scrollToBooking}
                    >
                        Book Now
                    </Button>
                </div>
            </div>

            {/* Dots Navigation (only show if multiple images) */}
            {images.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                ? "bg-white scale-110"
                                : "bg-white/50 hover:bg-white/75"
                                }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
