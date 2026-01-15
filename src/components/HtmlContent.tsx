import React from 'react';

interface HtmlContentProps {
    content: string;
    className?: string;
}

export default function HtmlContent({ content, className = "" }: HtmlContentProps) {
    if (!content) return null;

    return (
        <div
            className={`prose prose-sm max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}
