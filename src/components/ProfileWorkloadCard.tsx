"use client";

import { Profile, SemesterWorkload } from "@/types";

interface ProfileWorkloadCardProps {
    profile: Profile;
    isLoading?: boolean;
}

interface WorkloadDisplayProps {
    workload: SemesterWorkload;
    isPrimary?: boolean;
}

function WorkloadDisplay({ workload, isPrimary = false }: WorkloadDisplayProps) {
    return (
        <div
            className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.01]"
            style={{
                backgroundColor: isPrimary ? "#E3F2FD" : "#F8F9FA",
                borderLeft: `4px solid ${isPrimary ? "var(--royal-blue)" : "var(--gold)"}`
            }}
        >
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{isPrimary ? "📘" : "📗"}</span>
                <h4
                    className="font-semibold text-sm font-[family-name:var(--font-prompt)]"
                    style={{ color: isPrimary ? "var(--royal-blue)" : "var(--gold-dark)" }}
                >
                    {workload.semesterLabel}
                </h4>
            </div>

            <div className="space-y-2 text-sm font-[family-name:var(--font-sarabun)]">
                {/* Subjects */}
                <div className="flex items-start gap-2">
                    <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>วิชา:</span>
                    <span
                        className="whitespace-pre-wrap"
                        style={{ color: "var(--foreground)" }}
                    >
                        {workload.subjects}
                    </span>
                </div>

                {/* Teaching Hours */}
                <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>ชั่วโมง/สัปดาห์:</span>
                    <span
                        className="font-semibold px-2 py-0.5 rounded-full text-xs"
                        style={{
                            backgroundColor: isPrimary ? "var(--royal-blue)" : "var(--gold)",
                            color: isPrimary ? "white" : "var(--royal-blue-dark)"
                        }}
                    >
                        {workload.teachingHours}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function ProfileWorkloadCard({
    profile,
    isLoading = false
}: ProfileWorkloadCardProps) {

    const hasSemester2 = profile.workloadSemester2?.semesterLabel;
    const hasSemester1 = profile.workloadSemester1?.semesterLabel;
    const hasLegacyData = profile.currentSubjects || profile.teachingHours || profile.currentSemester;

    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 
                        border border-transparent hover:border-[var(--gold-light)]">
            {/* Header */}
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{
                    background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
                    boxShadow: "0 4px 15px rgba(46, 125, 50, 0.2)"
                }}
            >
                <span className="text-white text-2xl">📚</span>
            </div>

            <h3
                className="text-xl font-bold mb-5 font-[family-name:var(--font-prompt)]"
                style={{ color: "var(--royal-blue)" }}
            >
                ภาระงานปัจจุบัน
            </h3>

            {isLoading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            ) : (hasSemester2 || hasSemester1) ? (
                <div className="space-y-4">
                    {profile.workloadSemester2 && hasSemester2 && (
                        <WorkloadDisplay workload={profile.workloadSemester2} isPrimary={true} />
                    )}
                    {profile.workloadSemester1 && hasSemester1 && (
                        <WorkloadDisplay workload={profile.workloadSemester1} isPrimary={false} />
                    )}
                </div>
            ) : hasLegacyData ? (
                <ul
                    className="space-y-3 text-sm font-[family-name:var(--font-sarabun)]"
                    style={{ color: "var(--foreground-muted)" }}
                >
                    {profile.currentSubjects && (
                        <li className="flex items-start gap-2">
                            <span className="text-[var(--gold)]">📖</span>
                            <span className="whitespace-pre-wrap">{profile.currentSubjects}</span>
                        </li>
                    )}
                    {profile.teachingHours && (
                        <li className="flex items-start gap-2">
                            <span className="text-[var(--gold)]">⏰</span>
                            <span className="whitespace-pre-wrap">{profile.teachingHours}</span>
                        </li>
                    )}
                    {profile.currentSemester && (
                        <li className="flex items-start gap-2">
                            <span className="text-[var(--gold)]">📅</span>
                            <span className="whitespace-pre-wrap">{profile.currentSemester}</span>
                        </li>
                    )}
                </ul>
            ) : (
                <div
                    className="text-sm font-[family-name:var(--font-sarabun)] text-center py-4"
                    style={{ color: "var(--foreground-muted)" }}
                >
                    <p>ยังไม่มีข้อมูลภาระงาน</p>
                    <p className="text-xs mt-1">กรุณาตั้งค่าใน Admin Settings</p>
                </div>
            )}
        </div>
    );
}
