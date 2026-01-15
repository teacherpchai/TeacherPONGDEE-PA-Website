"use client";

import HtmlContent from "@/components/HtmlContent";

interface YouTubeEmbedProps {
    videoId: string;
    title?: string;
    description?: string;
}

// Extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

export default function YouTubeEmbed({ videoId, title, description }: YouTubeEmbedProps) {
    return (
        <div className="w-full">
            {title && (
                <h4 className="text-base font-semibold mb-2 font-[family-name:var(--font-prompt)] text-[var(--royal-blue)]">
                    {title}
                </h4>
            )}

            {/* Responsive 16:9 aspect ratio container */}
            <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden shadow-lg bg-gray-900">
                <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                    title={title || "YouTube video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>

            {description && (
                <div className="mt-2">
                    <HtmlContent content={description} className="text-sm text-gray-600" />
                </div>
            )}
        </div>
    );
}
