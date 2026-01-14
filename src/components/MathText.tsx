"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import React from "react";

interface MathTextProps {
    children: string;
    className?: string;
    block?: boolean;
}

/**
 * MathText Component
 * 
 * Renders text with inline LaTeX math expressions.
 * Use $...$ for inline math.
 * Use $$...$$ for display/block math.
 * 
 * Examples:
 * - Inline: "ค่าเฉลี่ย $\bar{x} = \frac{\sum x}{n}$"
 * - Block: "สูตร $$s = \sqrt{\frac{\sum(x-\bar{x})^2}{n-1}}$$"
 */
export default function MathText({ children, className = "", block = false }: MathTextProps) {
    if (!children) return null;

    const renderContent = () => {
        const parts: React.ReactNode[] = [];
        let remaining = children;
        let keyCounter = 0;

        // Process block math first ($$...$$)
        const blockRegex = /\$\$([\s\S]+?)\$\$/g;
        let blockMatch;
        let lastIndex = 0;

        while ((blockMatch = blockRegex.exec(children)) !== null) {
            if (blockMatch.index > lastIndex) {
                const textBefore = children.slice(lastIndex, blockMatch.index);
                parts.push(...processInlineMath(textBefore, keyCounter));
                keyCounter += 10;
            }

            parts.push(
                <div key={`block-${keyCounter++}`} className="my-4 overflow-x-auto">
                    <SafeBlockMath math={blockMatch[1].trim()} />
                </div>
            );

            lastIndex = blockMatch.index + blockMatch[0].length;
        }

        if (lastIndex < children.length) {
            remaining = children.slice(lastIndex);
            parts.push(...processInlineMath(remaining, keyCounter));
        } else if (lastIndex === 0) {
            parts.push(...processInlineMath(children, keyCounter));
        }

        return parts;
    };

    const processInlineMath = (text: string, startKey: number): React.ReactNode[] => {
        const result: React.ReactNode[] = [];
        const inlineRegex = /\$([^$]+)\$/g;
        let match;
        let lastIdx = 0;
        let key = startKey;

        while ((match = inlineRegex.exec(text)) !== null) {
            if (match.index > lastIdx) {
                result.push(text.slice(lastIdx, match.index));
            }

            result.push(<SafeInlineMath key={`inline-${key++}`} math={match[1]} />);
            lastIdx = match.index + match[0].length;
        }

        if (lastIdx < text.length) {
            result.push(text.slice(lastIdx));
        }

        return result;
    };

    if (block) {
        return (
            <div className={`whitespace-pre-wrap ${className}`}>
                {renderContent()}
            </div>
        );
    }

    return (
        <span className={`whitespace-pre-wrap ${className}`}>
            {renderContent()}
        </span>
    );
}

// Safe wrapper for InlineMath (handles errors internally)
function SafeInlineMath({ math }: { math: string }) {
    // KaTeX handles errors gracefully with errorColor
    return <InlineMath math={math} errorColor="#ef4444" />;
}

// Safe wrapper for BlockMath
function SafeBlockMath({ math }: { math: string }) {
    return <BlockMath math={math} errorColor="#ef4444" />;
}

/**
 * MathBlock Component - for display equations only
 */
export function MathBlock({ math, className = "" }: { math: string; className?: string }) {
    return (
        <div className={`my-4 overflow-x-auto ${className}`}>
            <BlockMath math={math} errorColor="#ef4444" />
        </div>
    );
}
