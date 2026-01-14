"use client";

import { Printer } from "lucide-react";

interface PrintButtonProps {
    title?: string;
    className?: string;
}

export default function PrintButton({ title, className = "" }: PrintButtonProps) {
    const handlePrint = () => {
        // Set document title for print
        const originalTitle = document.title;
        if (title) {
            document.title = title;
        }

        // Trigger print
        window.print();

        // Restore original title
        if (title) {
            document.title = originalTitle;
        }
    };

    return (
        <button
            onClick={handlePrint}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
                       bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors
                       print:hidden ${className}`}
            title="พิมพ์หน้านี้"
        >
            <Printer size={18} />
            <span className="hidden sm:inline">พิมพ์</span>
        </button>
    );
}
