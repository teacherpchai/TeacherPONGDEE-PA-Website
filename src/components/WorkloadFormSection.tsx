"use client";

import { Plus, Trash2, BookOpen, Users, TrendingUp, Target } from "lucide-react";
import { TeachingSubject, OtherWorkItem, StructuredSemesterWorkload, HOURS_PER_PERIOD } from "@/types";

interface WorkloadFormSectionProps {
    semesterNumber: 1 | 2;
    workload: StructuredSemesterWorkload;
    onChange: (workload: StructuredSemesterWorkload) => void;
}

// Empty item factories
const emptyTeachingSubject = (): TeachingSubject => ({
    subjectCode: "",
    subjectName: "",
    level: "",
    periodsPerWeek: 0,
});

const emptyWorkItem = (): OtherWorkItem => ({
    description: "",
    hoursPerWeek: 0,
});

// Calculate total teaching hours
const calculateTeachingHours = (subjects: TeachingSubject[]): number => {
    const totalPeriods = subjects.reduce((sum, s) => sum + (s.periodsPerWeek || 0), 0);
    return totalPeriods * HOURS_PER_PERIOD;
};

// Calculate total work hours
const calculateWorkHours = (items: OtherWorkItem[]): number => {
    return items.reduce((sum, item) => sum + (item.hoursPerWeek || 0), 0);
};

