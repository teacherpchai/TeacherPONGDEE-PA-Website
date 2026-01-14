"use client";

import { useState, useEffect } from "react";
import { getCurrentFiscalYear } from "@/lib/fiscalYear";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PAAccordion from "@/components/PAAccordion";
import PrintButton from "@/components/PrintButton";
import { Loader2 } from "lucide-react";
import { firebaseService } from "@/lib/firebaseService";
import { FiscalYear, PATask } from "@/types";

const developmentIndicators = [
    { code: "2.3.1", title: "พัฒนาตนเองอย่างเป็นระบบและต่อเนื่อง" },
    { code: "2.3.2", title: "มีส่วนร่วม และเป็นผู้นำในการแลกเปลี่ยนเรียนรู้ทางวิชาชีพ (PLC)" },
    { code: "2.3.3", title: "นำความรู้ ความสามารถ ทักษะที่ได้จากการพัฒนาตนเองและวิชาชีพมาใช้" },
];

export default function DevelopmentPage() {
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
                setPaRecords(records.filter((r) => r.category === "self_dev"));
            } catch {
                console.error("Failed to fetch PA records");
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, [selectedYear]);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
            <Navbar
                years={years}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            <main className="flex-1 pt-24 pb-16 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1
                            className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-prompt)]"
                            style={{ color: "var(--royal-blue)" }}
                        >
                            ด้านการพัฒนาตนเองและวิชาชีพ
                        </h1>
                        <p className="text-gray-600 font-[family-name:var(--font-sarabun)]">
                            ผลการปฏิบัติงานตามมาตรฐานตำแหน่งครู - 3 ตัวชี้วัด
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-4">
                            <div
                                className="px-4 py-1.5 rounded-full text-sm font-medium"
                                style={{ backgroundColor: "var(--gold)", color: "var(--royal-blue-dark)" }}
                            >
                                ปีงบประมาณ {selectedYear}
                            </div>
                            <PrintButton title={`ข้อตกลง PA ด้านการพัฒนาตนเอง - ปี ${selectedYear}`} />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin" size={40} style={{ color: "var(--gold)" }} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {developmentIndicators.map((indicator) => {
                                const record = paRecords.find((r) => r.indicatorCode === indicator.code);
                                return (
                                    <PAAccordion
                                        key={indicator.code}
                                        indicatorCode={indicator.code}
                                        title={indicator.title}
                                        agreement={record?.agreement || "ยังไม่ได้บันทึกข้อตกลง"}
                                        outcomes={record?.outcomes}
                                        indicators={record?.indicators}
                                    />
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
