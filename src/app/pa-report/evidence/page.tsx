"use client";

import { useState, useEffect } from "react";
import { getCurrentFiscalYear } from "@/lib/fiscalYear";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, Award, FileImage, FileText, Image, Video, ExternalLink } from "lucide-react";
import { firebaseService } from "@/lib/firebaseService";
import { FiscalYear, PATask, EvidenceFile } from "@/types";

export default function EvidencePage() {
    const currentYear = getCurrentFiscalYear().toString();
    const [years, setYears] = useState<string[]>([currentYear]);
    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
    const [loading, setLoading] = useState(true);
    const [allEvidence, setAllEvidence] = useState<{ record: PATask; file: EvidenceFile }[]>([]);

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
                const evidenceList: { record: PATask; file: EvidenceFile }[] = [];
                records.forEach((record) => {
                    if (record.evidenceFiles) {
                        record.evidenceFiles.forEach((file) => {
                            evidenceList.push({ record, file });
                        });
                    }
                });
                setAllEvidence(evidenceList);
            } catch {
                console.error("Failed to fetch PA records");
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, [selectedYear]);

    const getFileIcon = (type: string) => {
        switch (type) {
            case "image":
                return <Image size={20} />;
            case "video":
                return <Video size={20} />;
            default:
                return <FileText size={20} />;
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case "learning":
                return "การจัดการเรียนรู้";
            case "support":
                return "การส่งเสริมและสนับสนุน";
            case "self_dev":
                return "การพัฒนาตนเองและวิชาชีพ";
            case "challenge":
                return "ประเด็นท้าทาย";
            default:
                return category;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-amber-50">
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
                            style={{ backgroundColor: "rgba(212, 175, 55, 0.2)", color: "var(--gold-dark)" }}
                        >
                            <Award size={16} />
                            คลังหลักฐาน
                        </div>
                        <h1
                            className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-prompt)]"
                            style={{ color: "var(--royal-blue)" }}
                        >
                            คลังหลักฐานและเอกสารอ้างอิง
                        </h1>
                        <p className="text-gray-600 font-[family-name:var(--font-sarabun)]">
                            รวบรวมเกียรติบัตร รูปภาพกิจกรรม และผลงานนักเรียน
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
                    ) : allEvidence.length === 0 ? (
                        <div className="text-center py-20">
                            <div
                                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                                style={{ backgroundColor: "rgba(0, 35, 102, 0.1)" }}
                            >
                                <FileImage size={40} style={{ color: "var(--royal-blue)" }} />
                            </div>
                            <h3
                                className="text-xl font-semibold mb-2 font-[family-name:var(--font-prompt)]"
                                style={{ color: "var(--royal-blue)" }}
                            >
                                ยังไม่มีหลักฐาน
                            </h3>
                            <p className="text-gray-500 font-[family-name:var(--font-sarabun)]">
                                สามารถเพิ่มหลักฐานได้ผ่านหน้า Admin Dashboard
                            </p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allEvidence.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                                >
                                    {/* Preview Area */}
                                    <div
                                        className="h-40 flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(0, 35, 102, 0.05)" }}
                                    >
                                        {item.file.type === "image" && item.file.url ? (
                                            <img
                                                src={item.file.url}
                                                alt={item.file.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-gray-400">
                                                {getFileIcon(item.file.type)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: "var(--gold)", color: "var(--royal-blue-dark)" }}
                                            >
                                                {getFileIcon(item.file.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    className="text-sm font-semibold truncate font-[family-name:var(--font-prompt)]"
                                                    style={{ color: "var(--royal-blue)" }}
                                                    title={item.file.name}
                                                >
                                                    {item.file.name}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {getCategoryLabel(item.record.category)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span
                                                className="text-xs px-2 py-1 rounded"
                                                style={{ backgroundColor: "rgba(0, 35, 102, 0.1)", color: "var(--royal-blue)" }}
                                            >
                                                {item.record.indicatorCode}
                                            </span>
                                            {item.file.url && (
                                                <a
                                                    href={item.file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs font-medium hover:underline"
                                                    style={{ color: "var(--gold-dark)" }}
                                                >
                                                    ดูไฟล์ <ExternalLink size={12} />
                                                </a>
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
