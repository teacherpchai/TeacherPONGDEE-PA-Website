"use client";

import { EducationItem, EducationLevel, EDUCATION_LEVEL_LABELS, EDUCATION_LEVEL_COLORS } from "@/types";

interface ProfileEducationCardProps {
    education?: EducationItem[];
    legacyEducation?: string[]; // Fallback for old format
    isLoading?: boolean;
}

// Order of education levels for display
const LEVEL_ORDER: EducationLevel[] = ["junior_high", "senior_high", "bachelor", "master", "doctoral"];

export default function ProfileEducationCard({
    education,
    legacyEducation,
    isLoading = false
}: ProfileEducationCardProps) {

    // Group education by level with proper typing
    const groupedEducation: Partial<Record<EducationLevel, EducationItem[]>> =
        education?.reduce<Partial<Record<EducationLevel, EducationItem[]>>>((acc, item) => {
            if (!acc[item.level]) {
                acc[item.level] = [];
            }
            acc[item.level]!.push(item);
            return acc;
        }, {}) || {};

    // Get levels that have data, in order
    const levelsWithData = LEVEL_ORDER.filter(level => (groupedEducation[level]?.length ?? 0) > 0);

    // If no structured data, fall back to legacy format
    const hasStructuredData = levelsWithData.length > 0;
    const hasLegacyData = legacyEducation && legacyEducation.length > 0;

    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 
                        border border-transparent hover:border-[var(--gold-light)]">
            {/* Header */}
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{
                    background: "linear-gradient(135deg, var(--royal-blue-light), var(--royal-blue))",
                    boxShadow: "0 4px 15px rgba(0, 35, 102, 0.2)"
                }}
            >
                <span className="text-white text-2xl">🎓</span>
            </div>

            <h3
                className="text-xl font-bold mb-5 font-[family-name:var(--font-prompt)]"
                style={{ color: "var(--royal-blue)" }}
            >
                การศึกษา
            </h3>

            {isLoading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            ) : hasStructuredData ? (
                <div className="space-y-4">
                    {levelsWithData.map((level, levelIndex) => {
                        const levelColors = EDUCATION_LEVEL_COLORS[level];
                        const levelLabel = EDUCATION_LEVEL_LABELS[level];
                        const items = groupedEducation[level];

                        return (
                            <div
                                key={level}
                                className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
                                style={{
                                    backgroundColor: levelColors.bg,
                                    animationDelay: `${levelIndex * 0.1}s`
                                }}
                            >
                                {/* Level Header */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-lg">{levelColors.icon}</span>
                                    <h4
                                        className="font-semibold text-sm font-[family-name:var(--font-prompt)]"
                                        style={{ color: levelColors.text }}
                                    >
                                        {levelLabel}
                                    </h4>
                                </div>

                                {/* Education Items */}
                                <div className="space-y-2 pl-7">
                                    {(items ?? []).map((item: EducationItem, itemIndex: number) => (
                                        <div
                                            key={itemIndex}
                                            className="text-sm font-[family-name:var(--font-sarabun)]"
                                        >
                                            <div className="flex items-start gap-2">
                                                <span
                                                    className="font-medium"
                                                    style={{ color: levelColors.text }}
                                                >
                                                    {item.year}
                                                </span>
                                                <span style={{ color: "var(--foreground)" }}>
                                                    {item.degree}
                                                </span>
                                            </div>
                                            <div
                                                className="text-xs mt-1"
                                                style={{ color: "var(--foreground-muted)" }}
                                            >
                                                {item.institution}
                                                {item.location && ` • ${item.location}`}
                                            </div>
                                            {item.notes && (
                                                <div
                                                    className="text-xs mt-1 italic whitespace-pre-wrap"
                                                    style={{ color: "var(--foreground-muted)" }}
                                                >
                                                    {item.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : hasLegacyData ? (
                <ul
                    className="space-y-2 text-sm font-[family-name:var(--font-sarabun)]"
                    style={{ color: "var(--foreground-muted)" }}
                >
                    {legacyEducation.map((item, index) => (
                        <li key={index} className="whitespace-pre-wrap">• {item}</li>
                    ))}
                </ul>
            ) : (
                <div
                    className="text-sm font-[family-name:var(--font-sarabun)] text-center py-4"
                    style={{ color: "var(--foreground-muted)" }}
                >
                    <p>ยังไม่มีข้อมูลการศึกษา</p>
                    <p className="text-xs mt-1">กรุณาตั้งค่าใน Admin Settings</p>
                </div>
            )}
        </div>
    );
}
