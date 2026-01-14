"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, Image as ImageIcon, Video } from "lucide-react";
import type { EvidenceFile } from "@/types";

interface MediaGalleryProps {
    files: EvidenceFile[];
    title?: string;
}

export default function MediaGallery({ files, title }: MediaGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter only images and videos
    const mediaFiles = files.filter(f => f.type === "image" || f.type === "video");

    if (mediaFiles.length === 0) {
        return null;
    }

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const goNext = () => {
        setCurrentIndex((prev) => (prev + 1) % mediaFiles.length);
    };

    const goPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + mediaFiles.length) % mediaFiles.length);
    };

    return (
        <div className="w-full">
            {title && (
                <h4
                    className="text-sm font-medium mb-3 flex items-center gap-2 font-[family-name:var(--font-sarabun)]"
                    style={{ color: "var(--royal-blue)" }}
                >
                    <ImageIcon size={16} />
                    {title}
                </h4>
            )}

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {mediaFiles.map((file, index) => (
                    <button
                        key={file.id || index}
                        onClick={() => openLightbox(index)}
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity group"
                    >
                        {file.type === "image" ? (
                            <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <Play size={24} className="text-white" />
                            </div>
                        )}

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            {file.type === "video" && (
                                <Video size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {/* Navigation */}
                    {mediaFiles.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                                className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); goNext(); }}
                                className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}

                    {/* Media Content */}
                    <div
                        className="max-w-4xl max-h-[80vh] mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {mediaFiles[currentIndex].type === "image" ? (
                            <img
                                src={mediaFiles[currentIndex].url}
                                alt={mediaFiles[currentIndex].name}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                            />
                        ) : (
                            <video
                                src={mediaFiles[currentIndex].url}
                                controls
                                autoPlay
                                className="max-w-full max-h-[80vh] rounded-lg"
                            />
                        )}

                        {/* Caption */}
                        <p className="text-center text-white/80 mt-4 font-[family-name:var(--font-sarabun)]">
                            {mediaFiles[currentIndex].name}
                            <span className="text-white/50 ml-2">
                                ({currentIndex + 1} / {mediaFiles.length})
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
