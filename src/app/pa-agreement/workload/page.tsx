"use client";

import { useState, useEffect, useMemo } from "react";
import { getCurrentFiscalYear } from "@/lib/fiscalYear";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, LayoutGrid, BookOpen, Layers } from "lucide-react";
import { firebaseService } from "@/lib/firebaseService";
import { FiscalYear, Profile, StructuredSemesterWorkload, OtherWorkItem, TeachingSubject } from "@/types";
import WorkloadDisplaySection from "@/components/WorkloadDisplaySection";
import WorkloadDashboard from "@/components/WorkloadDashboard";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "yearly" | "term1" | "term2";

// Helper to calculate average hours for a list of items
const getAverageHours = (items1: OtherWorkItem[], items2: OtherWorkItem[], divideBy: number) => {
    // Merging logic can be complex if we want to merge identical descriptions. 
    // For simple average stats, we just sum hours and divide.
    const sum1 = items1.reduce((acc, i) => acc + (i.hoursPerWeek || 0), 0);
    const sum2 = items2.reduce((acc, i) => acc + (i.hoursPerWeek || 0), 0);
    return (sum1 + sum2) / divideBy;
};

export default function WorkloadPage() {
    const currentYear = getCurrentFiscalYear().toString();
    const [years, setYears] = useState<string[]>([currentYear]);
    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("yearly");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch years
                const yearsData: FiscalYear[] = await firebaseService.getYears();
                if (yearsData.length > 0) {
                    const yearStrings = yearsData.map((y) => y.year);
                    setYears(yearStrings);
                    const activeYear = yearsData.find((y) => y.isActive);
                    if (activeYear) {
                        setSelectedYear(activeYear.year);
                    }
                }

                // Fetch Profile for workload data
                const profileData = await firebaseService.getProfile();
                setProfile(profileData);

            } catch {
                console.error("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Workloads
    const s1 = profile?.structuredWorkloadSemester1;
    const s2 = profile?.structuredWorkloadSemester2;
    const hasData = !!s1 || !!s2;

    // Calculate Yearly Average Workload for the Dashboard
    const averageWorkload: StructuredSemesterWorkload | null = useMemo(() => {
        if (!s1 && !s2) return null;
        if (!s1) return s2!;
        if (!s2) return s1!;

        // Both s1 and s2 exist, calculate average
        // 1. Merge Teaching Subjects (Simply concating for list list view might be too much, 
        // but for stats we want the average hours. For the specific "Top 5 Subjects" chart, 
        // we might want to show subjects from BOTH terms, perhaps normalizing their periods if needed.
        // Let's concat them for now to let the chart pick top ones.
        const mergedSubjects: TeachingSubject[] = [...s1.teachingSubjects, ...s2.teachingSubjects].map(s => ({
            ...s,
            // If we want "Average" load, meaningful per-subject hours shouldn't necessarily be halved 
            // unless the subject is only taught in one term but we want 'yearly average'.
            // Convention: Yearly Load usually means "Average Weekly Load over the year".
            // If I teach Math 4 hours in Term 1 and 0 in Term 2, my yearly average is 2.
            // But visually in the bar chart, users expect to see "Math". 
            // Let's keep periods as is for the "Subject List" but mathematically adjust for Dashboard stats if needed.
            // Actually, for simplicity and utility:
            // The Dashboard sums up hours. If we pass ALL subjects, it sums everything (Double counting).
            // We need to halve the periods for the "Average" object to allow the dashboard to calculate "Average Total".
            periodsPerWeek: s.periodsPerWeek / 2
        }));

        const mergedSupport: OtherWorkItem[] = [
            { description: "เฉลี่ยงานสนับสนุน", hoursPerWeek: getAverageHours(s1.supportWork, s2.supportWork, 2) }
        ];
        const mergedDev: OtherWorkItem[] = [
            { description: "เฉลี่ยงานพัฒนา", hoursPerWeek: getAverageHours(s1.developmentWork, s2.developmentWork, 2) }
        ];
        const mergedPolicy: OtherWorkItem[] = [
            { description: "เฉลี่ยงานนโยบาย", hoursPerWeek: getAverageHours(s1.policyWork, s2.policyWork, 2) }
        ];

        return {
            semesterLabel: `ภาพรวมปีงบประมาณ ${selectedYear} (เฉลี่ย)`,
            teachingSubjects: mergedSubjects,
            supportWork: mergedSupport,
            developmentWork: mergedDev,
            policyWork: mergedPolicy
        };

    }, [s1, s2, selectedYear]);


    // Determine what to pass to Dashboard
    const dashboardData = viewMode === "yearly" && s1 && s2 ? averageWorkload : (viewMode === "term1" ? s1 : (viewMode === "term2" ? s2 : averageWorkload || s1 || s2));

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
            <Navbar
                years={years}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            <main className="flex-1 pt-24 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1
                                className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-prompt)] bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700"
                            >
                                ภาระงาน
                            </h1>
                            <p className="text-gray-600 font-[family-name:var(--font-sarabun)] text-lg">
                                ส่วนที่ 1: ข้อตกลงในการพัฒนางานตามมาตรฐานตำแหน่ง
                            </p>
                        </motion.div>
                        <div
                            className="inline-block px-5 py-2 rounded-full text-sm font-bold mt-6 shadow-sm"
                            style={{ backgroundColor: "var(--gold)", color: "var(--royal-blue-dark)" }}
                        >
                            ปีงบประมาณ {selectedYear}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-blue-600" size={48} />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {!hasData ? (
                                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Loader2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีข้อมูลภาระงาน</h3>
                                    <p className="text-gray-500 mb-6">กรุณาเพิ่มข้อมูลในส่วนการตั้งค่า</p>
                                    <Link
                                        href="/admin/settings"
                                        className="inline-flex items-center px-6 py-3 bg-[var(--royal-blue)] text-white rounded-xl hover:bg-blue-800 transition-all hover:shadow-lg font-medium"
                                    >
                                        ไปที่ตั้งค่า
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {/* View Mode Selector */}
                                    <div className="flex justify-center mb-6">
                                        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                                            <TabButton
                                                active={viewMode === 'yearly'}
                                                onClick={() => setViewMode('yearly')}
                                                icon={<LayoutGrid size={16} />}
                                                label="ภาพรวมทั้งปี"
                                            />
                                            <TabButton
                                                active={viewMode === 'term1'}
                                                onClick={() => setViewMode('term1')}
                                                icon={<BookOpen size={16} />}
                                                label="ภาคเรียนที่ 1"
                                                disabled={!s1}
                                            />
                                            <TabButton
                                                active={viewMode === 'term2'}
                                                onClick={() => setViewMode('term2')}
                                                icon={<Layers size={16} />}
                                                label="ภาคเรียนที่ 2"
                                                disabled={!s2}
                                            />
                                        </div>
                                    </div>

                                    {/* Dashboard */}
                                    <AnimatePresence mode="wait">
                                        {dashboardData && (
                                            <WorkloadDashboard
                                                key={`dashboard-${viewMode}`}
                                                workload={dashboardData}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Detailed Sections */}
                                    <motion.div
                                        key={`details-${viewMode}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {(viewMode === 'yearly' || viewMode === 'term1') && s1 && (
                                            <WorkloadDisplaySection semesterNumber={1} workload={s1} />
                                        )}

                                        {(viewMode === 'yearly' || viewMode === 'term2') && s2 && (
                                            <WorkloadDisplaySection semesterNumber={2} workload={s2} />
                                        )}
                                    </motion.div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

function TabButton({ active, onClick, icon, label, disabled = false }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${active
                    ? "bg-blue-600 text-white shadow-md"
                    : disabled
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}
            `}
        >
            {icon}
            {label}
        </button>
    );
}
