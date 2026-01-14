"use client";

import { useState, useCallback } from "react";
import { ChallengeData } from "@/types";
import { Save, X, Loader2, ChevronDown, ChevronUp, Info } from "lucide-react";

// Sub-components moved OUTSIDE main component

interface SectionHeaderProps {
    title: string;
    section: string;
    color: string;
    isExpanded: boolean;
    onToggle: (section: string) => void;
}

function SectionHeader({ title, section, color, isExpanded, onToggle }: SectionHeaderProps) {
    return (
        <button
            type="button"
            onClick={() => onToggle(section)}
            className="w-full flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-gray-50"
            style={{ backgroundColor: `${color}10` }}
        >
            <h4
                className="font-semibold font-[family-name:var(--font-prompt)]"
                style={{ color }}
            >
                {title}
            </h4>
            {isExpanded ? (
                <ChevronUp size={20} style={{ color }} />
            ) : (
                <ChevronDown size={20} style={{ color }} />
            )}
        </button>
    );
}

interface TextAreaFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    placeholder?: string;
}

function TextAreaField({ label, value, onChange, rows = 3, placeholder = "" }: TextAreaFieldProps) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600 block">
                {label}
            </label>
            <textarea
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                placeholder={placeholder}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all font-[family-name:var(--font-sarabun)]"
            />
        </div>
    );
}

// Main component

interface ChallengeFormProps {
    challengeNumber: 1 | 2;
    initialData?: ChallengeData;
    onSave: (data: ChallengeData) => Promise<void>;
    onCancel: () => void;
    isSaving?: boolean;
}

const emptyChallenge: ChallengeData = {
    titleTH: "",
    titleEN: "",
    problem: {
        context: "",
        limitations: "",
        approach: "",
        objectives: "",
    },
    methodology: {
        researchDesign: "",
        population: "",
        instruments: "",
        procedures: "",
        dataAnalysis: "",
    },
    outcomes: {
        quantitative: "",
        qualitative: "",
    },
};

