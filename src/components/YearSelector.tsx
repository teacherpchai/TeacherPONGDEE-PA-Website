"use client";

import { ChevronDown } from "lucide-react";

interface YearSelectorProps {
    years: string[];
    selectedYear: string;
    onYearChange: (year: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function YearSelector({
    years,
    selectedYear,
    onYearChange,
    isOpen,
    setIsOpen,
}: YearSelectorProps) {
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all hover:border-[var(--gold)] font-[family-name:var(--font-sarabun)]"
                style={{
                    borderColor: "var(--royal-blue)",
                    backgroundColor: "white"
                }}
            >
                <span style={{ color: "var(--foreground-muted)" }}>
                    ปีงบประมาณ
                </span>
                <span
                    className="font-semibold font-[family-name:var(--font-prompt)]"
                    style={{ color: "var(--royal-blue)" }}
                >
                    {selectedYear}
                </span>
                <ChevronDown
                    size={20}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: "var(--royal-blue)" }}
                />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div
                        className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border overflow-hidden z-50"
                        style={{ borderColor: "var(--background-secondary)" }}
                    >
                        {years.map((year) => (
                            <button
                                key={year}
                                onClick={() => {
                                    onYearChange(year);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-5 py-3 text-left transition-colors font-[family-name:var(--font-sarabun)] ${selectedYear === year
                                    ? "font-semibold"
                                    : "hover:bg-gray-50"
                                    }`}
                                style={{
                                    backgroundColor: selectedYear === year ? "var(--background-secondary)" : "transparent",
                                    color: "var(--royal-blue)"
                                }}
                            >
                                <span className="font-[family-name:var(--font-prompt)]">
                                    ปี {year}
                                </span>
                                {selectedYear === year && (
                                    <span
                                        className="ml-2 text-xs"
                                        style={{ color: "var(--gold)" }}
                                    >
                                        ● ปัจจุบัน
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
