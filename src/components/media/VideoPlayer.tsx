"use client";

import HtmlContent from "@/components/HtmlContent";

interface VideoPlayerProps {
    src: string;
    title?: string;
    description?: string;
    poster?: string;
}

export default function VideoPlayer({ src, title, description, poster }: VideoPlayerProps) {
    return (
        <div className="w-full">
            {title && (
                <h4 className="text-base font-semibold mb-2 font-[family-name:var(--font-prompt)] text-[var(--royal-blue)]">
                    {title}
                </h4>
            )}

            <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-900">
                <video
                    src={src}
                    poster={poster}
                    controls
                    preload="metadata"
                    className="w-full h-auto"
                >
                    <source src={src} type="video/mp4" />
                    <source src={src} type="video/webm" />
                    Your browser does not support the video tag.
                </video>
            </div>

            {description && (
                <div className="mt-2">
                    <HtmlContent content={description} className="text-sm text-gray-600" />
                </div>
            )}
        </div>
    );
}
