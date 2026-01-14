"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number | string;
    unit?: string;
    previousValue?: number;
    color?: string;
    icon?: React.ReactNode;
}

export default function StatCard({
    title,
    value,
    unit = "",
    previousValue,
    color = "var(--royal-blue)",
    icon,
}: StatCardProps) {
    const numericValue = typeof value === "number" ? value : parseFloat(value) || 0;
    const change = previousValue ? numericValue - previousValue : null;
    const changePercent = previousValue && previousValue !== 0
        ? ((change || 0) / previousValue * 100).toFixed(1)
        : null;

    return (
        <div
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4"
            style={{ borderLeftColor: color }}
        >
            <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-gray-500 font-[family-name:var(--font-sarabun)]">
                    {title}
                </span>
                {icon && (
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${color}20`, color }}
                    >
                        {icon}
                    </div>
                )}
            </div>

            <div className="flex items-end gap-2">
                <span
                    className="text-3xl font-bold font-[family-name:var(--font-prompt)]"
                    style={{ color }}
                >
                    {typeof value === "number" ? value.toLocaleString() : value}
                </span>
                {unit && (
                    <span className="text-lg text-gray-500 mb-1">{unit}</span>
                )}
            </div>

            {change !== null && changePercent !== null && (
                <div className="flex items-center gap-1 mt-2">
                    {change > 0 ? (
                        <TrendingUp size={16} className="text-green-500" />
                    ) : change < 0 ? (
                        <TrendingDown size={16} className="text-red-500" />
                    ) : (
                        <Minus size={16} className="text-gray-400" />
                    )}
                    <span
                        className={`text-sm font-medium ${change > 0 ? "text-green-500" :
                            change < 0 ? "text-red-500" : "text-gray-400"
                            }`}
                    >
                        {change > 0 ? "+" : ""}{changePercent}%
                    </span>
                    <span className="text-xs text-gray-400">vs previous</span>
                </div>
            )}
        </div>
    );
}
