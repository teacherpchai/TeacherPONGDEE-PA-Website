// ========================================
// PDF Report Generator
// Kru Pongdee Digital PA Portfolio
// ========================================

import { jsPDF } from "jspdf";
import { PATask, Profile, PA_CATEGORIES } from "@/types";

// ============ Types ============

export interface PDFReportData {
    year: string;
    tasks: PATask[];
    profile: Profile;
    generatedAt: Date;
}

// ============ Constants ============

const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// Category emojis and colors
const CATEGORY_META = {
    learning: { label: "การจัดการเรียนรู้", color: "#1e40af" },
    support: { label: "การส่งเสริมและสนับสนุน", color: "#059669" },
    self_dev: { label: "การพัฒนาตนเองและวิชาชีพ", color: "#7c3aed" },
    challenge: { label: "ประเด็นท้าทาย", color: "#dc2626" },
};

// ============ Main Export Function ============

/**
 * Generate PA Report PDF
 */
export async function generatePAReportPDF(data: PDFReportData): Promise<Blob> {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    let currentY = MARGIN;

    // ========== Cover Page ==========
    currentY = addCoverPage(doc, data);

    // ========== Table of Contents ==========
    doc.addPage();
    currentY = MARGIN;
    currentY = addTableOfContents(doc, data, currentY);

    // ========== PA Content by Category ==========
    for (const category of PA_CATEGORIES) {
        const categoryTasks = data.tasks.filter((t) => t.category === category.id);
        if (categoryTasks.length === 0) continue;

        doc.addPage();
        currentY = MARGIN;
        currentY = addCategorySection(doc, category.id, categoryTasks, currentY);
    }

    // ========== Footer on all pages ==========
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addPageFooter(doc, i, totalPages, data.year);
    }

    return doc.output("blob");
}

// ============ Cover Page ==========

function addCoverPage(doc: jsPDF, data: PDFReportData): number {
    let y = 60;

    // Title
    doc.setFontSize(24);
    doc.setTextColor(0, 35, 102); // Royal blue
    doc.text("Digital PA Portfolio", PAGE_WIDTH / 2, y, { align: "center" });

    y += 15;
    doc.setFontSize(18);
    doc.text("Performance Agreement Report", PAGE_WIDTH / 2, y, { align: "center" });

    // Year
    y += 30;
    doc.setFontSize(32);
    doc.setTextColor(212, 175, 55); // Gold
    doc.text(`${data.year}`, PAGE_WIDTH / 2, y, { align: "center" });

    // Profile info
    y += 40;
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text(data.profile.nameTH || "Teacher Name", PAGE_WIDTH / 2, y, { align: "center" });

    y += 8;
    doc.setFontSize(12);
    doc.text(data.profile.position || "Position", PAGE_WIDTH / 2, y, { align: "center" });

    y += 8;
    doc.text(data.profile.department || "Department", PAGE_WIDTH / 2, y, { align: "center" });

    // Summary stats
    y += 40;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);

    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter((t) => t.actualResults && t.actualResults.trim().length > 0).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    doc.text(`Total PA Tasks: ${totalTasks}`, PAGE_WIDTH / 2, y, { align: "center" });
    y += 7;
    doc.text(`Completed: ${completedTasks} (${completionRate}%)`, PAGE_WIDTH / 2, y, { align: "center" });

    // Generated date
    y = PAGE_HEIGHT - 40;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const dateStr = data.generatedAt.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    doc.text(`Generated: ${dateStr}`, PAGE_WIDTH / 2, y, { align: "center" });

    return y;
}

// ============ Table of Contents ==========

function addTableOfContents(doc: jsPDF, data: PDFReportData, startY: number): number {
    let y = startY;

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 35, 102);
    doc.text("Table of Contents", PAGE_WIDTH / 2, y, { align: "center" });

    y += 20;

    // Categories
    doc.setFontSize(12);
    let pageNum = 3; // Start from page 3 (after cover and TOC)

    for (const category of PA_CATEGORIES) {
        const categoryTasks = data.tasks.filter((t) => t.category === category.id);
        if (categoryTasks.length === 0) continue;

        const meta = CATEGORY_META[category.id as keyof typeof CATEGORY_META];

        doc.setTextColor(60, 60, 60);
        doc.text(`${meta.label}`, MARGIN, y);

        doc.setTextColor(150, 150, 150);
        doc.text(`${categoryTasks.length} items`, MARGIN + 100, y);
        doc.text(`Page ${pageNum}`, PAGE_WIDTH - MARGIN - 20, y);

        y += 10;
        pageNum++;
    }

    return y;
}

// ============ Category Section ==========

function addCategorySection(
    doc: jsPDF,
    categoryId: string,
    tasks: PATask[],
    startY: number
): number {
    let y = startY;
    const meta = CATEGORY_META[categoryId as keyof typeof CATEGORY_META];

    // Category header
    doc.setFontSize(16);
    doc.setTextColor(0, 35, 102);
    doc.text(meta.label, MARGIN, y);

    y += 5;

    // Underline
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, MARGIN + 80, y);

    y += 15;

    // Tasks
    for (const task of tasks) {
        // Check if we need a new page
        if (y > PAGE_HEIGHT - 60) {
            doc.addPage();
            y = MARGIN;
        }

        y = addTaskContent(doc, task, y);
        y += 10;
    }

    return y;
}

// ============ Task Content ==========

function addTaskContent(doc: jsPDF, task: PATask, startY: number): number {
    let y = startY;

    // Task header
    doc.setFontSize(11);
    doc.setTextColor(0, 35, 102);
    doc.setFont("helvetica", "bold");
    doc.text(`${task.indicatorCode} - ${task.title}`, MARGIN, y);
    doc.setFont("helvetica", "normal");

    y += 8;

    // Agreement
    if (task.agreement) {
        y = addLabeledText(doc, "Agreement:", task.agreement, y);
    }

    // Outcomes
    if (task.outcomes) {
        y = addLabeledText(doc, "Expected Outcomes:", task.outcomes, y);
    }

    // Indicators
    if (task.indicators) {
        y = addLabeledText(doc, "Indicators:", task.indicators, y);
    }

    // Actual Results
    if (task.actualResults) {
        y = addLabeledText(doc, "Actual Results:", task.actualResults, y);
    }

    // Evidence count
    const evidenceCount = (task.evidenceFiles?.length || 0) + (task.richMedia?.length || 0);
    if (evidenceCount > 0) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Evidence files: ${evidenceCount}`, MARGIN, y);
        y += 6;
    }

    return y;
}

// ============ Helper Functions ==========

function addLabeledText(doc: jsPDF, label: string, text: string, startY: number): number {
    let y = startY;

    // Label
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(label, MARGIN, y);

    y += 5;

    // Content - wrap text
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    const maxLines = 4; // Limit lines to prevent overflow

    for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
        doc.text(lines[i], MARGIN, y);
        y += 5;
    }

    if (lines.length > maxLines) {
        doc.text("...", MARGIN, y);
        y += 5;
    }

    y += 3;
    return y;
}

function addPageFooter(doc: jsPDF, pageNum: number, totalPages: number, year: string): void {
    const footerY = PAGE_HEIGHT - 10;

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);

    // Page number
    doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_WIDTH / 2, footerY, { align: "center" });

    // Year on left
    doc.text(`PA ${year}`, MARGIN, footerY);

    // Website on right
    doc.text("Digital PA Portfolio", PAGE_WIDTH - MARGIN, footerY, { align: "right" });
}

// ============ Download Helper ==========

/**
 * Download PDF file
 */
export function downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
