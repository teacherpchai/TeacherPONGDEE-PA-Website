"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, ClipboardList, Target, TrendingUp } from "lucide-react";
import HtmlContent from "@/components/HtmlContent";

interface PAAccordionProps {
    indicatorCode: string;
    title: string;
    agreement: string;
    outcomes?: string;
    indicators?: string;
}

export default function PAAccordion({ indicatorCode, title, agreement, outcomes, indicators }: PAAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Check if there's meaningful content
    const hasContent = agreement && agreement !== "ยังไม่ได้บันทึกข้อตกลง";

    return (
        <div
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border overflow-hidden"
            style={{ borderColor: isOpen ? "var(--gold)" : "transparent" }}
        >
            {/* Header - Collapsed State */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:bg-gray-50"
            >
                <div className="flex items-center gap-4">
                    {/* Indicator Code Badge */}
                    <div
                        className="px-3 py-1.5 rounded-lg font-semibold text-sm font-[family-name:var(--font-prompt)]"
                        style={{
                            backgroundColor: "var(--background-secondary)",
                            color: "var(--royal-blue)"
                        }}
                    >
                        {indicatorCode}
                    </div>

                    {/* Title */}
                    <h3
                        className="font-medium font-[family-name:var(--font-sarabun)] line-clamp-1"
                        style={{ color: "var(--foreground)" }}
                    >
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    {/* Status Icon - Show if has content */}
                    {hasContent && (
                        <CheckCircle2
                            size={20}
                            className="flex-shrink-0"
                            style={{ color: "var(--gold)" }}
                        />
                    )}

                    {/* Expand Icon */}
                    <ChevronDown
                        size={20}
                        className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                            }`}
                        style={{ color: "var(--foreground-muted)" }}
                    />
                </div>
            </button>

            {/* Content - Expanded State */}
            <div
                className={`accordion-content ${isOpen ? "open" : ""}`}
                style={{
                    borderTop: isOpen ? "1px solid var(--background-secondary)" : "none"
                }}
            >
                <div className="p-6 space-y-6">
                    {/* Agreement Section */}
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-3">
                            <ClipboardList size={18} style={{ color: "var(--royal-blue)" }} />
                            <h4
                                className="text-sm font-semibold font-[family-name:var(--font-prompt)]"
                                style={{ color: "var(--royal-blue)" }}
                            >
                                ข้อตกลง PA
                            </h4>
                        </div>
                        <div
                            className="text-sm leading-relaxed font-[family-name:var(--font-sarabun)]"
                            style={{ color: "var(--foreground-muted)" }}
                        >
                            <HtmlContent content={agreement} />
                            {!agreement && "ยังไม่มีข้อมูล"}
                        </div>
                    </div>

                    {/* Two Column Layout for Outcomes & Indicators */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Outcomes Section */}
                        <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                            <div className="flex items-center gap-2 mb-3">
                                <Target size={18} style={{ color: "#059669" }} />
                                <h4
                                    className="text-sm font-semibold font-[family-name:var(--font-prompt)]"
                                    style={{ color: "#059669" }}
                                >
                                    ผลลัพธ์ที่คาดหวัง
                                </h4>
                            </div>
                            <div
                                className="text-sm leading-relaxed font-[family-name:var(--font-sarabun)]"
                                style={{ color: "var(--foreground-muted)" }}
                            >
                                <HtmlContent content={outcomes || ""} />
                                {!outcomes && "ยังไม่มีข้อมูล"}
                            </div>
                        </div>

                        {/* Indicators Section */}
                        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp size={18} style={{ color: "#d97706" }} />
                                <h4
                                    className="text-sm font-semibold font-[family-name:var(--font-prompt)]"
                                    style={{ color: "#d97706" }}
                                >
                                    ตัวชี้วัดความสำเร็จ
                                </h4>
                            </div>
                            <div
                                className="text-sm leading-relaxed font-[family-name:var(--font-sarabun)]"
                                style={{ color: "var(--foreground-muted)" }}
                            >
                                <HtmlContent content={indicators || ""} />
                                {!indicators && "ยังไม่มีข้อมูล"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
