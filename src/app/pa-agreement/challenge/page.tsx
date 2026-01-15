"use client";

import { useState, useEffect } from "react";
import { getCurrentFiscalYear } from "@/lib/fiscalYear";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, TrendingUp, Info, AlertCircle, Lightbulb, Target, Beaker, Users, Wrench, ListCheck, BarChart3, CheckCircle } from "lucide-react";
import { firebaseService } from "@/lib/firebaseService";
import { FiscalYear, PATask, ChallengeData } from "@/types";

import HtmlContent from "@/components/HtmlContent";
import MathText from "@/components/MathText";

export default function ChallengePage() {
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
                setPaRecords(records.filter((r) => r.category === "challenge"));
            } catch {
                console.error("Failed to fetch PA records");
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, [selectedYear]);

    const challenge1 = paRecords.find(r => r.indicatorCode === "challenge-1");
    const challenge2 = paRecords.find(r => r.indicatorCode === "challenge-2");

    // Render a challenge section with new structured format
    const renderChallengeSection = (record: PATask | undefined, challengeNumber: number) => {
        // Check if has new structured data
        const data: ChallengeData | undefined = record?.challengeData;
        const hasNewData = data && (data.titleTH || data.problem?.context);

        // Fallback to old format if no new data
        const hasOldData = record && (record.agreement || record.outcomes || record.indicators);

        if (!hasNewData && !hasOldData) {
            return (
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                    <Info size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-[family-name:var(--font-sarabun)]">
                        ยังไม่ได้บันทึกข้อมูลประเด็นท้าทาย เรื่องที่ {challengeNumber}
                    </p>
                </div>
            );
        }

        // Use new structure if available
        if (hasNewData && data) {
            return (
                <div className="space-y-6">
                    {/* Title */}
                    {(data.titleTH || data.titleEN) && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4" style={{ borderLeftColor: "var(--royal-blue)" }}>
                            <h3 className="text-xl font-bold mb-2 font-[family-name:var(--font-prompt)]" style={{ color: "var(--royal-blue)" }}>
                                {data.titleTH}
                            </h3>
                            {data.titleEN && (
                                <p className="text-gray-500 italic">{data.titleEN}</p>
                            )}
                        </div>
                    )}

                    {/* Section 2: Problem */}
                    <ChallengeCard
                        icon={<AlertCircle size={24} />}
                        title="สภาพปัญหาการจัดการเรียนรู้"
                        color="#dc2626"
                    >
                        <SubSection label="บริบทและความสำคัญของปัญหา" content={data.problem?.context} />
                        <SubSection label="แนวทางการแก้ไขปัญหาทั่วไปและข้อจำกัด" content={data.problem?.limitations} />
                        <SubSection label="แนวทางการจัดการเรียนรู้ตามประเด็นท้าทาย" content={data.problem?.approach} />
                        <SubSection label="วัตถุประสงค์และสิ่งที่คาดหวัง" content={data.problem?.objectives} />
                    </ChallengeCard>

                    {/* Section 3: Methodology */}
                    <ChallengeCard
                        icon={<Lightbulb size={24} />}
                        title="วิธีการดำเนินการให้บรรลุผล"
                        color="#f59e0b"
                    >
                        <div className="grid md:grid-cols-2 gap-4">
                            <SubSection label="รูปแบบการวิจัย" content={data.methodology?.researchDesign} icon={<Beaker size={16} />} />
                            <SubSection label="ประชากรและกลุ่มเป้าหมาย" content={data.methodology?.population} icon={<Users size={16} />} />
                        </div>
                        <SubSection label="เครื่องมือที่ใช้ในการวิจัย" content={data.methodology?.instruments} icon={<Wrench size={16} />} />
                        <SubSection label="ขั้นตอนการดำเนินการ" content={data.methodology?.procedures} icon={<ListCheck size={16} />} />
                        <SubSection label="การวิเคราะห์ข้อมูล" content={data.methodology?.dataAnalysis} icon={<BarChart3 size={16} />} />
                    </ChallengeCard>

                    {/* Section 4: Outcomes */}
                    <ChallengeCard
                        icon={<Target size={24} />}
                        title="ผลลัพธ์การพัฒนาที่คาดหวัง"
                        color="#10b981"
                    >
                        <div className="grid md:grid-cols-2 gap-4">
                            <SubSection label="ผลลัพธ์เชิงปริมาณ" content={data.outcomes?.quantitative} icon={<BarChart3 size={16} />} />
                            <SubSection label="ผลลัพธ์เชิงคุณภาพ" content={data.outcomes?.qualitative} icon={<CheckCircle size={16} />} />
                        </div>
                    </ChallengeCard>
                </div>
            );
        }

        // Fallback: Old format display
        return (
            <div className="space-y-4">
                <SimpleCard
                    icon={<AlertCircle size={24} />}
                    title={`${challengeNumber}.1 สภาพปัญหาการจัดการเรียนรู้`}
                    content={record?.agreement}
                    color="#ef4444"
                />
                <SimpleCard
                    icon={<Lightbulb size={24} />}
                    title={`${challengeNumber}.2 วิธีการดำเนินการให้บรรลุผล`}
                    content={record?.outcomes}
                    color="#f59e0b"
                />
                <SimpleCard
                    icon={<Target size={24} />}
                    title={`${challengeNumber}.3 ผลลัพธ์ที่คาดหวัง`}
                    content={record?.indicators}
                    color="#10b981"
                />
            </div>
        );
    };

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
                            ประเด็นท้าทาย
                        </h1>
                        <p className="text-gray-600 font-[family-name:var(--font-sarabun)]">
                            ส่วนที่ 2: ข้อตกลงในการพัฒนางานที่เป็นประเด็นท้าทาย
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
                        <div className="space-y-10">
                            {/* Challenge 1 */}
                            <section>
                                <h2
                                    className="text-xl font-semibold mb-6 flex items-center gap-3 font-[family-name:var(--font-prompt)]"
                                    style={{ color: "var(--royal-blue)" }}
                                >
                                    <TrendingUp size={24} style={{ color: "var(--gold)" }} />
                                    ประเด็นท้าทาย เรื่องที่ 1
                                </h2>
                                {renderChallengeSection(challenge1, 1)}
                            </section>

                            {/* Challenge 2 */}
                            <section>
                                <h2
                                    className="text-xl font-semibold mb-6 flex items-center gap-3 font-[family-name:var(--font-prompt)]"
                                    style={{ color: "var(--royal-blue)" }}
                                >
                                    <TrendingUp size={24} style={{ color: "var(--gold)" }} />
                                    ประเด็นท้าทาย เรื่องที่ 2
                                    <span className="text-sm font-normal text-gray-400">(Optional)</span>
                                </h2>
                                {renderChallengeSection(challenge2, 2)}
                            </section>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

