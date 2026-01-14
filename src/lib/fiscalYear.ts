/**
 * Fiscal Year Utilities
 * 
 * Fiscal year in Thailand runs from October 1 to September 30
 * Example: FY 2569 = October 1, 2568 - September 30, 2569
 */

/**
 * Get current fiscal year in Buddhist calendar
 * Returns the fiscal year based on current date
 * 
 * @returns {number} Current fiscal year (e.g., 2569)
 */
export function getCurrentFiscalYear(): number {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11 (0 = January)
    const currentYear = now.getFullYear();

    // Convert to Buddhist year
    const buddhistYear = currentYear + 543;

    // If month is October (9) or later, fiscal year is next year
    // If month is before October, fiscal year is current year
    if (currentMonth >= 9) { // October = month 9
        return buddhistYear + 1;
    } else {
        return buddhistYear;
    }
}

/**
 * Get fiscal year display string with date range
 * 
 * @param {number} fiscalYear - Fiscal year in Buddhist calendar (e.g., 2569)
 * @returns {string} Display string (e.g., "ปีงบประมาณ 2569 (1 ต.ค. 2568 - 30 ก.ย. 2569)")
 */
export function getFiscalYearDisplay(fiscalYear: number): string {
    const startYear = fiscalYear - 1;
    const endYear = fiscalYear;
    return `ปีงบประมาณ ${fiscalYear} (1 ต.ค. ${startYear} - 30 ก.ย. ${endYear})`;
}

/**
 * Get fiscal year from a given date
 * 
 * @param {Date} date - Date to check
 * @returns {number} Fiscal year in Buddhist calendar
 */
export function getFiscalYearFromDate(date: Date): number {
    const month = date.getMonth();
    const year = date.getFullYear();
    const buddhistYear = year + 543;

    if (month >= 9) { // October or later
        return buddhistYear + 1;
    } else {
        return buddhistYear;
    }
}

/**
 * Get start date of fiscal year
 * 
 * @param {number} fiscalYear - Fiscal year in Buddhist calendar
 * @returns {Date} Start date (October 1 of previous year)
 */
export function getFiscalYearStartDate(fiscalYear: number): Date {
    const gregorianYear = fiscalYear - 543 - 1; // Previous Gregorian year
    return new Date(gregorianYear, 9, 1); // October 1st (month 9)
}

/**
 * Get end date of fiscal year
 * 
 * @param {number} fiscalYear - Fiscal year in Buddhist calendar
 * @returns {Date} End date (September 30)
 */
export function getFiscalYearEndDate(fiscalYear: number): Date {
    const gregorianYear = fiscalYear - 543; // Current Gregorian year
    return new Date(gregorianYear, 8, 30); // September 30th (month 8)
}

/**
 * Format date to Thai Buddhist calendar
 * 
 * @param {Date} date - Date to format
 * @returns {string} Formatted date (e.g., "14 มกราคม 2569")
 */
export function formatThaiDate(date: Date): string {
    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;

    return `${day} ${month} ${year}`;
}
