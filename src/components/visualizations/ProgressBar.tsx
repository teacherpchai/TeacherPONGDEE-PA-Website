"use client";

interface ProgressBarProps {
    label: string;
    value: number;
    maxValue?: number;
    color?: string;
    showPercentage?: boolean;
    size?: "sm" | "md" | "lg";
}

export default function ProgressBar({
    label,
    value,
    maxValue = 100,
    color = "var(--gold)",
    showPercentage = true,
    size = "md",
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);

    const heights = {
        sm: "h-2",
        md: "h-4",
        lg: "h-6",
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 font-[family-name:var(--font-sarabun)]">
                    {label}
                </span>
                {showPercentage && (
                    <span
                        className="text-sm font-bold font-[family-name:var(--font-prompt)]"
                        style={{ color }}
                    >
                        {percentage.toFixed(0)}%
                    </span>
                )}
            </div>

            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}>
                <div
                    className={`${heights[size]} rounded-full transition-all duration-700 ease-out`}
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                    }}
                />
            </div>

            {!showPercentage && (
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{value.toLocaleString()}</span>
                    <span>/ {maxValue.toLocaleString()}</span>
                </div>
            )}
        </div>
    );
}