export default function ChallengeForm({
    challengeNumber,
    initialData,
    onSave,
    onCancel,
    isSaving = false,
}: ChallengeFormProps) {
    const [data, setData] = useState<ChallengeData>(initialData || emptyChallenge);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        title: true,
        problem: true,
        methodology: false,
        outcomes: false,
    });

    const toggleSection = useCallback((section: string) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    }, []);

    const updateField = useCallback((path: string, value: string) => {
        setData((prev) => {
            const newData = JSON.parse(JSON.stringify(prev)) as ChallengeData;
            const keys = path.split(".");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let obj: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
            return newData;
        });
    }, []);

    const handleSave = async () => {
        await onSave(data);
    };

    return (
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                <Info size={16} />
                <span>รองรับสมการคณิตศาสตร์: ใช้ <code className="bg-blue-100 px-1 rounded">$สมการ$</code> สำหรับ inline หรือ <code className="bg-blue-100 px-1 rounded">$$สมการ$$</code> สำหรับแสดงแบบ block</span>
            </div>

            {/* Section 1: Title */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <SectionHeader
                    title={`1. ชื่อเรื่องประเด็นท้าทาย ${challengeNumber}`}
                    section="title"
                    color="#002366"
                    isExpanded={expandedSections.title}
                    onToggle={toggleSection}
                />
                {expandedSections.title && (
                    <div className="p-4 space-y-3">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-600 block">
                                    ชื่อภาษาไทย
                                </label>
                                <input
                                    type="text"
                                    value={data.titleTH}
                                    onChange={(e) => updateField("titleTH", e.target.value)}
                                    placeholder="เช่น การพัฒนาสมรรถนะการคิดวิเคราะห์..."
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-600 block">
                                    ชื่อภาษาอังกฤษ
                                </label>
                                <input
                                    type="text"
                                    value={data.titleEN}
                                    onChange={(e) => updateField("titleEN", e.target.value)}
                                    placeholder="e.g. Development of Analytical Thinking..."
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 2: Problem */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <SectionHeader
                    title="2. สภาพปัญหาการจัดการเรียนรู้และคุณภาพการเรียนรู้ของผู้เรียน"
                    section="problem"
                    color="#dc2626"
                    isExpanded={expandedSections.problem}
                    onToggle={toggleSection}
                />
                {expandedSections.problem && (
                    <div className="p-4 space-y-4">
                        <TextAreaField
                            label="2.1 บริบทและความสำคัญของปัญหา"
                            value={data.problem.context}
                            onChange={(v) => updateField("problem.context", v)}
                            rows={4}
                            placeholder="อธิบายบริบท ปัญหาที่พบ และความสำคัญ..."
                        />
                        <TextAreaField
                            label="2.2 แนวทางการแก้ไขปัญหาทั่วไปและข้อจำกัด"
                            value={data.problem.limitations}
                            onChange={(v) => updateField("problem.limitations", v)}
                            rows={3}
                            placeholder="แนวทางที่ใช้ทั่วไปและข้อจำกัดที่พบ..."
                        />
                        <TextAreaField
                            label="2.3 แนวทางการจัดการเรียนรู้ตามประเด็นท้าทาย"
                            value={data.problem.approach}
                            onChange={(v) => updateField("problem.approach", v)}
                            rows={4}
                            placeholder="แนวทางการจัดการเรียนรู้ที่นำเสนอ..."
                        />
                        <TextAreaField
                            label="2.4 วัตถุประสงค์และสิ่งที่คาดหวัง"
                            value={data.problem.objectives}
                            onChange={(v) => updateField("problem.objectives", v)}
                            rows={3}
                            placeholder="วัตถุประสงค์การวิจัย สิ่งที่คาดหวัง..."
                        />
                    </div>
                )}
            </div>

            {/* Section 3: Methodology */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <SectionHeader
                    title="3. วิธีการดำเนินการให้บรรลุผล"
                    section="methodology"
                    color="#f59e0b"
                    isExpanded={expandedSections.methodology}
                    onToggle={toggleSection}
                />
                {expandedSections.methodology && (
                    <div className="p-4 space-y-4">
                        <TextAreaField
                            label="3.1 รูปแบบการวิจัย"
                            value={data.methodology.researchDesign}
                            onChange={(v) => updateField("methodology.researchDesign", v)}
                            rows={2}
                            placeholder="เช่น การวิจัยเชิงทดลอง, CAR..."
                        />
                        <TextAreaField
                            label="3.2 ประชากรและกลุ่มเป้าหมาย"
                            value={data.methodology.population}
                            onChange={(v) => updateField("methodology.population", v)}
                            rows={2}
                            placeholder="ประชากร กลุ่มตัวอย่าง วิธีการเลือก..."
                        />
                        <TextAreaField
                            label="3.3 เครื่องมือที่ใช้ในการวิจัย"
                            value={data.methodology.instruments}
                            onChange={(v) => updateField("methodology.instruments", v)}
                            rows={3}
                            placeholder="แบบทดสอบ แบบสอบถาม แบบสังเกต..."
                        />
                        <TextAreaField
                            label="3.4 ขั้นตอนการดำเนินการ"
                            value={data.methodology.procedures}
                            onChange={(v) => updateField("methodology.procedures", v)}
                            rows={4}
                            placeholder="ขั้นตอนการวิจัย ระยะเวลา..."
                        />
                        <TextAreaField
                            label="3.5 การวิเคราะห์ข้อมูล"
                            value={data.methodology.dataAnalysis}
                            onChange={(v) => updateField("methodology.dataAnalysis", v)}
                            rows={3}
                            placeholder="สถิติที่ใช้ เช่น $\bar{x}$, $s$, $t$-test..."
                        />
                    </div>
                )}
            </div>

            {/* Section 4: Outcomes */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <SectionHeader
                    title="4. ผลลัพธ์การพัฒนาที่คาดหวัง"
                    section="outcomes"
                    color="#10b981"
                    isExpanded={expandedSections.outcomes}
                    onToggle={toggleSection}
                />
                {expandedSections.outcomes && (
                    <div className="p-4 space-y-4">
                        <TextAreaField
                            label="4.1 ผลลัพธ์เชิงปริมาณ"
                            value={data.outcomes.quantitative}
                            onChange={(v) => updateField("outcomes.quantitative", v)}
                            rows={3}
                            placeholder="เช่น ร้อยละ 80 ของนักเรียนมีคะแนนสูงขึ้น..."
                        />
                        <TextAreaField
                            label="4.2 ผลลัพธ์เชิงคุณภาพ"
                            value={data.outcomes.qualitative}
                            onChange={(v) => updateField("outcomes.qualitative", v)}
                            rows={3}
                            placeholder="เช่น นักเรียนมีทักษะการคิดวิเคราะห์ดีขึ้น..."
                        />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium btn-royal disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Save size={16} />
                    )}
                    บันทึก
                </button>
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200"
                >
                    <X size={16} />
                    ยกเลิก
                </button>
            </div>
        </div>
    );
}
