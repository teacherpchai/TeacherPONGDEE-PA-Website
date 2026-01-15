"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import HtmlContent from "@/components/HtmlContent";

interface ImageWithCaptionProps {
    src: string;
    alt?: string;
    title?: string;
    description?: string;
    enableLightbox?: boolean;
}

export default function ImageWithCaption({
    src,
    alt,
    title,
    description,
    enableLightbox = true,
}: ImageWithCaptionProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const openLightbox = () => {
        if (enableLightbox) setLightboxOpen(true);
    };

    return (
        <div className="w-full">
            {title && (
                <h4 className="text-base font-semibold mb-2 font-[family-name:var(--font-prompt)] text-[var(--royal-blue)]">
                    {title}
                </h4>
            )}

            <div
                className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100 group cursor-pointer"
                onClick={openLightbox}
            >
                {/* Use regular img for external URLs from Google Drive */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt || title || "Image"}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {enableLightbox && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn
                            size={32}
                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                        />
                    </div>
                )}
            </div>

            {description && (
                <div className="mt-2">
                    <HtmlContent content={description} className="text-sm text-gray-600" />
                </div>
            )}

            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="ปิด"
                    >
                        <X size={24} />
                    </button>

                    <div onClick={(e) => e.stopPropagation()}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt={alt || title || "Image"}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg"
                        />
                        {(title || description) && (
                            <div className="text-center text-white/80 mt-4 font-[family-name:var(--font-sarabun)]">
                                {title}
                                {description && (
                                    <div className="inline-block text-left mt-1">
                                        - <HtmlContent content={description} className="inline" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
