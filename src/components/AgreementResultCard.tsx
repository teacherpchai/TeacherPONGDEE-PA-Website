import { TaskDetail } from "@/lib/dashboardUtils";
import HtmlContent from "@/components/HtmlContent";
import { VisualizationRenderer } from "@/components/visualizations";
import { RichMediaRenderer } from "@/components/media";
import { FileText, ExternalLink, Activity } from "lucide-react";
import Link from "next/link";
import { formatIndicatorCode } from "@/lib/dashboardUtils";

interface AgreementResultCardProps {
    task: TaskDetail;
    year: string;
}

export default function AgreementResultCard({ task, year }: AgreementResultCardProps) {
    const hasEvidence = task.evidenceFiles && task.evidenceFiles.length > 0;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6 transition-all hover:shadow-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-mono bg-white/20 px-2 py-1 rounded text-sm font-bold backdrop-blur-sm">
                            {formatIndicatorCode(task.indicatorCode)}
                        </span>
                        <h3 className="font-bold text-lg leading-snug font-[family-name:var(--font-prompt)]">
                            {task.title}
                        </h3>
                    </div>
                    {/* Status Icons or Badge could go here */}
                    <div className="flex items-center gap-2">
                        {task.completeness.completenessScore >= 80 ? (
                            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-100 text-xs font-bold border border-green-500/30 backdrop-blur-sm">
                                สมบูรณ์ {task.completeness.completenessScore}%
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-100 text-xs font-bold border border-yellow-500/30 backdrop-blur-sm">
                                รอเพิ่มเติม {task.completeness.completenessScore}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Split View */}
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
                {/* Left Column: Agreement (Plan) */}
                <div className="md:w-1/2 bg-slate-50 p-6 flex flex-col gap-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <FileText className="text-blue-600" size={20} />
                        <h4 className="font-semibold text-gray-700 font-[family-name:var(--font-prompt)]">
                            ข้อตกลงในการพัฒนางาน (Agreement)
                        </h4>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">
                                1. งาน (Tasks)
                            </label>
                            <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line font-[family-name:var(--font-sarabun)]">
                                {task.agreement || "- ไม่ได้ระบุ -"}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">
                                2. ผลลัพธ์ (Outcomes)
                            </label>
                            <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line font-[family-name:var(--font-sarabun)]">
                                {task.outcomes || "- ไม่ได้ระบุ -"}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">
                                3. ตัวชี้วัด (Indicators)
                            </label>
                            <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line font-[family-name:var(--font-sarabun)]">
                                {task.indicators || "- ไม่ได้ระบุ -"}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 flex justify-end">
                        <Link
                            href={`/admin?year=${year}&category=${task.category}`}
                            className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                        >
                            <ExternalLink size={12} />
                            แก้ไขข้อตกลง
                        </Link>
                    </div>
                </div>

                {/* Right Column: Result (Actual) */}
                <div className="md:w-1/2 bg-white p-6 flex flex-col gap-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <Activity className="text-emerald-600" size={20} />
                        <h4 className="font-semibold text-gray-700 font-[family-name:var(--font-prompt)]">
                            ผลการปฏิบัติงาน (Result)
                        </h4>
                    </div>

                    <div className="space-y-6">
                        {/* Actual Results Text */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wide">
                                ผลการดำเนินงานจริง
                            </label>
                            {task.actualResults ? (
                                <div className="text-sm font-[family-name:var(--font-sarabun)]">
                                    <HtmlContent content={task.actualResults} />
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm">
                                    ยังไม่มีข้อมูลผลการดำเนินงาน
                                </div>
                            )}
                        </div>

                        {/* Visualization */}
                        {task.visualization && (
                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                <label className="block text-xs font-bold text-emerald-600 uppercase mb-3 tracking-wide">
                                    สรุปข้อมูลเชิงสถิติ (Data Visualization)
                                </label>
                                <VisualizationRenderer data={task.visualization} />
                            </div>
                        )}

                        {/* Rich Media */}
                        {task.richMedia && task.richMedia.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wide">
                                    สื่อประกอบ (Rich Media)
                                </label>
                                <RichMediaRenderer items={task.richMedia} />
                            </div>
                        )}

                        {/* Evidence Files */}
                        {hasEvidence && (
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3 tracking-wide flex items-center gap-2">
                                    หลักฐานร่องรอย (Evidence)
                                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">
                                        {task.evidenceFiles?.length || 0}
                                    </span>
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {task.evidenceFiles?.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                <FileText size={16} />
                                            </div>
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 truncate flex-1">
                                                {file.name}
                                            </span>
                                            <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-400" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
