"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { getCurrentFiscalYear } from "@/lib/fiscalYear";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, Target, TrendingUp, Award, BarChart2, CheckCircle, BookOpen, Users, FlaskConical, LineChart } from "lucide-react";
import { firebaseService } from "@/lib/firebaseService";
import { FiscalYear, PATask, ChallengeData } from "@/types";
import MathText from "@/components/MathText";
import HtmlContent from "@/components/HtmlContent";

function ReportChallengeContent() {
    const searchParams = useSearchParams();
    const currentYear = getCurrentFiscalYear().toString();
    const [years, setYears] = useState<string[]>([currentYear]);
    const [selectedYear, setSelectedYear] = useState<string>(searchParams.get("year") || currentYear);
    const [loading, setLoading] = useState(true);
    const [paRecords, setPaRecords] = useState<PATask[]>([]);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const yearsData: FiscalYear[] = await firebaseService.getYears();
                if (yearsData.length > 0) {
                    const yearStrings = yearsData.map((y) => y.year);
                    setYears(yearStrings);
                    const activeYear = yearsData.find((y) => y.isActive);

                    // Only set default if no year in URL
                    if (!searchParams.get("year") && activeYear) {
                        setSelectedYear(activeYear.year);
                    }
                }
            } catch {
                console.error("Failed to fetch years");
            }
        };
        fetchYears();
    }, [searchParams]);

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            try {
                const records = await firebaseService.getPARecords(selectedYear);
                setPaRecords(records.filter((r) => r.category === "challenge"));
            } catch {
                console.error("Failed to fetch PA records");
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, [selectedYear]);

    const challengeRecord = paRecords[0];
    const challengeData: ChallengeData | undefined = challengeRecord?.challengeData;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-emerald-50">
            <Navbar
                years={years}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            <main className="flex-1 pt-24 pb-16 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
                            style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
                        >
                            <Award size={16} />
                            รายงานผลการปฏิบัติงาน
                        </div>
                        <h1
                            className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-prompt)]"
                            style={{ color: "var(--royal-blue)" }}
                        >
                            สรุปผลประเด็นท้าทาย
                        </h1>
                        {challengeData && (
                            <>
                                <p className="text-lg text-gray-700 font-[family-name:var(--font-prompt)] mb-2">
                                    {challengeData.titleTH}
                                </p>
                                {challengeData.titleEN && (
                                    <p className="text-sm text-gray-500 italic">
                                        {challengeData.titleEN}
                                    </p>
                                )}
                            </>
                        )}
                        <div
                            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mt-4"
                            style={{ backgroundColor: "var(--gold)", color: "var(--royal-blue-dark)" }}
                        >
                            ปีงบประมาณ {selectedYear}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin" size={40} style={{ color: "var(--gold)" }} />
                        </div>
                    ) : !challengeData ? (
                        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                            <p className="text-gray-500">ยังไม่มีข้อมูลประเด็นท้าทายสำหรับปี {selectedYear}</p>
                            <p className="text-sm text-gray-400 mt-2">กรุณาเพิ่มข้อมูลในหน้า Admin</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Problem Context Section */}
                            {(challengeData.problem.context || challengeData.problem.approach) && (
                                <div className="bg-white rounded-2xl p-8 shadow-lg">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-xl bg-red-100 text-red-600">
                                            <BookOpen size={24} />
                                        </div>
                                        <h2
                                            className="text-xl font-bold font-[family-name:var(--font-prompt)]"
                                            style={{ color: "var(--royal-blue)" }}
                                        >
                                            สภาพปัญหาและแนวทาง
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        {challengeData.problem.context && (
                                            <div className="p-4 rounded-xl bg-gray-50">
                                                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                                                    บริบทและความสำคัญ
                                                </h3>
                                                <div className="text-gray-700 font-[family-name:var(--font-sarabun)]">
                                                    <MathText block>{challengeData.problem.context}</MathText>
                                                </div>
                                            </div>
                                        )}
                                        {challengeData.problem.approach && (
                                            <div className="p-4 rounded-xl bg-blue-50">
                                                <h3 className="text-sm font-semibold text-blue-600 mb-2">
                                                    แนวทางการจัดการเรียนรู้
                                                </h3>
                                                <div className="text-gray-700 font-[family-name:var(--font-sarabun)]">
                                                    <MathText block>{challengeData.problem.approach}</MathText>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Methodology Section */}
                            {(challengeData.methodology.population || challengeData.methodology.instruments || challengeData.methodology.dataAnalysis) && (
                                <div className="bg-white rounded-2xl p-8 shadow-lg">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                                            <FlaskConical size={24} />
                                        </div>
                                        <h2
                                            className="text-xl font-bold font-[family-name:var(--font-prompt)]"
                                            style={{ color: "var(--royal-blue)" }}
                                        >
                                            วิธีดำเนินการ
                                        </h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {challengeData.methodology.population && (
                                            <div className="p-4 rounded-xl bg-gray-50">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                    <Users size={16} />
                                                    กลุ่มเป้าหมาย
                                                </div>
                                                <div className="text-gray-700 font-[family-name:var(--font-sarabun)]">
                                                    <MathText>{challengeData.methodology.population}</MathText>
                                                </div>
                                            </div>
                                        )}
                                        {challengeData.methodology.instruments && (
                                            <div className="p-4 rounded-xl bg-gray-50">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                    <FlaskConical size={16} />
                                                    เครื่องมือวิจัย
                                                </div>
                                                <div className="text-gray-700 font-[family-name:var(--font-sarabun)]">
                                                    <MathText>{challengeData.methodology.instruments}</MathText>
                                                </div>
                                            </div>
                                        )}
                                        {challengeData.methodology.dataAnalysis && (
                                            <div className="p-4 rounded-xl bg-amber-50 md:col-span-2">
                                                <div className="flex items-center gap-2 text-sm text-amber-600 mb-2">
                                                    <LineChart size={16} />
                                                    การวิเคราะห์ข้อมูล
                                                </div>
                                                <div className="text-gray-700 font-[family-name:var(--font-sarabun)]">
                                                    <MathText block>{challengeData.methodology.dataAnalysis}</MathText>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Quantitative Results */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                                        <BarChart2 size={24} />
                                    </div>
                                    <h2
                                        className="text-xl font-bold font-[family-name:var(--font-prompt)]"
                                        style={{ color: "var(--royal-blue)" }}
                                    >
                                        ผลลัพธ์เชิงปริมาณ
                                    </h2>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-4 rounded-xl bg-gray-50">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                            <Target size={16} />
                                            เป้าหมายที่คาดหวัง
                                        </div>
                                        <div className="text-gray-700 font-[family-name:var(--font-sarabun)]">
                                            <MathText block>
                                                {challengeData.outcomes.quantitative || "ยังไม่ได้ระบุ"}
                                            </MathText>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50">
                                        <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2">
                                            <CheckCircle size={16} />
                                            ผลลัพธ์ที่เกิดขึ้นจริง
                                        </div>
                                        <div className="text-gray-700 font-[family-name:var(--font-sarabun)]">
                                            <HtmlContent content={challengeRecord?.actualResults || challengeRecord?.outcomes || "ยังไม่มีข้อมูลผลลัพธ์"} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Qualitative Results */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                                        <TrendingUp size={24} />
                                    </div>
                                    <h2
                                        className="text-xl font-bold font-[family-name:var(--font-prompt)]"
                                        style={{ color: "var(--royal-blue)" }}
                                    >
                                        ผลลัพธ์เชิงคุณภาพ
                                    </h2>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-4 rounded-xl bg-gray-50">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                            <Target size={16} />
                                            เป้าหมายที่คาดหวัง
                                        </div>
                                        <div className="text-gray-700 font-[family-name:var(--font-sarabun)]">
                                            <MathText block>
                                                {challengeData.outcomes.qualitative || "ยังไม่ได้ระบุ"}
                                            </MathText>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50">
                                        <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2">
                                            <CheckCircle size={16} />
                                            ผลลัพธ์ที่เกิดขึ้นจริง
                                        </div>
                                        <div className="text-gray-700 font-[family-name:var(--font-sarabun)]">
                                            <HtmlContent content={challengeRecord?.agreement || "ยังไม่มีข้อมูลผลลัพธ์"} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function ReportChallengePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin" size={40} /></div>}>
            <ReportChallengeContent />
        </Suspense>
    );
}
