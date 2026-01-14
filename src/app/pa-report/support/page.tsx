"use client";

import { useState, useEffect } from "react";
import { getCurrentFiscalYear } from "@/lib/fiscalYear";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, CheckCircle2, FileImage, Award } from "lucide-react";
import { firebaseService } from "@/lib/firebaseService";
import { FiscalYear, PATask } from "@/types";
import { VisualizationRenderer } from "@/components/visualizations";
import { RichMediaRenderer } from "@/components/media";

const supportIndicators = [
    { code: "2.2.1", title: "จัดทำข้อมูลสารสนเทศของผู้เรียนและรายวิชา" },
    { code: "2.2.2", title: "ดำเนินการตามระบบดูแลช่วยเหลือผู้เรียน" },
    { code: "2.2.3", title: "ปฏิบัติงานวิชาการ และงานอื่น ๆ ของสถานศึกษา" },
    { code: "2.2.4", title: "ประสานความร่วมมือกับผู้ปกครอง ภาคีเครือข่าย และหรือสถานประกอบการ" },
];

export default function ReportSupportPage() {
    const currentYear = getCurrentFiscalYear().toString();
    const [years, setYears] = useState<string[]>([currentYear]);
    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
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
                    if (activeYear) {
                        setSelectedYear(activeYear.year);
                    }
                }
            } catch {
                console.error("Failed to fetch years");
            }
        };
        fetchYears();
    }, []);

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            try {
                const records = await firebaseService.getPARecords(selectedYear);
                setPaRecords(records.filter((r) => r.category === "support"));
            } catch {
                console.error("Failed to fetch PA records");
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, [selectedYear]);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-emerald-50">
            <Navbar
                years={years}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            <main className="flex-1 pt-24 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
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
                            สรุปผลด้านการส่งเสริมและสนับสนุน
                        </h1>
                        <p className="text-gray-600 font-[family-name:var(--font-sarabun)]">
                            ผลการดำเนินงานและหลักฐานร่องรอย - 4 ตัวชี้วัด
                        </p>
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
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {supportIndicators.map((indicator) => {
                                const record = paRecords.find((r) => r.indicatorCode === indicator.code);
                                const hasEvidence = record?.evidenceFiles && record.evidenceFiles.length > 0;

                                return (
                                    <div
                                        key={indicator.code}
                                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4"
                                        style={{ borderLeftColor: hasEvidence ? "#10b981" : "#d1d5db" }}
                                    >
                                        <div className="flex items-start gap-3 mb-4">
                                            <div
                                                className="p-2 rounded-lg"
                                                style={{
                                                    backgroundColor: hasEvidence ? "rgba(16, 185, 129, 0.1)" : "rgba(156, 163, 175, 0.1)",
                                                    color: hasEvidence ? "#10b981" : "#9ca3af"
                                                }}
                                            >
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <span
                                                    className="text-xs font-semibold px-2 py-1 rounded"
                                                    style={{ backgroundColor: "var(--royal-blue)", color: "white" }}
                                                >
                                                    {indicator.code}
                                                </span>
                                                <h3
                                                    className="text-base font-semibold mt-2 font-[family-name:var(--font-prompt)]"
                                                    style={{ color: "var(--royal-blue)" }}
                                                >
                                                    {indicator.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-600 font-[family-name:var(--font-sarabun)] mb-4">
                                            {record?.actualResults || record?.outcomes || "ยังไม่มีข้อมูลผลการดำเนินงาน"}
                                        </div>

                                        {/* Visualization */}
                                        {record?.visualization && (
                                            <div className="mb-4">
                                                <VisualizationRenderer data={record.visualization} />
                                            </div>
                                        )}

                                        {/* Rich Media */}
                                        {record?.richMedia && record.richMedia.length > 0 && (
                                            <div className="mb-4">
                                                <RichMediaRenderer items={record.richMedia} />
                                            </div>
                                        )}

                                        {hasEvidence ? (
                                            <div className="flex items-center gap-2 text-sm" style={{ color: "#10b981" }}>
                                                <FileImage size={16} />
                                                <span>{record?.evidenceFiles?.length} หลักฐาน</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <FileImage size={16} />
                                                <span>ยังไม่มีหลักฐาน</span>
                                            </div>
                                        )}
                                    </div>
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
