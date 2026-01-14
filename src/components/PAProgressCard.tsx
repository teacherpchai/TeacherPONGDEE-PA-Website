"use client";

import { BookOpen, HeartHandshake, TrendingUp, Target } from "lucide-react";

interface CategoryProgress {
    category: string;
    label: string;
    filled: number;
    total: number;
}

interface PAProgressCardProps {
    progress: CategoryProgress[];
    compact?: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
    learning: BookOpen,
    support: HeartHandshake,
    self_dev: TrendingUp,
    challenge: Target,
};

const categoryColors: Record<string, string> = {
    learning: "#2563eb",
    support: "#059669",
    self_dev: "#7c3aed",
    challenge: "#dc2626",
};

function CircularProgress({
    percent,
    size = 60,
    strokeWidth = 6,
    color = "#2563eb",
    showLabel = true
}: {
    percent: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    showLabel?: boolean;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            {showLabel && (
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ fontSize: size * 0.22 }}
                >
                    <span className="font-bold text-gray-700">{Math.round(percent)}%</span>
                </div>
            )}
        </div>
    );
}

export default function PAProgressCard({ progress, compact = false }: PAProgressCardProps) {
    const totalFilled = progress.reduce((sum, p) => sum + p.filled, 0);
    const totalAll = progress.reduce((sum, p) => sum + p.total, 0);
    const overallPercent = totalAll > 0 ? (totalFilled / totalAll) * 100 : 0;

    if (compact) {
        // Compact version for Navbar or small spaces
        return (
            <div className="flex items-center gap-3">
                <CircularProgress
                    percent={overallPercent}
                    size={40}
                    strokeWidth={4}
                    color="var(--gold)"
                />
                <div className="text-sm">
                    <span className="font-bold text-gray-700">{totalFilled}/{totalAll}</span>
                    <span className="text-gray-500 ml-1">รายการ</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
            {/* Header with overall progress */}
            <div className="flex items-center justify-between mb-6">
                <h3
                    className="text-lg font-bold font-[family-name:var(--font-prompt)]"
                    style={{ color: "var(--royal-blue)" }}
                >
                    ความคืบหน้า PA
                </h3>
                <div className="flex items-center gap-3">
                    <CircularProgress
                        percent={overallPercent}
                        size={50}
                        strokeWidth={5}
                        color="var(--gold)"
                    />
                    <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: "var(--royal-blue)" }}>
                            {totalFilled}/{totalAll}
                        </div>
                        <div className="text-xs text-gray-500">รายการ</div>
                    </div>
                </div>
            </div>

            {/* Category progress */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {progress.map((cat) => {
                    const Icon = categoryIcons[cat.category] || Target;
                    const color = categoryColors[cat.category] || "#6b7280";
                    const percent = cat.total > 0 ? (cat.filled / cat.total) * 100 : 0;

                    return (
                        <div
                            key={cat.category}
                            className="flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105"
                            style={{ backgroundColor: `${color}10` }}
                        >
                            <CircularProgress
                                percent={percent}
                                size={48}
                                strokeWidth={4}
                                color={color}
                                showLabel={false}
                            />
                            <div className="mt-2 flex items-center gap-1">
                                <Icon size={14} style={{ color }} />
                                <span className="text-xs font-medium" style={{ color }}>
                                    {cat.label}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {cat.filled}/{cat.total}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Export CircularProgress for reuse
export { CircularProgress };
