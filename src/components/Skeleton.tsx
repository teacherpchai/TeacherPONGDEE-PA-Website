"use client";

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
}

// Base skeleton with shimmer animation
export function Skeleton({ className = "", width, height }: SkeletonProps) {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === "number" ? `${width}px` : width;
    if (height) style.height = typeof height === "number" ? `${height}px` : height;

    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
                       bg-[length:200%_100%] rounded ${className}`}
            style={style}
        />
    );
}

// Text skeleton - single line
export function SkeletonText({ width = "100%", className = "" }: { width?: string | number; className?: string }) {
    return <Skeleton className={`h-4 ${className}`} width={width} />;
}

// Multiple lines of text
export function SkeletonParagraph({ lines = 3, className = "" }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonText key={i} width={i === lines - 1 ? "75%" : "100%"} />
            ))}
        </div>
    );
}

// Avatar skeleton
export function SkeletonAvatar({ size = 40, className = "" }: { size?: number; className?: string }) {
    return <Skeleton className={`rounded-full ${className}`} width={size} height={size} />;
}

// Card skeleton
export function SkeletonCard({ className = "" }: { className?: string }) {
    return (
        <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
            <div className="flex items-center gap-4 mb-4">
                <SkeletonAvatar size={48} />
                <div className="flex-1 space-y-2">
                    <SkeletonText width="60%" />
                    <SkeletonText width="40%" />
                </div>
            </div>
            <SkeletonParagraph lines={3} />
        </div>
    );
}

// Table row skeleton
export function SkeletonTableRow({ columns = 5, className = "" }: { columns?: number; className?: string }) {
    return (
        <tr className={className}>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-3 px-4">
                    <SkeletonText width={i === 1 ? "80%" : "60%"} />
                </td>
            ))}
        </tr>
    );
}

// Dashboard summary card skeleton
export function SkeletonSummaryCard({ className = "" }: { className?: string }) {
    return (
        <div className={`bg-white rounded-xl shadow-lg p-4 border border-gray-100 ${className}`}>
            <Skeleton className="w-12 h-12 rounded-xl mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <SkeletonText width="80%" />
        </div>
    );
}

// Progress bar skeleton
export function SkeletonProgress({ className = "" }: { className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex justify-between">
                <SkeletonText width="40%" />
                <SkeletonText width="20%" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
        </div>
    );
}

// PA Accordion skeleton
export function SkeletonAccordion({ className = "" }: { className?: string }) {
    return (
        <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${className}`}>
            <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                    <SkeletonText width="70%" className="mb-2" />
                    <SkeletonText width="40%" />
                </div>
                <Skeleton className="w-6 h-6 rounded" />
            </div>
        </div>
    );
}

// Dashboard loading skeleton
export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonSummaryCard key={i} />
                ))}
            </div>

            {/* Category progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <SkeletonText width="200px" className="mb-4 h-6" />
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonProgress key={i} />
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <SkeletonText width="200px" className="mb-4 h-6" />
                <table className="w-full">
                    <tbody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonTableRow key={i} columns={6} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// PA Page loading skeleton
export function PAPageSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonAccordion key={i} />
            ))}
        </div>
    );
}
