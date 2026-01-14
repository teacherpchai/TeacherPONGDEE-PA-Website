"use client";

import { Download, FileText, ExternalLink } from "lucide-react";

interface PADocument {
    title: string;
    type: "agreement" | "report" | "evidence";
    url?: string;
    updatedAt?: string;
}

interface PADocumentCardProps {
    documents?: PADocument[];
    year: string;
    category?: string;
    emptyMessage?: string;
}

export default function PADocumentCard({
    documents = [],
    year,
    category,
    emptyMessage = "ยังไม่มีเอกสารสำหรับดาวน์โหลด"
}: PADocumentCardProps) {
    const hasDocuments = documents.length > 0;

    const getTypeLabel = (type: PADocument["type"]) => {
        switch (type) {
            case "agreement": return "ข้อตกลง PA";
            case "report": return "รายงาน PA";
            case "evidence": return "หลักฐาน";
            default: return "เอกสาร";
        }
    };

    const getTypeColor = (type: PADocument["type"]) => {
        switch (type) {
            case "agreement": return { bg: "#E3F2FD", color: "var(--royal-blue)" };
            case "report": return { bg: "#FFF8E1", color: "var(--gold-dark)" };
            case "evidence": return { bg: "#E8F5E9", color: "#2E7D32" };
            default: return { bg: "#F5F5F5", color: "#666" };
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3
                    className="text-lg font-bold font-[family-name:var(--font-prompt)] flex items-center gap-2"
                    style={{ color: "var(--royal-blue)" }}
                >
                    <Download size={20} />
                    เอกสาร PA
                </h3>
                <span
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{ backgroundColor: "var(--gold-light)", color: "var(--royal-blue-dark)" }}
                >
                    ปี {year}
                </span>
            </div>

            {category && (
                <p className="text-sm text-gray-500 mb-4">
                    หมวด: {category}
                </p>
            )}

            {hasDocuments ? (
                <div className="space-y-3">
                    {documents.map((doc, index) => {
                        const typeStyle = getTypeColor(doc.type);
                        return (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.01]"
                                style={{ backgroundColor: typeStyle.bg }}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText size={20} style={{ color: typeStyle.color }} />
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: typeStyle.color }}>
                                            {doc.title}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{getTypeLabel(doc.type)}</span>
                                            {doc.updatedAt && (
                                                <>
                                                    <span>•</span>
                                                    <span>อัปเดต: {doc.updatedAt}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {doc.url ? (
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                                        style={{ backgroundColor: typeStyle.color, color: "white" }}
                                    >
                                        <Download size={14} />
                                        ดาวน์โหลด
                                    </a>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">ยังไม่มีไฟล์</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-6 text-gray-400">
                    <FileText size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{emptyMessage}</p>
                </div>
            )}

            {/* Help text */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                    <ExternalLink size={12} />
                    ไฟล์จะเปิดใน Google Drive
                </p>
            </div>
        </div>
    );
}
