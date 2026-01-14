import { getFiscalYearDisplay } from "@/lib/fiscalYear";

interface FiscalYearInfoProps {
    year: string;
    className?: string;
}

/**
 * Component to display fiscal year information with date range
 */
export default function FiscalYearInfo({ year, className = "" }: FiscalYearInfoProps) {
    const yearNum = parseInt(year);

    if (isNaN(yearNum)) {
        return <span className={className}>ปีงบประมาณ {year}</span>;
    }

    const startYear = yearNum - 1;
    const endYear = yearNum;

    return (
        <div className={className}>
            <div className="text-sm font-medium">ปีงบประมาณ {year}</div>
            <div className="text-xs text-gray-500">
                (1 ตุลาคม {startYear} - 30 กันยายน {endYear})
            </div>
        </div>
    );
}
