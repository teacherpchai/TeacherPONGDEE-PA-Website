"use client";

import type { VisualizationData } from "@/types";
import SimpleBarChart from "./SimpleBarChart";
import ProgressBar from "./ProgressBar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface VisualizationRendererProps {
    data: VisualizationData;
    className?: string;
}

// Default color palette
const COLORS = [
    "#002366", // royal blue
    "#D4AF37", // gold
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
];

export default function VisualizationRenderer({ data, className = "" }: VisualizationRendererProps) {
    if (!data || data.chartType === "none" || !data.dataPoints || data.dataPoints.length === 0) {
        return null;
    }

    switch (data.chartType) {
        case "bar":
            return (
                <div className={className}>
                    <SimpleBarChart
                        data={data.dataPoints}
                        title={data.chartTitle}
                    />
                </div>
            );

        case "progress":
            return (
                <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
                    {data.chartTitle && (
                        <h3
                            className="text-lg font-semibold mb-4 font-[family-name:var(--font-prompt)]"
                            style={{ color: "var(--royal-blue)" }}
                        >
                            {data.chartTitle}
                        </h3>
                    )}
                    <div className="space-y-4">
                        {data.dataPoints.map((item, index) => (
                            <ProgressBar
                                key={index}
                                label={item.label}
                                value={item.value}
                                maxValue={item.maxValue || 100}
                                color={item.color || COLORS[index % COLORS.length]}
                                size="md"
                            />
                        ))}
                    </div>
                </div>
            );

        case "pie":
            const pieData = data.dataPoints.map((item, index) => ({
                name: item.label,
                value: item.value,
                fill: item.color || COLORS[index % COLORS.length],
            }));

            return (
                <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
                    {data.chartTitle && (
                        <h3
                            className="text-lg font-semibold mb-4 font-[family-name:var(--font-prompt)]"
                            style={{ color: "var(--royal-blue)" }}
                        >
                            {data.chartTitle}
                        </h3>
                    )}
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                label
                                labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            );

        default:
            return null;
    }
}
