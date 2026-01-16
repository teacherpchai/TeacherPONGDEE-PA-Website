"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentFiscalYear } from "@/lib/fiscalYear";
import { firebaseService } from "@/lib/firebaseService";
import { FiscalYear, PA_CATEGORIES } from "@/types";
import {
    BookOpen,
    HeartHandshake,
    TrendingUp,
    Target,
    ArrowRight,
    CheckCircle2,
    FileText,
    Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCategoryEmoji } from "@/lib/dashboardUtils";

// Category icon mapping
const categoryIcons = {
    learning: BookOpen,
    support: HeartHandshake,
    self_dev: TrendingUp,
    challenge: Target,
};

// Category Description Mapping
const categoryDescriptions = {
    learning: "การจัดการเรียนรู้ การสร้างและพัฒนาหลักสูตร การออกแบบการเรียนรู้",
    support: "การส่งเสริมและสนับสนุนการจัดการเรียนรู้ การบริหารจัดการชั้นเรียน",
    self_dev: "การพัฒนาตนเองและวิชาชีพ การแลกเปลี่ยนเรียนรู้ทางวิชาชีพ",
    challenge: "ประเด็นท้าทายในการพัฒนาผลลัพธ์การเรียนรู้ของผู้เรียน",
};

export default function PAEvaluationLandingPage() {
    const currentYear = getCurrentFiscalYear().toString();
    const [years, setYears] = useState<string[]>([currentYear]);
    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const yearsData: FiscalYear[] = await firebaseService.getYears();
                if (yearsData.length > 0) {
                    const yearStrings = yearsData.map((y) => y.year);
                    setYears(yearStrings);
                    const activeYear = yearsData.find((y) => y.isActive);
                    if (activeYear) setSelectedYear(activeYear.year);
                }
            } catch (error) {
                console.error("Failed to fetch years", error);
            } finally {
                setLoading(false);
            }
        };
        fetchYears();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar
                years={years}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            <main className="flex-1 pt-24 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
                            style={{ backgroundColor: "var(--gold)", color: "var(--royal-blue-dark)" }}
                        >
                            <FileText size={16} />
                            ปีงบประมาณ {selectedYear}
                        </div>
                        <h1
                            className="text-4xl md:text-5xl font-bold mb-6 font-[family-name:var(--font-prompt)]"
                            style={{ color: "var(--royal-blue)" }}
                        >
                            การประเมินตำแหน่งและวิทยฐานะ (PA)
                        </h1>
                        <p className="text-xl text-gray-600 font-[family-name:var(--font-sarabun)] max-w-2xl mx-auto">
                            เลือกหัวข้อเพื่อดูรายละเอียดข้อตกลงในการพัฒนางาน (PA1) และผลการปฏิบัติงาน (PA2)
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-blue-600" size={48} />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8">
                            {PA_CATEGORIES.map((category) => {
                                const Icon = categoryIcons[category.id as keyof typeof categoryIcons] || FileText;

                                return (
                                    <Link
                                        key={category.id}
                                        href={`/pa-evaluation/${category.id}?year=${selectedYear}`}
                                        className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 block relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                            <Icon size={120} />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                                <Icon size={28} className="text-[var(--royal-blue)]" />
                                            </div>

                                            <h2 className="text-2xl font-bold mb-3 font-[family-name:var(--font-prompt)] group-hover:text-[var(--royal-blue)] transition-colors text-gray-800">
                                                {getCategoryEmoji(category.id)} {category.labelTh}
                                            </h2>

                                            <p className="text-gray-500 mb-8 font-[family-name:var(--font-sarabun)] leading-relaxed h-12">
                                                {categoryDescriptions[category.id as keyof typeof categoryDescriptions]}
                                            </p>

                                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--gold)] group-hover:gap-3 transition-all duration-300">
                                                ดูรายละเอียด
                                                <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