// Sub-components
function ChallengeCard({
    icon,
    title,
    color,
    children
}: {
    icon: React.ReactNode;
    title: string;
    color: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 flex items-center gap-3" style={{ backgroundColor: color }}>
                <div className="text-white">{icon}</div>
                <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-prompt)]">{title}</h3>
            </div>
            <div className="p-6 space-y-4">
                {children}
            </div>
        </div>
    );
}

function SubSection({
    label,
    content,
    icon
}: {
    label: string;
    content?: string;
    icon?: React.ReactNode;
}) {
    if (!content) return null;

    return (
        <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                {icon && <span className="text-gray-400">{icon}</span>}
                <h4 className="text-sm font-semibold text-gray-600 font-[family-name:var(--font-prompt)]">{label}</h4>
            </div>
            <div className="text-gray-700 font-[family-name:var(--font-sarabun)] leading-relaxed">
                <div className="text-gray-700 font-[family-name:var(--font-sarabun)] leading-relaxed">
                    <MathText block>{content}</MathText>
                </div>
            </div>
        </div>
    );
}

function SimpleCard({
    icon,
    title,
    content,
    color
}: {
    icon: React.ReactNode;
    title: string;
    content?: string;
    color: string;
}) {
    if (!content) return null;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl text-white flex-shrink-0" style={{ backgroundColor: color }}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-3 font-[family-name:var(--font-prompt)]" style={{ color: "var(--royal-blue)" }}>
                        {title}
                    </h3>
                    <div className="text-gray-600 font-[family-name:var(--font-sarabun)] leading-relaxed">
                        <div className="text-gray-600 font-[family-name:var(--font-sarabun)] leading-relaxed">
                            <HtmlContent content={content} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
