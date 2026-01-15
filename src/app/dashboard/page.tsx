"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    CheckCircle2,
    FileText,
    Film,
    ArrowLeft,
    BookOpen,
    HeartHandshake,
    TrendingUp,
    Target,
    Loader2,
    ExternalLink,
} from "lucide-react";
import { firebaseService } from "@/lib/firebaseService";
import { PATask, Profile, FiscalYear } from "@/types";
import {
    calculateDashboardStats,
    DashboardStats,
    getCategoryEmoji,
} from "@/lib/dashboardUtils";
import ExportPDFButton from "@/components/ExportPDFButton";

// Category icon mapping
const categoryIcons = {
    learning: BookOpen,
    support: HeartHandshake,
    self_dev: TrendingUp,
    challenge: Target,
};

export default function DashboardPage() {
    const router = useRouter();
    const [years, setYears] = useState<FiscalYear[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [tasks, setTasks] = useState<PATask[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load years and profile on mount
    useEffect(() => {
        async function loadInitialData() {
            try {
                const yearData = await firebaseService.getYears();
                setYears(yearData);
                // Select active year or first year
                const activeYear = yearData.find((y) => y.isActive)?.year || yearData[0]?.year || "";

                // If no years found, default to current buddhish year roughly (logic optional but good safely)
                if (!activeYear && yearData.length > 0) {
                    setSelectedYear(yearData[0].year);
                } else if (activeYear) {
                    setSelectedYear(activeYear);
                }

                // Load site settings for profile
                const settings = await firebaseService.getSiteSettings();
                setProfile(settings.profile);
            } catch (error) {
                console.error("Failed to load initial data", error);
            }
        }
        loadInitialData();
    }, []);

    // Load PA records when year changes
    useEffect(() => {
        if (!selectedYear) return;

        async function loadData() {
            setIsLoading(true);
            try {
                const records = await firebaseService.getPARecords(selectedYear);
                setTasks(records);
                const dashboardStats = calculateDashboardStats(records);
                setStats(dashboardStats);
            } catch (error) {
                console.error("Failed to load PA records", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [selectedYear]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft size={20} className="text-[var(--royal-blue)]" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <LayoutDashboard className="text-[var(--royal-blue)]" size={24} />
                            <h1 className="text-xl font-bold text-[var(--royal-blue)] font-[family-name:var(--font-prompt)]">
                                PA Dashboard
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Year Selector */}
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-4 py-2 border rounded-lg bg-white font-medium text-[var(--royal-blue)]"
                            title="เลือกปีงบประมาณ"
                            aria-label="เลือกปีงบประมาณ"
                        >
                            <option value="">เลือกปี...</option>
                            {years.map((year) => (
                                <option key={year.year} value={year.year}>
                                    ปีงบประมาณ {year.year} {year.isActive && "★"}
                                </option>
                            ))}
                        </select>

                        {/* Export PDF Button */}
                        {profile && (
                            <ExportPDFButton
                                year={selectedYear}
                                tasks={tasks}
                                profile={profile}
                                size="md"
                            />
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-[var(--royal-blue)]" size={48} />
                    </div>
                ) : !stats ? (
                    <div className="text-center py-16 text-gray-500">
                        ไม่พบข้อมูล PA สำหรับปีงบประมาณนี้
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <SummaryCard
                                icon={ClipboardList}
                                value={stats.totalTasks}
                                label="PA Tasks"
                                color="blue"
                            />
                            <SummaryCard
                                icon={CheckCircle2}
                                value={`${stats.overallCompleteness}%`}
                                label="ความสมบูรณ์"
                                color="green"
                            />
                            <SummaryCard
                                icon={FileText}
                                value={stats.totalEvidence}
                                label="หลักฐาน"
                                color="purple"
                            />
                            <SummaryCard
                                icon={Film}
                                value={stats.totalRichMedia}
                                label="Rich Media"
                                color="orange"
                            />
                        </div>

                        {/* Category Progress */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                            <h2 className="text-lg font-semibold text-[var(--royal-blue)] mb-4 flex items-center gap-2">
                                📊 ความคืบหน้าตามหมวดหมู่
                            </h2>
                            <div className="space-y-4">
                                {stats.categoryStats.map((cat) => {
                                    // Use type assertion if necessary, or ensure category string matches keys
                                    const IconComponent = categoryIcons[cat.category as keyof typeof categoryIcons] || Target;
                                    return (
                                        <div key={cat.category} className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <IconComponent size={18} className="text-[var(--royal-blue)]" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {getCategoryEmoji(cat.category)} {cat.labelTh}
                                                    </span>
                                                    <span className="text-sm font-bold text-[var(--royal-blue)]">
                                                        {cat.completenessPercent}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${cat.completenessPercent}%`,
                                                            background: getProgressColor(cat.completenessPercent),
                                                        }}
                                                    />
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {cat.totalTasks} tasks • {cat.completedFields}/{cat.totalFields} fields
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Task Details Table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-[var(--royal-blue)] flex items-center gap-2">
                                    📋 รายละเอียด PA Tasks
                                </h2>
                                <Link
                                    href="/admin"
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    จัดการ PA <ExternalLink size={14} />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="text-left py-3 px-4">รหัส</th>
                                            <th className="text-left py-3 px-4">ชื่อ</th>
                                            <th className="text-center py-3 px-2">งาน</th>
                                            <th className="text-center py-3 px-2">ผลลัพธ์</th>
                                            <th className="text-center py-3 px-2">ตัวชี้วัด</th>
                                            <th className="text-center py-3 px-2">ผลจริง</th>
                                            <th className="text-center py-3 px-2">หลักฐาน</th>
                                            <th className="text-center py-3 px-4">%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.taskDetails.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-8 text-gray-500">
                                                    ยังไม่มี PA Tasks
                                                </td>
                                            </tr>
                                        ) : (
                                            stats.taskDetails.map((task) => (
                                                <tr
                                                    key={task.id}
                                                    className="border-b hover:bg-blue-50 cursor-pointer transition-colors"
                                                    onClick={() => router.push(`/admin?year=${selectedYear}&category=${task.category}`)}
                                                    title={`ดูรายละเอียด: ${task.title}`}
                                                >
                                                    <td className="py-3 px-4 font-mono text-xs">
                                                        {formatIndicatorCode(task.indicatorCode)}
                                                    </td>
                                                    <td className="py-3 px-4 max-w-[200px] truncate">
                                                        {getCategoryEmoji(task.category)} {task.title}
                                                    </td>
                                                    <td className="text-center py-3 px-2">
                                                        <StatusIcon ok={task.completeness.hasAgreement} />
                                                    </td>
                                                    <td className="text-center py-3 px-2">
                                                        <StatusIcon ok={task.completeness.hasOutcomes} />
                                                    </td>
                                                    <td className="text-center py-3 px-2">
                                                        <StatusIcon ok={task.completeness.hasIndicators} />
                                                    </td>
                                                    <td className="text-center py-3 px-2">
                                                        <StatusIcon ok={task.completeness.hasActualResults} />
                                                    </td>
                                                    <td className="text-center py-3 px-2">
                                                        <StatusIcon ok={task.completeness.hasEvidence} />
                                                    </td>
                                                    <td className="text-center py-3 px-4">
                                                        <span
                                                            className={`font-bold ${task.completeness.completenessScore >= 80
                                                                ? "text-green-600"
                                                                : task.completeness.completenessScore >= 50
                                                                    ? "text-yellow-600"
                                                                    : "text-red-600"
                                                                }`}
                                                        >
                                                            {task.completeness.completenessScore}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

// ============ Helper Components ============

interface SummaryCardProps {
    icon: React.ElementType;
    value: string | number;
    label: string;
    color: "blue" | "green" | "purple" | "orange";
}

function SummaryCard({ icon: Icon, value, label, color }: SummaryCardProps) {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        purple: "from-purple-500 to-purple-600",
        orange: "from-orange-500 to-orange-600",
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-3`}
            >
                <Icon size={24} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
        </div>
    );
}

function StatusIcon({ ok }: { ok: boolean }) {
    return ok ? (
        <span className="text-green-500 text-lg">✅</span>
    ) : (
        <span className="text-gray-300 text-lg">⬜</span>
    );
}

function getProgressColor(percent: number): string {
    if (percent >= 80) return "linear-gradient(90deg, #10b981, #059669)";
    if (percent >= 50) return "linear-gradient(90deg, #f59e0b, #d97706)";
    return "linear-gradient(90deg, #ef4444, #dc2626)";
}

// Convert old indicator codes (2.1.x, 2.2.x, 2.3.x) to new format (1.x, 2.x, 3.x)
function formatIndicatorCode(code: string): string {
    // Learning: 2.1.x -> 1.x
    if (code.startsWith("2.1.")) return "1." + code.substring(4);
    // Support: 2.2.x -> 2.x
    if (code.startsWith("2.2.")) return "2." + code.substring(4);
    // Development: 2.3.x -> 3.x
    if (code.startsWith("2.3.")) return "3." + code.substring(4);

    return code;
}
