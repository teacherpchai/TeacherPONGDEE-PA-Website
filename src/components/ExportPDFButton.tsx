"use client";

import { useState } from "react";
import { Download, Loader2, FileText } from "lucide-react";
import { PATask, Profile } from "@/types";
import { generatePAReportPDF, downloadPDF } from "@/lib/pdfGenerator";

interface ExportPDFButtonProps {
    year: string;
    tasks: PATask[];
    profile: Profile;
    variant?: "primary" | "secondary";
    size?: "sm" | "md";
}

export default function ExportPDFButton({
    year,
    tasks,
    profile,
    variant = "primary",
    size = "md",
}: ExportPDFButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleExport = async () => {
        if (tasks.length === 0) {
            alert("ไม่มีข้อมูล PA สำหรับ export");
            return;
        }

        setIsGenerating(true);

        try {
            const blob = await generatePAReportPDF({
                year,
                tasks,
                profile,
                generatedAt: new Date(),
            });

            const filename = `PA_Report_${year}_${new Date().toISOString().split("T")[0]}.pdf`;
            downloadPDF(blob, filename);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("เกิดข้อผิดพลาดในการสร้าง PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    const baseClasses = "flex items-center gap-2 font-medium rounded-lg transition-all disabled:opacity-50";

    const variantClasses = {
        primary: "btn-royal text-white",
        secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
    };

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
    };

    return (
        <button
            onClick={handleExport}
            disabled={isGenerating || tasks.length === 0}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
            title={tasks.length === 0 ? "ไม่มีข้อมูลสำหรับ export" : "ดาวน์โหลด PDF Report"}
        >
            {isGenerating ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    กำลังสร้าง PDF...
                </>
            ) : (
                <>
                    {variant === "primary" ? <Download size={16} /> : <FileText size={16} />}
                    Export PDF
                </>
            )}
        </button>
    );
}
