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

const supportIndicators = [
    { code: "2.1", title: "จัดทำข้อมูลสารสนเทศของผู้เรียนและรายวิชา" },
    { code: "2.2", title: "ดำเนินการตามระบบดูแลช่วยเหลือผู้เรียน" },
    { code: "2.3", title: "ปฏิบัติงานวิชาการ และงานอื่น ๆ ของสถานศึกษา" },
    { code: "2.4", title: "ประสานความร่วมมือกับผู้ปกครอง ภาคีเครือข่าย และหรือสถานประกอบการ" },
];

export default function SupportPage() {
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
                            ด้านการส่งเสริมและสนับสนุนการจัดการเรียนรู้
                        </h1>
                        <p className="text-gray-600 font-[family-name:var(--font-sarabun)]">
                            ผลการปฏิบัติงานตามมาตรฐานตำแหน่งครู - 4 ตัวชี้วัด
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-4">
                            <div
                                className="px-4 py-1.5 rounded-full text-sm font-medium"
                                style={{ backgroundColor: "var(--gold)", color: "var(--royal-blue-dark)" }}
                            >
                                ปีงบประมาณ {selectedYear}
                            </div>
                            <PrintButton title={`ข้อตกลง PA ด้านการส่งเสริมและสนับสนุน - ปี ${selectedYear}`} />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin" size={40} style={{ color: "var(--gold)" }} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {supportIndicators.map((indicator) => {
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
