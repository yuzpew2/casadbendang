"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryProps {
    images: { url: string; alt_text?: string | null }[];
    title?: string;
}

export function Gallery({ images, title = "Explore Our Homestay" }: GalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (images.length === 0) return null;

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = "auto";
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") goToPrevious();
        if (e.key === "ArrowRight") goToNext();
    };

    return (
        <>
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold">{title}</h2>
                        <p className="text-muted-foreground mt-2">
                            Click on any image to view full size
                        </p>
                    </div>

                    {/* Thumbnail Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => openLightbox(index)}
                                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                <Image
                                    src={image.url}
                                    alt={image.alt_text || `Property image ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={closeLightbox}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Close Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
                        onClick={closeLightbox}
                    >
                        <X className="w-6 h-6" />
                    </Button>

                    {/* Navigation - Previous */}
                    {images.length > 1 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrevious();
                            }}
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </Button>
                    )}

                    {/* Main Image */}
                    <div
                        className="relative w-full h-full max-w-5xl max-h-[80vh] mx-auto px-16"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={images[currentIndex].url}
                            alt={images[currentIndex].alt_text || `Property image ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Navigation - Next */}
                    {images.length > 1 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                            }}
                        >
                            <ChevronRight className="w-8 h-8" />
                        </Button>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                        {currentIndex + 1} / {images.length}
                    </div>

                    {/* Thumbnail Strip */}
                    {images.length > 1 && (
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 pb-2">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(index);
                                    }}
                                    className={`relative w-16 h-12 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${index === currentIndex
                                            ? "border-white scale-110"
                                            : "border-transparent opacity-50 hover:opacity-100"
                                        }`}
                                >
                                    <Image
                                        src={image.url}
                                        alt={image.alt_text || `Thumbnail ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
