"use client";

import { useState, useEffect } from "react";
import { getCurrentFiscalYear } from "@/lib/fiscalYear";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, BookOpen, School, Briefcase, Loader2 } from "lucide-react";
import { firebaseService } from "@/lib/firebaseService";
import { FiscalYear } from "@/types";

interface WorkloadItem {
    title: string;
    description: string;
    hours?: string;
    icon: React.ReactNode;
}

const workloadData: WorkloadItem[] = [
    {
        title: "1.1 ชั่วโมงตามตารางสอน",
        description: "สอนวิชาเคมี ระดับมัธยมศึกษาตอนปลาย ตามตารางสอนที่ได้รับมอบหมาย",
        hours: "18 คาบ/สัปดาห์",
        icon: <Clock size={24} />,
    },
    {
        title: "1.2 งานตอบสนองนโยบายและจุดเน้น",
        description: "ดำเนินงานตามนโยบายของกระทรวงศึกษาธิการและสำนักงานเขตพื้นที่การศึกษา",
        icon: <BookOpen size={24} />,
    },
    {
        title: "1.3 งานพัฒนาคุณภาพการจัดการศึกษาของสถานศึกษา",
        description: "มีส่วนร่วมในการพัฒนาคุณภาพการศึกษาของโรงเรียน งานประกันคุณภาพ และกิจกรรมพัฒนาผู้เรียน",
        icon: <School size={24} />,
    },
    {
        title: "1.4 งานหน้าที่พิเศษอื่น ๆ",
        description: "ปฏิบัติหน้าที่พิเศษที่ได้รับมอบหมาย เช่น หัวหน้ากลุ่มสาระ ที่ปรึกษาชมรม งานกิจกรรมพิเศษ",
        icon: <Briefcase size={24} />,
    },
];

export default function WorkloadPage() {
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
                    if (activeYear) {
                        setSelectedYear(activeYear.year);
                    }
                }
            } catch {
                console.error("Failed to fetch years");
            } finally {
                setLoading(false);
            }
        };
        fetchYears();
    }, []);

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
                            ภาระงาน
                        </h1>
                        <p className="text-gray-600 font-[family-name:var(--font-sarabun)]">
                            ส่วนที่ 1: ข้อตกลงในการพัฒนางานตามมาตรฐานตำแหน่ง - ภาระงาน
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
                        <div className="grid gap-6">
                            {workloadData.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4"
                                    style={{ borderLeftColor: "var(--gold)" }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="p-3 rounded-xl"
                                            style={{ backgroundColor: "var(--royal-blue)", color: "white" }}
                                        >
                                            {item.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3
                                                className="text-lg font-semibold mb-2 font-[family-name:var(--font-prompt)]"
                                                style={{ color: "var(--royal-blue)" }}
                                            >
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-600 font-[family-name:var(--font-sarabun)]">
                                                {item.description}
                                            </p>
                                            {item.hours && (
                                                <div
                                                    className="inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium"
                                                    style={{ backgroundColor: "rgba(0, 35, 102, 0.1)", color: "var(--royal-blue)" }}
                                                >
                                                    {item.hours}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
