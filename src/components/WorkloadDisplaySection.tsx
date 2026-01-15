"use client";

import { BookOpen, Users, TrendingUp, Target, CalendarDays } from "lucide-react";
import { StructuredSemesterWorkload, TeachingSubject, OtherWorkItem, HOURS_PER_PERIOD } from "@/types";

interface WorkloadDisplaySectionProps {
    semesterNumber: 1 | 2;
    workload: StructuredSemesterWorkload;
}

// Calculate total teaching hours
const calculateTeachingHours = (subjects: TeachingSubject[]): number => {
    const totalPeriods = subjects.reduce((sum, s) => sum + (s.periodsPerWeek || 0), 0);
    return totalPeriods * HOURS_PER_PERIOD;
};

// Calculate total work hours
const calculateWorkHours = (items: OtherWorkItem[]): number => {
    return items.reduce((sum, item) => sum + (item.hoursPerWeek || 0), 0);
};

export default function WorkloadDisplaySection({ semesterNumber, workload }: WorkloadDisplaySectionProps) {
    const isCurrent = semesterNumber === 2; // Assuming 2 is current for now
    const headerBg = isCurrent ? "bg-gradient-to-r from-blue-600 to-indigo-700" : "bg-gray-100";
    const headerText = isCurrent ? "text-white" : "text-gray-700";

    // Totals
    const totalPeriods = workload.teachingSubjects.reduce((s, t) => s + (t.periodsPerWeek || 0), 0);
    const teachingHours = calculateTeachingHours(workload.teachingSubjects);
    const supportHours = calculateWorkHours(workload.supportWork);
    const devHours = calculateWorkHours(workload.developmentWork);
    const policyHours = calculateWorkHours(workload.policyWork);
    const totalHours = teachingHours + supportHours + devHours + policyHours;

    return (
        <div className={`rounded-2xl overflow-hidden shadow-lg mb-10 bg-white ring-1 ring-black/5`}>
            {/* Header */}
            <div className={`${headerBg} px-6 py-5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isCurrent ? "bg-white/20" : "bg-white shadow-sm"}`}>
                        <CalendarDays className={isCurrent ? "text-white" : "text-gray-600"} size={22} />
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold font-[family-name:var(--font-prompt)] ${headerText}`}>
                            {workload.semesterLabel || `ภาคเรียนที่ ${semesterNumber}`}
                        </h3>
                        <p className={`text-sm ${isCurrent ? "text-blue-100" : "text-gray-500"}`}>
                            ปีการศึกษา {workload.semesterLabel?.split("/")[1] || "25xx"}
                        </p>
                    </div>
                </div>
                <div className={`text-sm font-medium px-4 py-2 rounded-full shadow-sm backdrop-blur-sm ${isCurrent ? "bg-white/90 text-blue-900" : "bg-white text-gray-700"}`}>
                    รวม {totalHours.toFixed(2)} ชม./สัปดาห์
                </div>
            </div>

            <div className="p-8 space-y-10">
                {/* 1.1 ตารางสอน */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <BookOpen size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 font-[family-name:var(--font-prompt)]">
                            ชั่วโมงตามตารางสอน
                        </h4>
                    </div>

                    {workload.teachingSubjects.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-[family-name:var(--font-prompt)]">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-semibold">รหัสวิชา</th>
                                        <th scope="col" className="px-6 py-4 font-semibold">ชื่อรายวิชา</th>
                                        <th scope="col" className="px-6 py-4 font-semibold text-center">ระดับชั้น</th>
                                        <th scope="col" className="px-6 py-4 font-semibold text-center">คาบ/สัปดาห์</th>
                                        <th scope="col" className="px-6 py-4 font-semibold text-right">คิดเป็น ชม.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {workload.teachingSubjects.map((subject, idx) => (
                                        <tr key={idx} className="bg-white hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-blue-900 font-mono">{subject.subjectCode}</td>
                                            <td className="px-6 py-4 text-gray-700 font-medium">{subject.subjectName}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${subject.level?.includes("ม.ต้น") || subject.level?.match(/ม\.[1-3]/)
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-blue-100 text-blue-800"}`}>
                                                    {subject.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-600">{subject.periodsPerWeek}</td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                {(subject.periodsPerWeek * HOURS_PER_PERIOD).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-800">
                                        <td colSpan={3} className="px-6 py-3 text-right text-xs uppercase tracking-wider text-slate-500">รวมทั้งหมด</td>
                                        <td className="px-6 py-3 text-center">{totalPeriods}</td>
                                        <td className="px-6 py-3 text-right text-blue-700">{teachingHours.toFixed(2)} ชม.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-400 italic">ยังไม่มีข้อมูลรายวิชา</p>
                        </div>
                    )}
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* 1.2 งานส่งเสริม */}
                    <WorkListDisplay
                        title="งานส่งเสริมและสนับสนุนการจัดการเรียนรู้"
                        icon={<Users size={20} />}
                        colorClass="text-emerald-700"
                        iconBgClass="bg-emerald-50"
                        items={workload.supportWork}
                    />

                    {/* 1.3 งานพัฒนาคุณภาพ */}
                    <WorkListDisplay
                        title="งานพัฒนาคุณภาพการจัดการศึกษา"
                        icon={<TrendingUp size={20} />}
                        colorClass="text-purple-700"
                        iconBgClass="bg-purple-50"
                        items={workload.developmentWork}
                    />

                    {/* 1.4 งานนโยบาย */}
                    <WorkListDisplay
                        title="งานตอบสนองนโยบายและจุดเน้น"
                        icon={<Target size={20} />}
                        colorClass="text-orange-700"
                        iconBgClass="bg-orange-50"
                        items={workload.policyWork}
                    />
                </div>
            </div>
        </div>
    );
}

function WorkListDisplay({
    title,
    icon,
    colorClass,
    iconBgClass,
    items
}: {
    title: string;
    icon: React.ReactNode;
    colorClass: string;
    iconBgClass: string;
    items: OtherWorkItem[]
}) {
    const total = calculateWorkHours(items);

    return (
        <section className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgClass} ${colorClass}`}>
                        {icon}
                    </div>
                    <h4 className={`text-md font-bold font-[family-name:var(--font-prompt)] ${colorClass}`}>
                        {title}
                    </h4>
                </div>
            </div>

            {items.length > 0 ? (
                <ul className="space-y-3">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex items-start justify-between text-sm group bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <span className="text-gray-700 leading-relaxed pr-4">
                                {item.description}
                            </span>
                            <span className="font-bold text-gray-900 whitespace-nowrap bg-gray-50 px-2 py-1 rounded text-xs">
                                {item.hoursPerWeek} ชม.
                            </span>
                        </li>
                    ))}
                    <li className="pt-2 flex justify-end">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-200/50 px-3 py-1 rounded-full">
                            รวม {total.toFixed(2)} ชม./สัปดาห์
                        </span>
                    </li>
                </ul>
            ) : (
                <p className="text-gray-400 italic text-sm text-center py-4">- ไม่มีข้อมูล -</p>
            )}
        </section>
    );
}
