import React from 'react';

interface HtmlContentProps {
    content: string;
    className?: string;
}

const unescapeHtml = (str: string) => {
    return str
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");
};

export default function HtmlContent({ content, className = "" }: HtmlContentProps) {
    if (!content) return null;

    let finalContent = content;
    // Heuristic: If content starts with an escaped tag (like &lt;p), it's likely double-escaped
    if (content.trim().startsWith("&lt;")) {
        finalContent = unescapeHtml(content);
    }

    return (
        <div
            className={`prose prose-sm max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: finalContent }}
        />
    );
}
