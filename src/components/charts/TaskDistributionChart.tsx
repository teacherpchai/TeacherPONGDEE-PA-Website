"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from "recharts";
import { CategoryStats } from "@/lib/dashboardUtils";
import { getCategoryEmoji } from "@/lib/dashboardUtils";

interface TaskDistributionChartProps {
    data: CategoryStats[];
}

export default function TaskDistributionChart({ data }: TaskDistributionChartProps) {
    // Transform data for Bar Chart
    const chartData = data.map((item) => ({
        name: item.labelTh,
        tasks: item.totalTasks,
        evidence: Math.floor(item.totalFields / 3), // Rough estimation of evidence based on filled fields, or simply replace with real evidence count if available
    }));

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fill: '#4b5563', fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="tasks" name="จำนวนงาน (Tasks)" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
