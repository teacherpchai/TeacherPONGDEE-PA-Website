"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    LogOut,
    Calendar,
    FileText,
    Upload,
    Loader2,
    Edit3,
    Save,
    X,
    CheckCircle2,
    Circle,
    Plus,
    ClipboardList,
    BarChart3,
    Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { firebaseService } from "@/lib/firebaseService";
import {
    PATask,
    PACategory,
    PA_CATEGORIES,
    PA_INDICATORS,
    EvidenceFile,
    VisualizationData,
    RichMediaItem,
    ChallengeData,
    FiscalYear
} from "@/types";
import { extractYouTubeId } from "@/components/media";
import ChallengeForm from "@/components/ChallengeForm";
import RichTextEditor from "@/components/RichTextEditor";

type AdminMode = "agreement" | "report";

export default function AdminDashboard() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [years, setYears] = useState<FiscalYear[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [paRecords, setPaRecords] = useState<PATask[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<PACategory>("learning");
    const [adminMode, setAdminMode] = useState<AdminMode>("agreement");

    // Modal states
    const [showAddYear, setShowAddYear] = useState(false);
    const [editingIndicator, setEditingIndicator] = useState<string | null>(null);
    const [uploadingCode, setUploadingCode] = useState<string | null>(null);

    // Form states for Agreement
    const [editFormData, setEditFormData] = useState({
        agreement: "",
        outcomes: "",
        indicators: "",
    });

    // Form states for Report
    const [reportFormData, setReportFormData] = useState({
        actualResults: "",
        chartType: "none" as "bar" | "pie" | "progress" | "none",
        chartTitle: "",
        chartData: [] as { label: string; value: string }[],
        richMedia: [] as { id: string; type: "image" | "video" | "youtube"; title: string; url: string; youtubeId?: string }[],
    });

    // Form states for Challenge (structured form)
    const [challengeFormData, setChallengeFormData] = useState<ChallengeData | null>(null);

    const [newYear, setNewYear] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Check auth on mount
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        } else if (user) {
            fetchYears();
        }
    }, [user, authLoading, router]);

    // Fetch years
    const fetchYears = async () => {
        try {
            const yearsData = await firebaseService.getYears();
            setYears(yearsData);
            if (yearsData.length > 0 && !selectedYear) {
                // Prefer active year
                const active = yearsData.find(y => y.isActive);
                setSelectedYear(active ? active.year : yearsData[0].year);
            }
        } catch (error) {
            console.error("Failed to fetch years:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch PA records when year changes
    useEffect(() => {
        if (selectedYear) {
            fetchPARecords();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYear]);

    const fetchPARecords = async () => {
        if (!selectedYear) return;
        try {
            const records = await firebaseService.getPARecords(selectedYear);
            setPaRecords(records);
        } catch (error) {
            console.error("Failed to fetch PA records:", error);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            router.push("/admin/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Handle add year
    const handleAddYear = async () => {
        if (!newYear.trim()) return;
        setIsSaving(true);

        try {
            const yearId = await firebaseService.addYear(newYear, years.length === 0);
            if (yearId) {
                await fetchYears();
                setNewYear("");
                setShowAddYear(false);
            }
        } catch (error) {
            console.error("Failed to add year:", error);
            alert("Failed to add year. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Get record for indicator
    const getRecordForIndicator = (code: string) => {
        return paRecords.find(r => r.indicatorCode === code);
    };

    // Get indicators for selected category
    const indicatorsForCategory = PA_INDICATORS.filter(i => i.category === selectedCategory);

    // Start editing indicator (Agreement mode)
    const handleStartEditAgreement = (code: string) => {
        const record = getRecordForIndicator(code);
        setEditFormData({
            agreement: record?.agreement || "",
            outcomes: record?.outcomes || "",
            indicators: record?.indicators || "",
        });
        setEditingIndicator(code);
    };

    // Start editing indicator (Report mode)
    const handleStartEditReport = (code: string) => {
        const record = getRecordForIndicator(code);
        const viz = record?.visualization;
        setReportFormData({
            actualResults: record?.actualResults || "",
            chartType: viz?.chartType || "none",
            chartTitle: viz?.chartTitle || "",
            chartData: viz?.dataPoints?.map(d => ({ label: d.label, value: String(d.value) })) || [],
            richMedia: record?.richMedia?.map(m => ({
                id: m.id,
                type: m.type,
                title: m.title || "",
                url: m.url,
                youtubeId: m.youtubeId,
            })) || [],
        });
        setEditingIndicator(code);
    };

    // Save Agreement
    const handleSaveAgreement = async (code: string, title: string) => {
        setIsSaving(true);
        const existingRecord = getRecordForIndicator(code);

        try {
            if (existingRecord) {
                await firebaseService.updatePARecord(existingRecord.id, {
                    agreement: editFormData.agreement,
                    outcomes: editFormData.outcomes,
                    indicators: editFormData.indicators,
                });
            } else {
                await firebaseService.addPARecord({
                    year: selectedYear,
                    category: selectedCategory,
                    indicatorCode: code,
                    title: title,
                    agreement: editFormData.agreement,
                    outcomes: editFormData.outcomes,
                    indicators: editFormData.indicators,
                    actualResults: "",
                    evidenceFiles: [],
                });
            }

            await fetchPARecords();
            setEditingIndicator(null);
        } catch (error) {
            console.error("Failed to save agreement:", error);
            alert("Failed to save agreement.");
        } finally {
            setIsSaving(false);
        }
    };

    // Start editing Challenge (structured form)
    const handleStartEditChallenge = (code: string) => {
        const record = getRecordForIndicator(code);
        setChallengeFormData(record?.challengeData || null);
        setEditingIndicator(code);
    };

    // Save Challenge (structured form)
    const handleSaveChallenge = async (code: string, title: string, data: ChallengeData) => {
        setIsSaving(true);
        const existingRecord = getRecordForIndicator(code);

        try {
            if (existingRecord) {
                await firebaseService.updatePARecord(existingRecord.id, {
                    challengeData: data,
                });
            } else {
                await firebaseService.addPARecord({
                    year: selectedYear,
                    category: selectedCategory,
                    indicatorCode: code,
                    title: title,
                    agreement: "",
                    outcomes: "",
                    indicators: "",
                    actualResults: "",
                    evidenceFiles: [],
                    challengeData: data,
                });
            }

            await fetchPARecords();
            setEditingIndicator(null);
            setChallengeFormData(null);
        } catch (error) {
            console.error("Failed to save challenge:", error);
            alert("Failed to save challenge.");
        } finally {
            setIsSaving(false);
        }
    };

    // Build visualization data from form
    const buildVisualizationData = (): VisualizationData | undefined => {
        if (reportFormData.chartType === "none" || reportFormData.chartData.length === 0) {
            return undefined;
        }
        return {
            chartType: reportFormData.chartType,
            chartTitle: reportFormData.chartTitle || undefined,
            dataPoints: reportFormData.chartData
                .filter(d => d.label && d.value)
                .map(d => ({ label: d.label, value: parseFloat(d.value) || 0 })),
        };
    };

    // Add chart data entry
    const addChartDataEntry = () => {
        setReportFormData(prev => ({
            ...prev,
            chartData: [...prev.chartData, { label: "", value: "" }],
        }));
    };

    // Remove chart data entry
    const removeChartDataEntry = (index: number) => {
        setReportFormData(prev => ({
            ...prev,
            chartData: prev.chartData.filter((_, i) => i !== index),
        }));
    };

    // Update chart data entry
    const updateChartDataEntry = (index: number, field: "label" | "value", val: string) => {
        setReportFormData(prev => ({
            ...prev,
            chartData: prev.chartData.map((d, i) => i === index ? { ...d, [field]: val } : d),
        }));
    };

    // Add rich media item
    const addRichMediaItem = (type: "image" | "video" | "youtube") => {
        const newItem = {
            id: Date.now().toString(),
            type,
            title: "",
            url: "",
            youtubeId: undefined as string | undefined,
        };
        setReportFormData(prev => ({
            ...prev,
            richMedia: [...prev.richMedia, newItem],
        }));
    };

    // Remove rich media item
    const removeRichMediaItem = (id: string) => {
        setReportFormData(prev => ({
            ...prev,
            richMedia: prev.richMedia.filter(m => m.id !== id),
        }));
    };

    // Update rich media item
    const updateRichMediaItem = (id: string, field: string, value: string) => {
        setReportFormData(prev => ({
            ...prev,
            richMedia: prev.richMedia.map(m => {
                if (m.id !== id) return m;
                if (field === "url" && m.type === "youtube") {
                    const ytId = extractYouTubeId(value);
                    return { ...m, url: value, youtubeId: ytId || undefined };
                }
                return { ...m, [field]: value };
            }),
        }));
    };

    // Build rich media data from form
    const buildRichMediaData = (): RichMediaItem[] | undefined => {
        const validItems = reportFormData.richMedia.filter(m => m.url);
        if (validItems.length === 0) return undefined;
        return validItems.map((m, index) => ({
            id: m.id,
            type: m.type,
            title: m.title || undefined,
            url: m.url,
            youtubeId: m.youtubeId,
            order: index,
        }));
    };

    // Save Report
    const handleSaveReport = async (code: string, title: string) => {
        setIsSaving(true);
        const existingRecord = getRecordForIndicator(code);
        const vizData = buildVisualizationData();
        const richMediaData = buildRichMediaData();

        try {
            if (existingRecord) {
                await firebaseService.updatePARecord(existingRecord.id, {
                    actualResults: reportFormData.actualResults,
                    visualization: vizData,
                    richMedia: richMediaData,
                });
            } else {
                await firebaseService.addPARecord({
                    year: selectedYear,
                    category: selectedCategory,
                    indicatorCode: code,
                    title: title,
                    agreement: "",
                    outcomes: "",
                    indicators: "",
                    actualResults: reportFormData.actualResults,
                    evidenceFiles: [],
                    visualization: vizData,
                    richMedia: richMediaData,
                });
            }

            await fetchPARecords();
            setEditingIndicator(null);
        } catch (error) {
            console.error("Failed to save report:", error);
            alert("Failed to save report.");
        } finally {
            setIsSaving(false);
        }
    };

    // Handle file upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, code: string, title: string) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploadingCode(code);

        try {
            let record = getRecordForIndicator(code);

            if (!record) {
                // Determine category if not explicitly needed (optional, just safety)
                // Actually we already have selectedCategory and code.
                const newId = await firebaseService.addPARecord({
                    year: selectedYear,
                    category: selectedCategory,
                    indicatorCode: code,
                    title: title,
                    agreement: "",
                    outcomes: "",
                    indicators: "",
                    actualResults: "",
                    evidenceFiles: [],
                });

                if (newId) {
                    await fetchPARecords(); // Refresh to get the new record
                    // Since React state update depends on await, we fetch again here
                    // But we can't easily rely on 'record' variable being updated in same closure
                    // So we refetch and find
                    // To be safe, we have to fetch again.
                    const updatedRecords = await firebaseService.getPARecords(selectedYear);
                    record = updatedRecords.find(r => r.indicatorCode === code);
                    setPaRecords(updatedRecords); // Should be consistent
                }
            }

            if (!record) {
                // If still no record (creation failed), abort
                setUploadingCode(null);
                return;
            }

            // At this point we have a record ID
            const uploadedFiles: EvidenceFile[] = [...(record.evidenceFiles || [])];

            for (const file of Array.from(files)) {
                const evidenceFile = await firebaseService.uploadEvidenceFile(file, selectedYear, record.id);
                if (evidenceFile) {
                    uploadedFiles.push(evidenceFile);
                }
            }

            await firebaseService.updatePARecord(record.id, { evidenceFiles: uploadedFiles });
            await fetchPARecords();

        } catch (error) {
            console.error("Failed to upload file:", error);
            alert("Upload failed.");
        } finally {
            setUploadingCode(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // Stats for category
    const getCategoryStats = (category: PACategory, mode: AdminMode) => {
        const indicators = PA_INDICATORS.filter(i => i.category === category);
        const filledCount = indicators.filter(i => {
            const record = getRecordForIndicator(i.code);
            if (mode === "agreement") {
                // Challenge category uses challengeData, others use agreement
                if (category === "challenge") {
                    return !!record?.challengeData?.titleTH;
                }
                return !!record?.agreement;
            }
            return !!record?.actualResults;
        }).length;
        return { total: indicators.length, filled: filledCount };
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background-secondary)" }}>
                <Loader2 size={40} className="animate-spin" style={{ color: "var(--royal-blue)" }} />
            </div>
        );
    }

    return (
        <main className="min-h-screen" style={{ backgroundColor: "var(--background-secondary)" }}>
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold font-[family-name:var(--font-prompt)]" style={{ color: "var(--gold)" }}>
                                Kru.P
                            </span>
                            <span className="text-sm font-medium font-[family-name:var(--font-sarabun)]" style={{ color: "var(--royal-blue)" }}>
                                Admin Panel
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href="/admin/settings"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 font-[family-name:var(--font-sarabun)]"
                                style={{ color: "var(--royal-blue)" }}
                            >
                                <Settings size={18} />
                                ตั้งค่า
                            </a>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 font-[family-name:var(--font-sarabun)]"
                                style={{ color: "var(--royal-blue)" }}
                            >
                                <LogOut size={18} />
                                ออกจากระบบ
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Year Management Section */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold font-[family-name:var(--font-prompt)]" style={{ color: "var(--royal-blue)" }}>
                            <Calendar size={20} className="inline mr-2" />
                            ปีงบประมาณ
                        </h2>
                        <button
                            onClick={() => setShowAddYear(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all btn-gold font-[family-name:var(--font-sarabun)]"
                        >
                            <Plus size={18} />
                            เพิ่มปีใหม่
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {years.length === 0 ? (
                            <p className="text-sm font-[family-name:var(--font-sarabun)]" style={{ color: "var(--foreground-muted)" }}>
                                ยังไม่มีข้อมูลปีงบประมาณ กรุณาเพิ่มปีใหม่
                            </p>
                        ) : (
                            years.map((year) => (
                                <button
                                    key={year.year}
                                    onClick={() => setSelectedYear(year.year)}
                                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all font-[family-name:var(--font-sarabun)] ${selectedYear === year.year ? "btn-royal" : "bg-white hover:bg-gray-50 border"
                                        }`}
                                    style={selectedYear !== year.year ? { borderColor: "var(--background-secondary)", color: "var(--royal-blue)" } : {}}
                                >
                                    ปี {year.year}
                                    {year.isActive && <span className="ml-2 text-xs">● Active</span>}
                                </button>
                            ))
                        )}
                    </div>
                </section>

                {/* Main Admin Mode Toggle */}
                {selectedYear && (
                    <section className="mb-6">
                        <div className="flex gap-2 bg-white rounded-xl p-2 shadow-sm">
                            <button
                                onClick={() => setAdminMode("agreement")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all font-[family-name:var(--font-sarabun)] ${adminMode === "agreement"
                                    ? "bg-[var(--royal-blue)] text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <ClipboardList size={18} />
                                ข้อตกลง PA
                            </button>
                            <button
                                onClick={() => setAdminMode("report")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all font-[family-name:var(--font-sarabun)] ${adminMode === "report"
                                    ? "bg-[var(--gold)] text-[var(--royal-blue-dark)]"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <BarChart3 size={18} />
                                รายงานผลการปฏิบัติงาน
                            </button>
                        </div>
                    </section>
                )}

                {/* PA Records Management */}
                {selectedYear && (
                    <section className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold font-[family-name:var(--font-prompt)]" style={{ color: adminMode === "agreement" ? "var(--royal-blue)" : "var(--gold)" }}>
                                <FileText size={20} className="inline mr-2" />
                                {adminMode === "agreement" ? "ข้อตกลง PA" : "รายงานผลการปฏิบัติงาน"} - ปี {selectedYear}
                            </h2>
                        </div>

                        {/* Category Tabs with Stats */}
                        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
                            {PA_CATEGORIES.map((cat) => {
                                const stats = getCategoryStats(cat.id, adminMode);
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all font-[family-name:var(--font-sarabun)] flex items-center gap-2 ${selectedCategory === cat.id
                                            ? adminMode === "agreement"
                                                ? "bg-[var(--royal-blue)] text-white"
                                                : "bg-[var(--gold)] text-[var(--royal-blue-dark)]"
                                            : "bg-gray-100 hover:bg-gray-200"
                                            }`}
                                        style={selectedCategory !== cat.id ? { color: "var(--foreground)" } : {}}
                                    >
                                        {cat.labelTh}
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCategory === cat.id ? "bg-white/20" : "bg-gray-200"
                                            }`}>
                                            {stats.filled}/{stats.total}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Indicators List */}
                        <div className="space-y-3">
                            {indicatorsForCategory.map((indicator) => {
                                const record = getRecordForIndicator(indicator.code);
                                const hasAgreement = !!record?.agreement;
                                const hasReport = !!record?.actualResults;
                                const hasData = adminMode === "agreement" ? hasAgreement : hasReport;
                                const isEditing = editingIndicator === indicator.code;

                                return (
                                    <div
                                        key={indicator.code}
                                        className="border rounded-xl p-4 transition-all"
                                        style={{
                                            borderColor: hasData ? (adminMode === "agreement" ? "var(--royal-blue)" : "var(--gold)") : "var(--background-secondary)",
                                            backgroundColor: isEditing ? "var(--background-secondary)" : "white"
                                        }}
                                    >
                                        {isEditing ? (
                                            // Edit Mode
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-1 rounded text-sm font-semibold" style={{ backgroundColor: adminMode === "agreement" ? "var(--royal-blue)" : "var(--gold)", color: adminMode === "agreement" ? "white" : "var(--royal-blue-dark)" }}>
                                                        {indicator.code}
                                                    </span>
                                                    <h3 className="font-medium font-[family-name:var(--font-sarabun)]">
                                                        {indicator.title}
                                                    </h3>
                                                </div>

                                                {adminMode === "agreement" ? (
                                                    // Agreement Form - differentiate between challenge and other categories
                                                    selectedCategory === "challenge" ? (
                                                        // Challenge uses ChallengeForm
                                                        <ChallengeForm
                                                            challengeNumber={indicator.code === "challenge-1" ? 1 : 2}
                                                            initialData={challengeFormData || undefined}
                                                            onSave={async (data) => {
                                                                await handleSaveChallenge(indicator.code, indicator.title, data);
                                                            }}
                                                            onCancel={() => setEditingIndicator(null)}
                                                            isSaving={isSaving}
                                                        />
                                                    ) : (
                                                        // Other categories use standard form
                                                        <>
                                                            <div>
                                                                <label className="text-sm font-medium mb-2 block" style={{ color: "var(--foreground-muted)" }}>
                                                                    ข้อตกลง PA (สิ่งที่จะทำ)
                                                                </label>
                                                                <RichTextEditor
                                                                    value={editFormData.agreement}
                                                                    onChange={(html) => setEditFormData({ ...editFormData, agreement: html })}
                                                                    placeholder="ระบุข้อตกลงในการพัฒนางาน..."
                                                                    minHeight="100px"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium mb-2 block" style={{ color: "var(--foreground-muted)" }}>
                                                                    ผลลัพธ์ที่คาดหวัง
                                                                </label>
                                                                <RichTextEditor
                                                                    value={editFormData.outcomes}
                                                                    onChange={(html) => setEditFormData({ ...editFormData, outcomes: html })}
                                                                    placeholder="ระบุผลลัพธ์ที่คาดหวังให้เกิดขึ้นกับผู้เรียน..."
                                                                    minHeight="80px"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium mb-2 block" style={{ color: "var(--foreground-muted)" }}>
                                                                    ตัวชี้วัดความสำเร็จ
                                                                </label>
                                                                <RichTextEditor
                                                                    value={editFormData.indicators}
                                                                    onChange={(html) => setEditFormData({ ...editFormData, indicators: html })}
                                                                    placeholder="ระบุตัวชี้วัดที่แสดงถึงการเปลี่ยนแปลง..."
                                                                    minHeight="80px"
                                                                />
                                                            </div>
                                                        </>
                                                    )
                                                ) : (
                                                    // Report Form
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--foreground-muted)" }}>
                                                                ผลการปฏิบัติงานจริง
                                                            </label>
                                                            <RichTextEditor
                                                                value={reportFormData.actualResults}
                                                                onChange={(html) => setReportFormData(prev => ({ ...prev, actualResults: html }))}
                                                                placeholder="ระบุผลการดำเนินงานตามข้อตกลง..."
                                                                minHeight="150px"
                                                            />
                                                        </div>

                                                        {record?.agreement && (
                                                            <div className="p-3 rounded-lg bg-blue-50 text-sm">
                                                                <strong className="text-blue-700">ข้อตกลงที่ระบุไว้:</strong>
                                                                <p className="text-blue-600 mt-1">{record.agreement}</p>
                                                            </div>
                                                        )}

                                                        {/* Chart Configuration */}
                                                        <div className="border-t pt-4">
                                                            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--royal-blue)" }}>
                                                                📊 Data Visualization (ไม่จำเป็น)
                                                            </h4>

                                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                                <div>
                                                                    <label className="text-xs text-gray-500 block mb-1">ประเภท Chart</label>
                                                                    <select
                                                                        value={reportFormData.chartType}
                                                                        onChange={(e) => setReportFormData(prev => ({ ...prev, chartType: e.target.value as "bar" | "pie" | "progress" | "none" }))}
                                                                        className="w-full px-3 py-2 rounded-lg border text-sm"
                                                                    >
                                                                        <option value="none">ไม่แสดง Chart</option>
                                                                        <option value="progress">Progress Bars</option>
                                                                        <option value="bar">Bar Chart</option>
                                                                        <option value="pie">Pie Chart</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs text-gray-500 block mb-1">หัวข้อ Chart</label>
                                                                    <input
                                                                        type="text"
                                                                        value={reportFormData.chartTitle}
                                                                        onChange={(e) => setReportFormData(prev => ({ ...prev, chartTitle: e.target.value }))}
                                                                        placeholder="เช่น ผลสัมฤทธิ์ทางการเรียน"
                                                                        className="w-full px-3 py-2 rounded-lg border text-sm"
                                                                        disabled={reportFormData.chartType === "none"}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {reportFormData.chartType !== "none" && (
                                                                <div className="space-y-2">
                                                                    <label className="text-xs text-gray-500 block">ข้อมูล (Label + ค่า)</label>
                                                                    {reportFormData.chartData.map((entry, index) => (
                                                                        <div key={index} className="flex gap-2">
                                                                            <input
                                                                                type="text"
                                                                                value={entry.label}
                                                                                onChange={(e) => updateChartDataEntry(index, "label", e.target.value)}
                                                                                placeholder="Label เช่น O-NET คณิต"
                                                                                className="flex-1 px-3 py-2 rounded-lg border text-sm"
                                                                            />
                                                                            <input
                                                                                type="number"
                                                                                value={entry.value}
                                                                                onChange={(e) => updateChartDataEntry(index, "value", e.target.value)}
                                                                                placeholder="ค่า"
                                                                                className="w-24 px-3 py-2 rounded-lg border text-sm"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeChartDataEntry(index)}
                                                                                className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                    <button
                                                                        type="button"
                                                                        onClick={addChartDataEntry}
                                                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                                    >
                                                                        + เพิ่มข้อมูล
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Rich Media Section */}
                                                        <div className="border-t pt-4">
                                                            <h4 className="text-sm font-semibold mb-3 text-[var(--royal-blue)]">
                                                                🖼️ สื่อประกอบ (ไม่จำเป็น)
                                                            </h4>

                                                            <div className="flex gap-2 mb-3 flex-wrap">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addRichMediaItem("image")}
                                                                    className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                                                >
                                                                    + รูปภาพ
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addRichMediaItem("youtube")}
                                                                    className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                                                >
                                                                    + YouTube
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addRichMediaItem("video")}
                                                                    className="text-xs px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                                                                >
                                                                    + วิดีโอ
                                                                </button>
                                                            </div>

                                                            {reportFormData.richMedia.length > 0 && (
                                                                <div className="space-y-3">
                                                                    {reportFormData.richMedia.map((item) => (
                                                                        <div key={item.id} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                                                                            <span className="text-lg">
                                                                                {item.type === "image" ? "🖼️" : item.type === "youtube" ? "▶️" : "🎬"}
                                                                            </span>
                                                                            <div className="flex-1 space-y-2">
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.title}
                                                                                    onChange={(e) => updateRichMediaItem(item.id, "title", e.target.value)}
                                                                                    placeholder="หัวข้อ (ไม่จำเป็น)"
                                                                                    className="w-full px-3 py-1.5 rounded border text-sm"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.url}
                                                                                    onChange={(e) => updateRichMediaItem(item.id, "url", e.target.value)}
                                                                                    placeholder={
                                                                                        item.type === "youtube"
                                                                                            ? "YouTube URL เช่น https://youtu.be/..."
                                                                                            : "URL ของไฟล์"
                                                                                    }
                                                                                    className="w-full px-3 py-1.5 rounded border text-sm"
                                                                                />
                                                                                {item.type === "youtube" && item.youtubeId && (
                                                                                    <p className="text-xs text-green-600">✓ YouTube ID: {item.youtubeId}</p>
                                                                                )}
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeRichMediaItem(item.id)}
                                                                                className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                                                                                title="ลบ"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => adminMode === "agreement"
                                                            ? handleSaveAgreement(indicator.code, indicator.title)
                                                            : handleSaveReport(indicator.code, indicator.title)
                                                        }
                                                        disabled={isSaving}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium btn-royal disabled:opacity-50"
                                                    >
                                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                        บันทึก
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingIndicator(null)}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200"
                                                    >
                                                        <X size={16} />
                                                        ยกเลิก
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {hasData ? (
                                                        <CheckCircle2 size={20} style={{ color: adminMode === "agreement" ? "var(--royal-blue)" : "var(--gold)" }} />
                                                    ) : (
                                                        <Circle size={20} style={{ color: "var(--foreground-muted)" }} />
                                                    )}
                                                    <span
                                                        className="px-2 py-1 rounded text-sm font-semibold font-[family-name:var(--font-prompt)]"
                                                        style={{ backgroundColor: "var(--background-secondary)", color: "var(--royal-blue)" }}
                                                    >
                                                        {indicator.code}
                                                    </span>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium font-[family-name:var(--font-sarabun)]" style={{ color: "var(--foreground)" }}>
                                                            {indicator.title}
                                                        </h3>
                                                        {adminMode === "agreement" && record?.agreement && (
                                                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                                                                {record.agreement}
                                                            </p>
                                                        )}
                                                        {adminMode === "report" && record?.actualResults && (
                                                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                                                                {record.actualResults}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0 ml-4">
                                                    {adminMode === "report" && (
                                                        <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 cursor-pointer hover:bg-green-200 transition-colors">
                                                            {uploadingCode === indicator.code ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <Upload size={14} />
                                                            )}
                                                            {record?.evidenceFiles?.length || 0} ไฟล์
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                multiple
                                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4"
                                                                className="hidden"
                                                                onChange={(e) => handleFileUpload(e, indicator.code, indicator.title)}
                                                            />
                                                        </label>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            if (adminMode === "agreement") {
                                                                if (selectedCategory === "challenge") {
                                                                    handleStartEditChallenge(indicator.code);
                                                                } else {
                                                                    handleStartEditAgreement(indicator.code);
                                                                }
                                                            } else {
                                                                handleStartEditReport(indicator.code);
                                                            }
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                                    >
                                                        <Edit3 size={14} />
                                                        แก้ไข
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>

            {/* Add Year Modal */}
            {showAddYear && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 font-[family-name:var(--font-prompt)]" style={{ color: "var(--royal-blue)" }}>
                            เพิ่มปีงบประมาณใหม่
                        </h3>
                        <input
                            type="text"
                            value={newYear}
                            onChange={(e) => setNewYear(e.target.value)}
                            placeholder="เช่น 2569"
                            className="w-full px-4 py-3 rounded-xl border-2 mb-4 font-[family-name:var(--font-sarabun)]"
                            style={{ borderColor: "var(--background-secondary)" }}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddYear}
                                disabled={isSaving || !newYear.trim()}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium btn-royal disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                เพิ่ม
                            </button>
                            <button
                                onClick={() => setShowAddYear(false)}
                                className="flex-1 py-3 rounded-xl font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
