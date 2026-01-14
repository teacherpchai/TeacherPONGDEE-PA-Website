"use client";

import { CareerItem } from "@/types";

interface ProfileCareerCardProps {
    career?: CareerItem[];
    legacyCareer?: string[]; // Fallback for old format
    isLoading?: boolean;
}

export default function ProfileCareerCard({
    career,
    legacyCareer,
    isLoading = false
}: ProfileCareerCardProps) {

    const hasStructuredData = career && career.length > 0;
    const hasLegacyData = legacyCareer && legacyCareer.length > 0;

    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 
                        border border-transparent hover:border-[var(--gold-light)]">
            {/* Header */}
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{
                    background: "linear-gradient(135deg, var(--gold-light), var(--gold))",
                    boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)"
                }}
            >
                <span className="text-white text-2xl">💼</span>
            </div>

            <h3
                className="text-xl font-bold mb-5 font-[family-name:var(--font-prompt)]"
                style={{ color: "var(--royal-blue)" }}
            >
                ประวัติการทำงาน
            </h3>

            {isLoading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            ) : hasStructuredData ? (
                <div className="relative">
                    {/* Timeline Line */}
                    <div
                        className="absolute left-3 top-2 bottom-2 w-0.5"
                        style={{
                            background: "linear-gradient(to bottom, var(--royal-blue), var(--gold))"
                        }}
                    ></div>

                    {/* Timeline Items */}
                    <div className="space-y-4">
                        {career.map((item, index) => {
                            const isLatest = index === 0;
                            const isCurrent = !item.endDate || item.endDate.includes("ปัจจุบัน");

                            return (
                                <div
                                    key={index}
                                    className="relative pl-8 group"
                                >
                                    {/* Timeline Dot */}
                                    <div
                                        className="absolute left-0 top-2 w-6 h-6 rounded-full flex items-center justify-center
                                                   border-2 transition-all duration-300 group-hover:scale-110"
                                        style={{
                                            backgroundColor: isCurrent ? "var(--gold)" : "white",
                                            borderColor: isCurrent ? "var(--gold)" : "var(--royal-blue)"
                                        }}
                                    >
                                        {isLatest && (
                                            <div
                                                className="w-2 h-2 rounded-full animate-pulse"
                                                style={{ backgroundColor: isCurrent ? "white" : "var(--royal-blue)" }}
                                            ></div>
                                        )}
                                    </div>

                                    {/* Content Card */}
                                    <div
                                        className="rounded-lg p-4 transition-all duration-300 
                                                   hover:translate-x-1 border-l-4"
                                        style={{
                                            backgroundColor: isCurrent ? "#FFF8E1" : "#F8F9FA",
                                            borderLeftColor: isCurrent ? "var(--gold)" : "var(--royal-blue)"
                                        }}
                                    >
                                        {/* Date Range */}
                                        <div
                                            className="text-xs font-medium mb-2 flex items-center gap-2"
                                            style={{ color: isCurrent ? "var(--gold-dark)" : "var(--foreground-muted)" }}
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                            {item.startDate}
                                            {item.endDate && ` - ${item.endDate}`}
                                            {isCurrent && !item.endDate && " - ปัจจุบัน"}
                                        </div>

                                        {/* Position & Rank */}
                                        <div
                                            className="font-semibold text-sm mb-1 font-[family-name:var(--font-prompt)]"
                                            style={{ color: "var(--royal-blue)" }}
                                        >
                                            {item.position}
                                            {item.rank && <span className="font-normal text-xs ml-2">({item.rank})</span>}
                                        </div>

                                        {/* Institution */}
                                        <div
                                            className="text-sm font-[family-name:var(--font-sarabun)]"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            {item.institution}
                                        </div>

                                        {/* Department */}
                                        {item.department && (
                                            <div
                                                className="text-xs mt-1 font-[family-name:var(--font-sarabun)]"
                                                style={{ color: "var(--foreground-muted)" }}
                                            >
                                                {item.department}
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {item.notes && (
                                            <div
                                                className="text-xs mt-2 italic whitespace-pre-wrap"
                                                style={{ color: "var(--foreground-muted)" }}
                                            >
                                                {item.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : hasLegacyData ? (
                <ul
                    className="space-y-2 text-sm font-[family-name:var(--font-sarabun)]"
                    style={{ color: "var(--foreground-muted)" }}
                >
                    {legacyCareer.map((item, index) => (
                        <li key={index} className="whitespace-pre-wrap">• {item}</li>
                    ))}
                </ul>
            ) : (
                <div
                    className="text-sm font-[family-name:var(--font-sarabun)] text-center py-4"
                    style={{ color: "var(--foreground-muted)" }}
                >
                    <p>ยังไม่มีข้อมูลประวัติการทำงาน</p>
                    <p className="text-xs mt-1">กรุณาตั้งค่าใน Admin Settings</p>
                </div>
            )}
        </div>
    );
}
