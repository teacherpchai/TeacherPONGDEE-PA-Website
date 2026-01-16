"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCurrentFiscalYear } from "@/lib/fiscalYear";
import { firebaseService } from "@/lib/firebaseService";
import { DashboardStats, calculateDashboardStats, getCategoryEmoji } from "@/lib/dashboardUtils";
import { PATask, PACategory, PA_CATEGORIES } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AgreementResultCard from "@/components/AgreementResultCard";
import { Loader2, ArrowLeft } from "lucide-react";

function PAEvaluationDetailContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const categoryId = params.category as PACategory;

    // Validate Category
    const categoryInfo = PA_CATEGORIES.find(c => c.id === categoryId);

    const currentYear = getCurrentFiscalYear().toString();
    const [years, setYears] = useState<string[]>([currentYear]);
    const [selectedYear, setSelectedYear] = useState<string>(searchParams.get("year") || currentYear);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const yearsData = await firebaseService.getYears();
                if (yearsData.length > 0) {
                    const yearStrings = yearsData.map((y) => y.year);
                    setYears(yearStrings);
                    const activeYear = yearsData.find((y) => y.isActive);

                    // Priority: URL Param > Active Year > Current Year
                    if (!searchParams.get("year") && activeYear) {
                        setSelectedYear(activeYear.year);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch years", error);
            }
        };
        fetchYears();
    }, [searchParams]);

    useEffect(() => {
        async function loadData() {
            if (!selectedYear) return;
            setIsLoading(true);
            try {
                const records = await firebaseService.getPARecords(selectedYear);
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

    if (!categoryInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">ไม่พบหมวดหมู่</h1>
                    <Link href="/pa-evaluation" className="text-blue-500 hover:underline mt-4 block">
                        กลับสู่หน้าหลัก
                    </Link>
                </div>
            </div>
        );
    }

    const categoryTasks = stats?.taskDetails.filter((t) => t.category === categoryId) || [];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar
                years={years}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            <main className="flex-1 pt-24 pb-16 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Header with Breadcrumb */}
                    <div className="mb-8">
                        <Link
                            href="/pa-evaluation"
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--royal-blue)] transition-colors mb-4"
                        >
                            <ArrowLeft size={16} />
                            ย้อนกลับ
                        </Link>

                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{getCategoryEmoji(categoryInfo.id)}</span>
                            <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-prompt)] text-[var(--royal-blue)]">
                                {categoryInfo.labelTh}
                            </h1>
                        </div>
                        <p className="text-gray-500 mt-2 font-[family-name:var(--font-sarabun)] ml-12">
                            รายละเอียดข้อตกลงและผลการปฏิบัติงาน ประจำปีงบประมาณ {selectedYear}
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-blue-600" size={48} />
                        </div>
                    ) : categoryTasks.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                            <p className="text-gray-500 text-lg">ยังไม่มีข้อมูลในหมวดหมู่นี้สำหรับปี {selectedYear}</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {categoryTasks.map((task) => (
                                <AgreementResultCard
                                    key={task.id}
                                    task={task}
                                    year={selectedYear}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function PAEvaluationDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin" size={40} /></div>}>
            <PAEvaluationDetailContent />
        </Suspense>
    );
}
