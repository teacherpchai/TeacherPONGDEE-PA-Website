// ========================================
// Dashboard Utility Functions
// Kru Pongdee Digital PA Portfolio
// ========================================

import { PATask, PACategory, PA_CATEGORIES } from "@/types";

// ============ Types ============

export interface PACompleteness {
    hasAgreement: boolean;
    hasOutcomes: boolean;
    hasIndicators: boolean;
    hasActualResults: boolean;
    hasEvidence: boolean;
    completenessScore: number; // 0-100
}

export interface CategoryStats {
    category: PACategory;
    labelTh: string;
    icon: string;
    totalTasks: number;
    completedFields: number;
    totalFields: number;
    completenessPercent: number;
}

export interface DashboardStats {
    totalTasks: number;
    overallCompleteness: number;
    totalEvidence: number;
    totalRichMedia: number;
    categoryStats: CategoryStats[];
    taskDetails: TaskDetail[];
}

export interface TaskDetail {
    id: string;
    indicatorCode: string;
    title: string;
    category: PACategory;
    completeness: PACompleteness;
}

// ============ Utility Functions ============

/**
 * Calculate completeness for a single PA Task
 */
export function calculateTaskCompleteness(task: PATask): PACompleteness {
    const hasAgreement = Boolean(task.agreement && task.agreement.trim().length > 0);
    const hasOutcomes = Boolean(task.outcomes && task.outcomes.trim().length > 0);
    const hasIndicators = Boolean(task.indicators && task.indicators.trim().length > 0);
    const hasActualResults = Boolean(task.actualResults && task.actualResults.trim().length > 0);
    const hasEvidence = Boolean(task.evidenceFiles && task.evidenceFiles.length > 0) ||
        Boolean(task.richMedia && task.richMedia.length > 0);

    // Calculate score (each field = 20%)
    let score = 0;
    if (hasAgreement) score += 20;
    if (hasOutcomes) score += 20;
    if (hasIndicators) score += 20;
    if (hasActualResults) score += 20;
    if (hasEvidence) score += 20;

    return {
        hasAgreement,
        hasOutcomes,
        hasIndicators,
        hasActualResults,
        hasEvidence,
        completenessScore: score,
    };
}

/**
 * Count total evidence files across all tasks
 */
export function countEvidenceFiles(tasks: PATask[]): number {
    return tasks.reduce((total, task) => {
        const evidenceCount = task.evidenceFiles?.length || 0;
        return total + evidenceCount;
    }, 0);
}

/**
 * Count total rich media items across all tasks
 */
export function countRichMedia(tasks: PATask[]): number {
    return tasks.reduce((total, task) => {
        const richMediaCount = task.richMedia?.length || 0;
        return total + richMediaCount;
    }, 0);
}

/**
 * Get statistics for each category
 */
export function getCategoryStats(tasks: PATask[]): CategoryStats[] {
    return PA_CATEGORIES.map((cat) => {
        const categoryTasks = tasks.filter((t) => t.category === cat.id);
        const totalTasks = categoryTasks.length;

        // Count completed fields (5 fields per task)
        let completedFields = 0;
        const totalFields = totalTasks * 5;

        categoryTasks.forEach((task) => {
            const comp = calculateTaskCompleteness(task);
            if (comp.hasAgreement) completedFields++;
            if (comp.hasOutcomes) completedFields++;
            if (comp.hasIndicators) completedFields++;
            if (comp.hasActualResults) completedFields++;
            if (comp.hasEvidence) completedFields++;
        });

        const completenessPercent = totalFields > 0
            ? Math.round((completedFields / totalFields) * 100)
            : 0;

        return {
            category: cat.id,
            labelTh: cat.labelTh,
            icon: cat.icon,
            totalTasks,
            completedFields,
            totalFields,
            completenessPercent,
        };
    });
}

/**
 * Get detailed task information with completeness
 */
export function getTaskDetails(tasks: PATask[]): TaskDetail[] {
    return tasks.map((task) => ({
        id: task.id,
        indicatorCode: task.indicatorCode,
        title: task.title,
        category: task.category,
        completeness: calculateTaskCompleteness(task),
    }));
}

/**
 * Calculate overall dashboard statistics
 */
export function calculateDashboardStats(tasks: PATask[]): DashboardStats {
    const sortedTasks = sortPATasks(tasks);
    const totalTasks = sortedTasks.length;
    const totalEvidence = countEvidenceFiles(sortedTasks);
    const totalRichMedia = countRichMedia(sortedTasks);
    const categoryStats = getCategoryStats(sortedTasks);
    const taskDetails = getTaskDetails(sortedTasks);

    // Calculate overall completeness (average of all tasks)
    const overallCompleteness = totalTasks > 0
        ? Math.round(
            taskDetails.reduce((sum, t) => sum + t.completeness.completenessScore, 0) / totalTasks
        )
        : 0;

    return {
        totalTasks,
        overallCompleteness,
        totalEvidence,
        totalRichMedia,
        categoryStats,
        taskDetails,
    };
}

/**
 * Convert old indicator codes (2.1.x, 2.2.x, 2.3.x) to new format (1.x, 2.x, 3.x)
 */
export function formatIndicatorCode(code: string): string {
    if (!code) return "";
    // Learning: 2.1.x -> 1.x
    if (code.startsWith("2.1.")) return "1." + code.substring(4);
    // Support: 2.2.x -> 2.x
    if (code.startsWith("2.2.")) return "2." + code.substring(4);
    // Development: 2.3.x -> 3.x
    if (code.startsWith("2.3.")) return "3." + code.substring(4);

    return code;
}

/**
 * Sort PA Tasks:
 * 1. Standard indicators (1.1 - 3.3) sorted numerically
 * 2. Challenges (challenge-1, challenge-2) sorted by ID
 */
export function sortPATasks(tasks: PATask[]): PATask[] {
    return [...tasks].sort((a, b) => {
        // Get formatted codes for comparison
        const codeA = formatIndicatorCode(a.indicatorCode);
        const codeB = formatIndicatorCode(b.indicatorCode);

        // Check if items are challenges
        const isChallengeA = codeA.toLowerCase().includes("challenge");
        const isChallengeB = codeB.toLowerCase().includes("challenge");

        // If one is challenge and other is not, challenge goes last
        if (isChallengeA && !isChallengeB) return 1;
        if (!isChallengeA && isChallengeB) return -1;

        // If both are challenges, sort by the number in the ID
        if (isChallengeA && isChallengeB) {
            // Extract number from challenge string
            const numA = parseInt(codeA.replace(/\D/g, "")) || 0;
            const numB = parseInt(codeB.replace(/\D/g, "")) || 0;
            return numA - numB;
        }

        // Standard sorting for numeric codes (1.1, 1.2, ..., 3.3)
        // Split by dot to compare major and minor versions
        const partsA = codeA.split(".").map(Number);
        const partsB = codeB.split(".").map(Number);

        // Compare major version
        if (partsA[0] !== partsB[0]) {
            return (partsA[0] || 0) - (partsB[0] || 0);
        }

        // Compare minor version
        return (partsA[1] || 0) - (partsB[1] || 0);
    });
}

/**
 * Get category icon emoji
 */
export function getCategoryEmoji(category: PACategory): string {
    const emojiMap: Record<PACategory, string> = {
        learning: "📚",
        support: "🤝",
        self_dev: "📈",
        challenge: "🎯",
    };
    return emojiMap[category] || "📋";
}
