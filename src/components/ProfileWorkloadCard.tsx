"use client";

import { Profile, SemesterWorkload } from "@/types";
import { BookOpen, Clock, Activity } from "lucide-react";

interface ProfileWorkloadCardProps {
    profile: Profile;
    isLoading?: boolean;
}

// Helper to extract numeric hours
function parseHours(hourString: string): number {
    const match = hourString.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
}

// Colors for tags
const TAG_COLORS = [
    { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
    { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
    { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
    { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
    { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
];

function SubjectTags({ subjects }: { subjects: string }) {
    if (!subjects) return null;

    // Split by newline or comma
    const list = subjects.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {list.map((subject, idx) => {
                const color = TAG_COLORS[idx % TAG_COLORS.length];
                return (
                    <span
                        key={idx}
                        className={`text-xs px-2 py-1 rounded-md border ${color.bg} ${color.text} ${color.border} font-[family-name:var(--font-sarabun)]`}
                    >
                        {subject}
                    </span>
                );
            })}
        </div>
    );
}

function RadialGauge({ value, label, color }: { value: number, label: string, color: string }) {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const max = 30; // Assume max 30 hours for full circle visualization
    const percentage = Math.min(value / max, 1);
    const strokeDashoffset = circumference - (percentage * circumference);

    return (
        <div className="flex flex-col items-center justify-center relative w-24 h-24">
            <svg className="transform -rotate-90 w-24 h-24">
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="transparent"
                />
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className={`text-xl font-bold font-[family-name:var(--font-prompt)]`} style={{ color }}>
                    {value}
                </span>
                <span className="text-[10px] text-gray-500 font-[family-name:var(--font-sarabun)]">
                    ชม./สัปดาห์
                </span>
            </div>
        </div>
    );
}

function WorkloadDisplay({ workload, isPrimary }: { workload: SemesterWorkload, isPrimary: boolean }) {
    const hours = parseHours(workload.teachingHours);
    const themeColor = isPrimary ? "var(--royal-blue)" : "var(--gold)";
    const themeHex = isPrimary ? "#1e40af" : "#f59e0b"; // Approximate hex for radial gauge

    return (
        <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden group">
            {/* Top Border Indicator */}
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: themeColor }} />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-lg font-[family-name:var(--font-prompt)]" style={{ color: themeColor }}>
                        {workload.semesterLabel}
                    </h4>
                    <span className="text-xs text-gray-400 font-[family-name:var(--font-sarabun)]">
                        ปีการศึกษาปัจจุบัน
                    </span>
                </div>
                {/* Gauge */}
                <div className="-mt-2 -mr-2">
                    <RadialGauge value={hours} label="ชม." color={themeHex} />
                </div>
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 text-gray-600">
                    <BookOpen size={16} />
                    <span className="text-sm font-semibold font-[family-name:var(--font-sarabun)]">รายวิชาที่สอน:</span>
                </div>
                <SubjectTags subjects={workload.subjects} />
            </div>

            {/* Teaching Hours Text Fallback/Detail */}
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-500 font-[family-name:var(--font-sarabun)]">
                <Activity size={14} />
                <span>รวมภาระงานสอน: {workload.teachingHours}</span>
            </div>
        </div>
    );
}

export default function ProfileWorkloadCard({ profile, isLoading = false }: ProfileWorkloadCardProps) {
    const hasSemester2 = profile.workloadSemester2?.semesterLabel;
    const hasSemester1 = profile.workloadSemester1?.semesterLabel;
    const hasLegacyData = profile.currentSubjects || profile.teachingHours || profile.currentSemester;
    const hasAnyData = hasSemester1 || hasSemester2 || hasLegacyData;

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-lg h-full animate-pulse">
                <div className="w-14 h-14 bg-gray-200 rounded-xl mb-5"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="h-48 bg-gray-100 rounded-xl"></div>
                    <div className="h-48 bg-gray-100 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg h-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                        background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
                        boxShadow: "0 4px 15px rgba(46, 125, 50, 0.2)"
                    }}
                >
                    <Clock className="text-white" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold font-[family-name:var(--font-prompt)]" style={{ color: "var(--royal-blue)" }}>
                        ภาระงานสอน
                    </h3>
                    <p className="text-sm text-gray-500 font-[family-name:var(--font-sarabun)]">
                        ข้อมูลรายวิชาและชั่วโมงสอน
                    </p>
                </div>
            </div>

            <div className="mt-4">
                {(hasSemester2 || hasSemester1) ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        {profile.workloadSemester2 && hasSemester2 && (
                            <WorkloadDisplay workload={profile.workloadSemester2} isPrimary={true} />
                        )}
                        {/* If only one semester exists, it will take up appropriate space in grid, but we might want full width if only one. 
                            For now, keeping grid to ensure consistent card sizing. 
                         */}
                        {profile.workloadSemester1 && hasSemester1 && (
                            <WorkloadDisplay workload={profile.workloadSemester1} isPrimary={false} />
                        )}
                    </div>
                ) : hasLegacyData ? (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">📅</span>
                            <div>
                                <h4 className="font-bold text-gray-700 font-[family-name:var(--font-prompt)]">
                                    {profile.currentSemester || "ข้อมูลเก่า"}
                                </h4>
                            </div>
                        </div>

                        {profile.currentSubjects && (
                            <div className="mb-4">
                                <span className="text-xs text-gray-500 block mb-1 font-[family-name:var(--font-sarabun)]">รายวิชา:</span>
                                <SubjectTags subjects={profile.currentSubjects} />
                            </div>
                        )}

                        {profile.teachingHours && (
                            <div className="text-sm text-gray-600 font-[family-name:var(--font-sarabun)] bg-white p-3 rounded-lg inline-block border">
                                ⏱️ {profile.teachingHours}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-400 font-[family-name:var(--font-sarabun)]">ยังไม่มีข้อมูลภาระงานในขณะนี้</p>
                    </div>
                )}
            </div>
        </div>
    );
}