export default function WorkloadFormSection({ semesterNumber, workload, onChange }: WorkloadFormSectionProps) {
    const bgColor = semesterNumber === 2 ? "bg-blue-50" : "bg-gray-50";
    const titleColor = semesterNumber === 2 ? "text-[var(--royal-blue)]" : "text-gray-600";
    const emoji = semesterNumber === 2 ? "📘" : "📗";

    // Teaching subjects handlers
    const addTeachingSubject = () => {
        onChange({
            ...workload,
            teachingSubjects: [...workload.teachingSubjects, emptyTeachingSubject()],
        });
    };

    const updateTeachingSubject = (index: number, field: keyof TeachingSubject, value: string | number) => {
        const updated = workload.teachingSubjects.map((s, i) =>
            i === index ? { ...s, [field]: value } : s
        );
        onChange({ ...workload, teachingSubjects: updated });
    };

    const removeTeachingSubject = (index: number) => {
        onChange({
            ...workload,
            teachingSubjects: workload.teachingSubjects.filter((_, i) => i !== index),
        });
    };

    // Generic work item handlers
    const addWorkItem = (field: "supportWork" | "developmentWork" | "policyWork") => {
        onChange({
            ...workload,
            [field]: [...workload[field], emptyWorkItem()],
        });
    };

    const updateWorkItem = (
        field: "supportWork" | "developmentWork" | "policyWork",
        index: number,
        prop: keyof OtherWorkItem,
        value: string | number
    ) => {
        const updated = workload[field].map((item, i) =>
            i === index ? { ...item, [prop]: value } : item
        );
        onChange({ ...workload, [field]: updated });
    };

    const removeWorkItem = (field: "supportWork" | "developmentWork" | "policyWork", index: number) => {
        onChange({
            ...workload,
            [field]: workload[field].filter((_, i) => i !== index),
        });
    };

    // Totals
    const totalPeriods = workload.teachingSubjects.reduce((s, t) => s + (t.periodsPerWeek || 0), 0);
    const teachingHours = calculateTeachingHours(workload.teachingSubjects);
    const supportHours = calculateWorkHours(workload.supportWork);
    const devHours = calculateWorkHours(workload.developmentWork);
    const policyHours = calculateWorkHours(workload.policyWork);
    const totalHours = teachingHours + supportHours + devHours + policyHours;

    return (
        <div className={`${bgColor} p-4 rounded-lg mb-4`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h4 className={`text-sm font-semibold ${titleColor}`}>
                    {emoji} ภาคเรียนที่ {semesterNumber} {semesterNumber === 2 ? "(ปีก่อน)" : "(ปีปัจจุบัน)"}
                </h4>
                <input
                    type="text"
                    value={workload.semesterLabel}
                    onChange={(e) => onChange({ ...workload, semesterLabel: e.target.value })}
                    className="px-3 py-1 border rounded-lg text-sm w-48"
                    placeholder={`ภาคเรียนที่ ${semesterNumber}/256X`}
                />
            </div>

            {/* 1. ชั่วโมงสอนตามตารางสอน */}
            <div className="mb-4 bg-white p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                        <BookOpen size={16} />
                        1. ชั่วโมงสอนตามตารางสอน
                    </div>
                    <button
                        type="button"
                        onClick={addTeachingSubject}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                        <Plus size={14} /> เพิ่มรายวิชา
                    </button>
                </div>

                {workload.teachingSubjects.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">ยังไม่มีรายวิชา - กรุณากดปุ่มเพิ่ม</p>
                ) : (
                    <div className="space-y-2">
                        {workload.teachingSubjects.map((subject, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                                <input
                                    type="text"
                                    value={subject.subjectCode}
                                    onChange={(e) => updateTeachingSubject(idx, "subjectCode", e.target.value)}
                                    className="w-24 px-2 py-1 border rounded text-xs"
                                    placeholder="รหัสวิชา"
                                />
                                <input
                                    type="text"
                                    value={subject.subjectName}
                                    onChange={(e) => updateTeachingSubject(idx, "subjectName", e.target.value)}
                                    className="flex-1 px-2 py-1 border rounded text-xs"
                                    placeholder="ชื่อรายวิชา"
                                />
                                <select
                                    value={subject.level || ""}
                                    onChange={(e) => updateTeachingSubject(idx, "level", e.target.value)}
                                    className="w-24 px-2 py-1 border rounded text-xs"
                                    title="ระดับชั้น"
                                >
                                    <option value="">เลือกระดับ</option>
                                    <option value="ม.1">ม.1</option>
                                    <option value="ม.2">ม.2</option>
                                    <option value="ม.3">ม.3</option>
                                    <option value="ม.4">ม.4</option>
                                    <option value="ม.5">ม.5</option>
                                    <option value="ม.6">ม.6</option>
                                    <option value="ม.1-ม.3">ม.1-ม.3</option>
                                    <option value="ม.4-ม.6">ม.4-ม.6</option>
                                    <option value="ม.1-ม.6">ม.1-ม.6</option>
                                </select>
                                <input
                                    type="number"
                                    value={subject.periodsPerWeek || ""}
                                    onChange={(e) => updateTeachingSubject(idx, "periodsPerWeek", parseFloat(e.target.value) || 0)}
                                    className="w-16 px-2 py-1 border rounded text-xs text-center"
                                    placeholder="คาบ"
                                    min="0"
                                    step="0.5"
                                />
                                <span className="text-xs text-gray-500">คาบ/สัปดาห์</span>
                                <button
                                    type="button"
                                    onClick={() => removeTeachingSubject(idx)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {workload.teachingSubjects.length > 0 && (
                    <div className="mt-2 pt-2 border-t text-xs text-gray-600 flex gap-4">
                        <span>รวม: <strong>{totalPeriods}</strong> คาบ/สัปดาห์</span>
                        <span>= <strong>{teachingHours.toFixed(2)}</strong> ชม./สัปดาห์</span>
                        <span className="text-gray-400">(1 คาบ = 50 นาที)</span>
                    </div>
                )}
            </div>

            {/* 2. งานส่งเสริมและสนับสนุน */}
            <WorkItemSection
                title="2. งานส่งเสริมและสนับสนุนการจัดการเรียนรู้"
                icon={<Users size={16} />}
                color="green"
                items={workload.supportWork}
                onAdd={() => addWorkItem("supportWork")}
                onUpdate={(idx, prop, val) => updateWorkItem("supportWork", idx, prop, val)}
                onRemove={(idx) => removeWorkItem("supportWork", idx)}
            />

            {/* 3. งานพัฒนาคุณภาพ */}
            <WorkItemSection
                title="3. งานพัฒนาคุณภาพการจัดการศึกษาของสถานศึกษา"
                icon={<TrendingUp size={16} />}
                color="purple"
                items={workload.developmentWork}
                onAdd={() => addWorkItem("developmentWork")}
                onUpdate={(idx, prop, val) => updateWorkItem("developmentWork", idx, prop, val)}
                onRemove={(idx) => removeWorkItem("developmentWork", idx)}
            />

            {/* 4. งานตอบสนองนโยบาย */}
            <WorkItemSection
                title="4. งานตอบสนองนโยบายและจุดเน้น"
                icon={<Target size={16} />}
                color="orange"
                items={workload.policyWork}
                onAdd={() => addWorkItem("policyWork")}
                onUpdate={(idx, prop, val) => updateWorkItem("policyWork", idx, prop, val)}
                onRemove={(idx) => removeWorkItem("policyWork", idx)}
            />

            {/* Summary */}
            <div className="mt-4 p-3 bg-white rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-sm font-semibold text-gray-700 mb-2">📊 สรุปภาระงาน</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div className="p-2 bg-blue-50 rounded text-center">
                        <div className="font-bold text-blue-700">{teachingHours.toFixed(2)}</div>
                        <div className="text-gray-500">ชม. สอน</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-center">
                        <div className="font-bold text-green-700">{supportHours.toFixed(2)}</div>
                        <div className="text-gray-500">ชม. ส่งเสริม</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded text-center">
                        <div className="font-bold text-purple-700">{devHours.toFixed(2)}</div>
                        <div className="text-gray-500">ชม. พัฒนา</div>
                    </div>
                    <div className="p-2 bg-orange-50 rounded text-center">
                        <div className="font-bold text-orange-700">{policyHours.toFixed(2)}</div>
                        <div className="text-gray-500">ชม. นโยบาย</div>
                    </div>
                    <div className="p-2 bg-gray-100 rounded text-center">
                        <div className="font-bold text-gray-800">{totalHours.toFixed(2)}</div>
                        <div className="text-gray-500">ชม./สัปดาห์ รวม</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component for work items (support, development, policy)
function WorkItemSection({
    title,
    icon,
    color,
    items,
    onAdd,
    onUpdate,
    onRemove,
}: {
    title: string;
    icon: React.ReactNode;
    color: "green" | "purple" | "orange";
    items: OtherWorkItem[];
    onAdd: () => void;
    onUpdate: (index: number, prop: keyof OtherWorkItem, value: string | number) => void;
    onRemove: (index: number) => void;
}) {
    const colorClasses = {
        green: { text: "text-green-700", bg: "bg-green-100", hover: "hover:bg-green-200" },
        purple: { text: "text-purple-700", bg: "bg-purple-100", hover: "hover:bg-purple-200" },
        orange: { text: "text-orange-700", bg: "bg-orange-100", hover: "hover:bg-orange-200" },
    };
    const c = colorClasses[color];

    return (
        <div className="mb-4 bg-white p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <div className={`flex items-center gap-2 text-sm font-medium ${c.text}`}>
                    {icon}
                    {title}
                </div>
                <button
                    type="button"
                    onClick={onAdd}
                    className={`flex items-center gap-1 text-xs px-2 py-1 ${c.bg} ${c.text} rounded ${c.hover}`}
                >
                    <Plus size={14} /> เพิ่มงาน
                </button>
            </div>

            {items.length === 0 ? (
                <p className="text-xs text-gray-400 italic">ยังไม่มีรายการ - กรุณากดปุ่มเพิ่ม</p>
            ) : (
                <div className="space-y-2">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                            <input
                                type="text"
                                value={item.description}
                                onChange={(e) => onUpdate(idx, "description", e.target.value)}
                                className="flex-1 px-2 py-1 border rounded text-xs"
                                placeholder="รายละเอียดงาน"
                            />
                            <input
                                type="number"
                                value={item.hoursPerWeek || ""}
                                onChange={(e) => onUpdate(idx, "hoursPerWeek", parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border rounded text-xs text-center"
                                placeholder="ชม./สัปดาห์"
                                min="0"
                                step="0.5"
                            />
                            <span className="text-xs text-gray-500">ชม./สัปดาห์</span>
                            <button
                                type="button"
                                onClick={() => onRemove(idx)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {items.length > 0 && (
                <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                    รวม: <strong>{items.reduce((s, i) => s + (i.hoursPerWeek || 0), 0).toFixed(2)}</strong> ชม./สัปดาห์
                </div>
            )}
        </div>
    );
}
