"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ChartDataPoint } from "@/types";

interface SimpleBarChartProps {
    data: ChartDataPoint[];
    title?: string;
    height?: number;
}

// Default color palette
const COLORS = [
    "var(--royal-blue)",
    "var(--gold)",
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
];

export default function SimpleBarChart({
    data,
    title,
    height = 300,
}: SimpleBarChartProps) {
    // Transform data for Recharts
    const chartData = data.map((item, index) => ({
        name: item.label,
        value: item.value,
        fill: item.color || COLORS[index % COLORS.length],
    }));

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
            {title && (
                <h3
                    className="text-lg font-semibold mb-4 font-[family-name:var(--font-prompt)]"
                    style={{ color: "var(--royal-blue)" }}
                >
                    {title}
                </h3>
            )}

            <ResponsiveContainer width="100%" height={height}>
                <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="name"
                        tick={{
                            fontSize: 12,
                            fill: "#6b7280",
                            fontFamily: "var(--font-sarabun)"
                        }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis
                        tick={{
                            fontSize: 12,
                            fill: "#6b7280"
                        }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        labelStyle={{
                            color: "var(--royal-blue)",
                            fontWeight: 600,
                        }}
                    />
                    <Bar
                        dataKey="value"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
