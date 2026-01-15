"use client";

import { useMemo } from "react";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import { Clock, BookOpen, Users, TrendingUp, Target } from "lucide-react";
import { StructuredSemesterWorkload, HOURS_PER_PERIOD } from "@/types";

interface WorkloadDashboardProps {
    workload: StructuredSemesterWorkload;
}

const COLORS = ["#1e40af", "#10b981", "#8b5cf6", "#f97316"]; // Blue, Green, Purple, Orange

export default function WorkloadDashboard({ workload }: WorkloadDashboardProps) {
    // 1. Calculate Stats
    const stats = useMemo(() => {
        const teachingHours = workload.teachingSubjects.reduce((sum, s) => sum + (s.periodsPerWeek || 0), 0) * HOURS_PER_PERIOD;
        const supportHours = workload.supportWork.reduce((sum, i) => sum + (i.hoursPerWeek || 0), 0);
        const devHours = workload.developmentWork.reduce((sum, i) => sum + (i.hoursPerWeek || 0), 0);
        const policyHours = workload.policyWork.reduce((sum, i) => sum + (i.hoursPerWeek || 0), 0);
        const totalHours = teachingHours + supportHours + devHours + policyHours;

        return {
            teachingHours,
            supportHours,
            devHours,
            policyHours,
            totalHours
        };
    }, [workload]);

    // 2. Prepare Chart Data (Donut)
    const distributionData = [
        { name: "งานสอน", value: stats.teachingHours, color: COLORS[0] },
        { name: "งานสนับสนุน", value: stats.supportHours, color: COLORS[1] },
        { name: "งานพัฒนา", value: stats.devHours, color: COLORS[2] },
        { name: "งานนโยบาย", value: stats.policyHours, color: COLORS[3] },
    ].filter(d => d.value > 0);

    // 3. Prepare Chart Data (Top Subjects - Bar)
    const subjectData = [...workload.teachingSubjects]
        .sort((a, b) => (b.periodsPerWeek || 0) - (a.periodsPerWeek || 0))
        .slice(0, 5)
        .map(s => ({
            name: s.subjectCode,
            hours: (s.periodsPerWeek * HOURS_PER_PERIOD).toFixed(2),
            periods: s.periodsPerWeek
        }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 space-y-6"
        >
            {/* Header / Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="ภาระงานรวม"
                    value={stats.totalHours.toFixed(2)}
                    unit="ชม./สัปดาห์"
                    icon={<Clock className="text-white" size={24} />}
                    color="bg-gradient-to-br from-blue-600 to-indigo-700"
                />
                <SummaryCard
                    title="งานสอน"
                    value={stats.teachingHours.toFixed(2)}
                    unit="ชม."
                    icon={<BookOpen className="text-blue-600" size={24} />}
                    color="bg-white border-l-4 border-blue-600"
                    textColor="text-blue-700"
                />
                <SummaryCard
                    title="งานสนับสนุน"
                    value={stats.supportHours.toFixed(2)}
                    unit="ชม."
                    icon={<Users className="text-green-600" size={24} />}
                    color="bg-white border-l-4 border-green-600"
                    textColor="text-green-700"
                />
                <SummaryCard
                    title="งานอื่น ๆ"
                    value={(stats.devHours + stats.policyHours).toFixed(2)}
                    unit="ชม."
                    icon={<TrendingUp className="text-purple-600" size={24} />}
                    color="bg-white border-l-4 border-purple-600"
                    textColor="text-purple-700"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donut Chart: Overall Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 font-[family-name:var(--font-prompt)]">สัดส่วนภาระงาน</h3>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `${Number(value).toFixed(2)} ชม.`}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart: Teaching Load by Subject */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 font-[family-name:var(--font-prompt)]">ชั่วโมงสอนรายวิชา (Top 5)</h3>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                <XAxis type="number" unit=" ชม." fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} width={60} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(value: any) => [`${value} ชม.`, 'เวลาสอน']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="hours" fill="var(--royal-blue)" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SummaryCard({ title, value, unit, icon, color, textColor = "text-white" }: any) {
    return (
        <div className={`p-5 rounded-2xl shadow-sm ${color} transition-transform hover:-translate-y-1 duration-300`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className={`text-sm font-medium opacity-80 mb-1 ${textColor === "text-white" ? "text-blue-100" : "text-gray-500"}`}>{title}</p>
                    <div className="flex items-baseline gap-1">
                        <h4 className={`text-3xl font-bold font-[family-name:var(--font-prompt)] ${textColor}`}>{value}</h4>
                        <span className={`text-xs ${textColor === "text-white" ? "text-blue-200" : "text-gray-400"}`}>{unit}</span>
                    </div>
                </div>
                <div className={`p-3 rounded-xl ${textColor === "text-white" ? "bg-white/20" : "bg-gray-50"}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
