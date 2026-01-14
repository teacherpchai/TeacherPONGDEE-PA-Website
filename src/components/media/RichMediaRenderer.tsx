"use client";

import type { RichMediaItem } from "@/types";
import YouTubeEmbed from "./YouTubeEmbed";
import ImageWithCaption from "./ImageWithCaption";
import VideoPlayer from "./VideoPlayer";

interface RichMediaRendererProps {
    items: RichMediaItem[];
    className?: string;
}

export default function RichMediaRenderer({ items, className = "" }: RichMediaRendererProps) {
    if (!items || items.length === 0) return null;

    // Sort by order
    const sortedItems = [...items].sort((a, b) => a.order - b.order);

    return (
        <div className={`space-y-6 ${className}`}>
            <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2 font-[family-name:var(--font-sarabun)]">
                🖼️ สื่อประกอบ ({items.length} รายการ)
            </h4>

            <div className="grid gap-6 md:grid-cols-2">
                {sortedItems.map((item) => {
                    switch (item.type) {
                        case "youtube":
                            return (
                                <div key={item.id} className="md:col-span-2">
                                    <YouTubeEmbed
                                        videoId={item.youtubeId || ""}
                                        title={item.title}
                                        description={item.description}
                                    />
                                </div>
                            );

                        case "video":
                            return (
                                <div key={item.id} className="md:col-span-2">
                                    <VideoPlayer
                                        src={item.url}
                                        title={item.title}
                                        description={item.description}
                                        poster={item.thumbnailUrl}
                                    />
                                </div>
                            );

                        case "image":
                            return (
                                <div key={item.id}>
                                    <ImageWithCaption
                                        src={item.url}
                                        title={item.title}
                                        description={item.description}
                                    />
                                </div>
                            );

                        default:
                            return null;
                    }
                })}
            </div>
        </div>
    );
}
