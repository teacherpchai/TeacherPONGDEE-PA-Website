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
import HtmlContent from "@/components/HtmlContent";

export default function AdminDashboard() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [years, setYears] = useState<FiscalYear[]>([]);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [paRecords, setPaRecords] = useState<PATask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<PACategory>("learning");

    // Upload state
    const [uploadingCode, setUploadingCode] = useState<string | null>(null);

    // Edit state
    const [editingIndicator, setEditingIndicator] = useState<string | null>(null);

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
        chartDescription: "",
        chartData: [] as { label: string; value: string }[],
        richMedia: [] as { id: string; type: "image" | "video" | "youtube"; title: string; description: string; url: string; youtubeId?: string }[],
    });

    // Form states for Challenge (structured form)
    const [challengeFormData, setChallengeFormData] = useState<ChallengeData | null>(null);

    const [newYear, setNewYear] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showAddYear, setShowAddYear] = useState(false);

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

    // --- Unified Handlers ---

    // Start editing indicator (Loads all data: Agreement + Report + Challenge)
    const handleStartEdit = (code: string) => {
        const record = getRecordForIndicator(code);

        // Load Agreement Data
        setEditFormData({
            agreement: record?.agreement || "",
            outcomes: record?.outcomes || "",
            indicators: record?.indicators || "",
        });

        // Load Challenge Data (if applicable)
        setChallengeFormData(record?.challengeData || null);

        // Load Report Data
        let chartData: { label: string; value: string }[] = [];
        if (record?.visualization?.dataPoints) {
            chartData = record.visualization.dataPoints.map(d => ({
                label: d.label,
                value: d.value.toString()
            }));
        }

        let richMedia: any[] = [];
        if (record?.richMedia) {
            richMedia = record.richMedia.map(m => ({
                ...m,
                id: m.id || Date.now().toString() + Math.random().toString()
            }));
        }

        setReportFormData({
            actualResults: record?.actualResults || "",
            chartType: record?.visualization?.chartType || "none",
            chartTitle: record?.visualization?.chartTitle || "",
            chartDescription: record?.visualization?.chartDescription || "",
            chartData: chartData,
            richMedia: richMedia,
        });

        setEditingIndicator(code);
    };

    // Unified Save Function (Saves everything except specific Challenge fields managed by ChallengeForm)
    const handleSave = async (code: string, title: string) => {
        if (!selectedYear) return;
        setIsSaving(true);

        try {
            const record = getRecordForIndicator(code);
            const visualization = buildVisualizationData();
            const richMedia = buildRichMediaData();

            const commonFields = {
                agreement: editFormData.agreement,
                outcomes: editFormData.outcomes,
                indicators: editFormData.indicators,
                actualResults: reportFormData.actualResults,
                visualization,
                richMedia
            };

            if (record) {
                // Update existing
                await firebaseService.updatePARecord(record.id, commonFields);
            } else {
                // Create new
                await firebaseService.addPARecord({
                    year: selectedYear,
                    category: selectedCategory,
                    indicatorCode: code,
                    title: title,
                    evidenceFiles: [],
                    ...commonFields
                });
            }
            await fetchPARecords();
            setEditingIndicator(null);
        } catch (error) {
            console.error("Failed to save record:", error);
            alert("Failed to save record.");
        } finally {
            setIsSaving(false);
        }
    };

    // Special Save for Challenge (combines Challenge Data + Report Data)
    const handleSaveChallengeMerged = async (code: string, title: string, cData: ChallengeData) => {
        if (!selectedYear) return;
        setIsSaving(true);

        try {
            const record = getRecordForIndicator(code);
            const visualization = buildVisualizationData();
            const richMedia = buildRichMediaData();

            // Note: Challenge doesn't use standard agreement/outcomes/indicators fields
            // It relies on cData and the Report section.

            const reportFields = {
                actualResults: reportFormData.actualResults,
                visualization,
                richMedia
            };

            if (record) {
                await firebaseService.updatePARecord(record.id, {
                    challengeData: cData,
                    ...reportFields
                });
            } else {
                await firebaseService.addPARecord({
                    year: selectedYear,
                    category: selectedCategory,
                    indicatorCode: code,
                    title: title,
                    agreement: "", outcomes: "", indicators: "", // Empty for challenge
                    evidenceFiles: [],
                    challengeData: cData,
                    ...reportFields
                });
            }
            await fetchPARecords();
            setEditingIndicator(null);
        } catch (error) {
            console.error("Failed to save challenge:", error);
            alert("Failed to save challenge.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Visualization Helpers ---

    const buildVisualizationData = (): VisualizationData | undefined => {
        if (reportFormData.chartType === "none" || reportFormData.chartData.length === 0) {
            return undefined;
        }
        return {
            chartType: reportFormData.chartType,
            chartTitle: reportFormData.chartTitle || undefined,
            chartDescription: reportFormData.chartDescription || undefined,
            dataPoints: reportFormData.chartData
                .filter(d => d.label && d.value)
                .map(d => ({ label: d.label, value: parseFloat(d.value) || 0 })),
        };
    };

    const addChartDataEntry = () => {
        setReportFormData(prev => ({
            ...prev,
            chartData: [...prev.chartData, { label: "", value: "" }],
        }));
    };

    const removeChartDataEntry = (index: number) => {
        setReportFormData(prev => ({
            ...prev,
            chartData: prev.chartData.filter((_, i) => i !== index),
        }));
    };

    const updateChartDataEntry = (index: number, field: "label" | "value", val: string) => {
        setReportFormData(prev => ({
            ...prev,
            chartData: prev.chartData.map((d, i) => i === index ? { ...d, [field]: val } : d),
        }));
    };

    // --- Rich Media Helpers ---

    const addRichMediaItem = (type: "image" | "video" | "youtube") => {
        const newItem = {
            id: Date.now().toString(),
            type,
            title: "",
            description: "",
            url: "",
            youtubeId: undefined as string | undefined,
        };
        setReportFormData(prev => ({
            ...prev,
            richMedia: [...prev.richMedia, newItem],
        }));
    };

    const removeRichMediaItem = (id: string) => {
        setReportFormData(prev => ({
            ...prev,
            richMedia: prev.richMedia.filter(m => m.id !== id),
        }));
    };

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

    const buildRichMediaData = (): RichMediaItem[] | undefined => {
        const validItems = reportFormData.richMedia.filter(m => m.url);
        if (validItems.length === 0) return undefined;
        return validItems.map((m, index) => ({
            id: m.id,
            type: m.type,
            title: m.title || undefined,
            description: m.description || undefined,
            url: m.url,
            youtubeId: m.youtubeId,
            order: index,
        }));
    };

    // --- File Upload ---

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, code: string, title: string) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploadingCode(code);

        try {
            let record = getRecordForIndicator(code);

            if (!record) {
                const newId = await firebaseService.addPARecord({
                    year: selectedYear!,
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
                    // Ideally we should wait for state update but we can refetch directly
                    const updatedRecords = await firebaseService.getPARecords(selectedYear!);
                    record = updatedRecords.find(r => r.indicatorCode === code);
                    setPaRecords(updatedRecords);
                }
            }

            if (!record) {
                setUploadingCode(null);
                return;
            }

            const uploadedFiles: EvidenceFile[] = [...(record.evidenceFiles || [])];

            for (const file of Array.from(files)) {
                const evidenceFile = await firebaseService.uploadEvidenceFile(file, selectedYear!, record.id);
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

    // NEW: Render Report Configuration (Visualization + Rich Media)
    const renderReportConfigFields = () => (
        <>
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
                    <div className="mb-4">
                        <label className="text-xs text-gray-500 block mb-1">คำอธิบายใต้กราฟ</label>
                        <RichTextEditor
                            value={reportFormData.chartDescription}
                            onChange={(html) => setReportFormData(prev => ({ ...prev, chartDescription: html }))}
                            placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับกราฟ..."
                            minHeight="100px"
                        />
                    </div>
                )}

                {reportFormData.chartType !== "none" && (
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 block">ข้อมูล (Label + ค่า)</label>
                        {reportFormData.chartData.map((entry, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={entry.label}
                                    onChange={(e) => updateChartDataEntry(index, "label", e.target.value)}
                                    placeholder="Label"
                                    className="flex-1 px-3 py-1.5 rounded border text-sm"
                                />
                                <input
                                    type="number"
                                    value={entry.value}
                                    onChange={(e) => updateChartDataEntry(index, "value", e.target.value)}
                                    placeholder="Value"
                                    className="w-24 px-3 py-1.5 rounded border text-sm"
                                />
                                <button onClick={() => removeChartDataEntry(index)} className="text-red-500 p-1">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addChartDataEntry}
                            className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                        >
                            <Plus size={14} /> เพิ่มข้อมูล
                        </button>
                    </div>
                )}
            </div>

            {/* Rich Media Config */}
            <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--royal-blue)" }}>
                    <Upload size={16} /> Rich Media (รูปภาพ/วิดีโอ)
                </h4>

                <div className="space-y-4">
                    {reportFormData.richMedia.map((media) => (
                        <div key={media.id} className="p-3 border rounded-lg bg-gray-50 relative">
                            <button
                                onClick={() => removeRichMediaItem(media.id)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                            >
                                <X size={16} />
                            </button>
                            <div className="grid gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">ประเภท</label>
                                    <select
                                        value={media.type}
                                        onChange={(e) => updateRichMediaItem(media.id, "type", e.target.value)}
                                        className="w-full px-3 py-1.5 rounded border text-sm"
                                    >
                                        <option value="image">รูปภาพ (URL)</option>
                                        <option value="video">วิดีโอ (URL)</option>
                                        <option value="youtube">YouTube</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">URL</label>
                                    <input
                                        type="text"
                                        value={media.url}
                                        onChange={(e) => updateRichMediaItem(media.id, "url", e.target.value)}
                                        placeholder={media.type === 'youtube' ? 'YouTube URL' : 'Image/Video URL'}
                                        className="w-full px-3 py-1.5 rounded border text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">คำบรรยาย</label>
                                    <input
                                        type="text"
                                        value={media.description}
                                        onChange={(e) => updateRichMediaItem(media.id, "description", e.target.value)}
                                        placeholder="คำบรรยายสั้นๆ"
                                        className="w-full px-3 py-1.5 rounded border text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-2">
                        <button
                            onClick={() => addRichMediaItem("image")}
                            className="text-xs bg-white border px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1"
                        >
                            <Plus size={14} /> เพิ่มรูปภาพ
                        </button>
                        <button
                            onClick={() => addRichMediaItem("youtube")}
                            className="text-xs bg-white border px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1"
                        >
                            <Plus size={14} /> เพิ่ม YouTube
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

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

                {/* PA Records Management */}
                {selectedYear && (
                    <section className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold font-[family-name:var(--font-prompt)]" style={{ color: "var(--royal-blue)" }}>
                                <FileText size={20} className="inline mr-2" />
                                จัดการข้อมูล PA - ปี {selectedYear}
                            </h2>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
                            {PA_CATEGORIES.map((cat) => {
                                // Simple stats: count total vs filled
                                // We check if there's any data (agreement or report)
                                const total = PA_INDICATORS.filter(i => i.category === cat.id).length;
                                const filled = PA_INDICATORS.filter(i => i.category === cat.id).filter(i => {
                                    const r = paRecords.find(r => r.indicatorCode === i.code);
                                    if (!r) return false;
                                    // For challenge: check challengeData
                                    if (cat.id === "challenge") return !!r.challengeData;
                                    // For others: check agreement or actualResults
                                    return !!r.agreement || !!r.actualResults;
                                }).length;

                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all font-[family-name:var(--font-sarabun)] flex items-center gap-2 ${selectedCategory === cat.id
                                            ? "bg-[var(--royal-blue)] text-white"
                                            : "bg-gray-100 hover:bg-gray-200"
                                            }`}
                                        style={selectedCategory !== cat.id ? { color: "var(--foreground)" } : {}}
                                    >
                                        {cat.labelTh}
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCategory === cat.id ? "bg-white/20" : "bg-gray-200"
                                            }`}>
                                            {filled}/{total}
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
                                const hasChallenge = !!record?.challengeData;
                                const hasData = selectedCategory === "challenge" ? hasChallenge : (hasAgreement || hasReport);

                                const isEditing = editingIndicator === indicator.code;

                                return (
                                    <div
                                        key={indicator.code}
                                        className="border rounded-xl p-4 transition-all"
                                        style={{
                                            borderColor: hasData ? "var(--royal-blue)" : "var(--background-secondary)",
                                            backgroundColor: isEditing ? "var(--background-secondary)" : "white"
                                        }}
                                    >
                                        {isEditing ? (
                                            // Unified Edit Mode
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-1 rounded text-sm font-semibold bg-[var(--royal-blue)] text-white">
                                                        {indicator.code}
                                                    </span>
                                                    <h3 className="font-medium font-[family-name:var(--font-sarabun)]">
                                                        {indicator.title}
                                                    </h3>
                                                </div>

                                                {/* PLAN SECTION */}
                                                <div className="bg-white p-4 rounded-lg border border-blue-100">
                                                    <div className="mb-4 flex items-center gap-2 pb-2 border-b border-blue-50">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                            Plan (ข้อตกลง)
                                                        </span>
                                                    </div>

                                                    {selectedCategory === "challenge" ? (
                                                        <ChallengeForm
                                                            challengeNumber={indicator.code === "challenge-1" ? 1 : 2}
                                                            initialData={challengeFormData || undefined}
                                                            onSave={async (data) => {
                                                                // Note: We don't save immediately here, we want to save purely on main save.
                                                                // BUT ChallengeForm was designed to self-save? 
                                                                // Ideally, we lift state up.
                                                                // For now, let's keep ChallengeForm expecting onSave but we hijack it to just update local state if we could.
                                                                // Since ChallengeForm calls onSave with data, we might need to change how we use it.
                                                                // Actually, let's just use the merged handler to save everything when they click Save in ChallengeForm?
                                                                // Or better, let's allow ChallengeForm to call the merged save.
                                                                await handleSaveChallengeMerged(indicator.code, indicator.title, data);
                                                                // Note: This will save Report Data too! So we must ensure reportFormData is up to date.
                                                                // It is, because we loaded it.
                                                            }}
                                                            onCancel={() => setEditingIndicator(null)}
                                                            isSaving={isSaving}
                                                        // We might want to hide the save button in ChallengeForm if we want a unified save button at bottom?
                                                        // But your request asked to "present both sections".
                                                        // If ChallengeForm excludes separate Report fields, we display Report fields BELOW it.
                                                        // ChallengeForm includes its own Save button. 
                                                        // Let's render Custom Actions or hide default actions if supported.
                                                        // ChallengeForm currently has buttons.
                                                        // For now, we will render Report Section BELOW ChallengeForm,
                                                        // AND we will likely need the user to click Save in ChallengeForm to save EVERYTHING.
                                                        // Or we can modify ChallengeForm to be controlled.
                                                        // Assuming ChallengeForm works as specific independent form, we can just let it be.
                                                        // BUT ensuring Report Data is ALSO saved is key.
                                                        // I created handleSaveChallengeMerged for this.
                                                        />
                                                    ) : (
                                                        <>
                                                            <div className="space-y-4">
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
                                                                        placeholder="ระบุผลลัพธ์ที่คาดหวัง..."
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
                                                                        placeholder="ระบุตัวชี้วัดความสำเร็จ..."
                                                                        minHeight="80px"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* REPORT SECTION (Displayed for both Standard and Challenge) */}
                                                <div className="bg-white p-4 rounded-lg border border-green-100">
                                                    <div className="mb-4 flex items-center gap-2 pb-2 border-b border-green-50">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">
                                                            Report (ผลการปฏิบัติงาน)
                                                        </span>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--foreground-muted)" }}>
                                                                ผลการปฏิบัติงานจริง
                                                            </label>
                                                            <RichTextEditor
                                                                value={reportFormData.actualResults}
                                                                onChange={(html) => setReportFormData(prev => ({ ...prev, actualResults: html }))}
                                                                placeholder="ระบุผลการดำเนินงาน..."
                                                                minHeight="150px"
                                                            />
                                                        </div>

                                                        {/* Config Fields (Charts + Media) */}
                                                        {renderReportConfigFields()}
                                                    </div>
                                                </div>

                                                {selectedCategory !== "challenge" && (
                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            onClick={() => handleSave(indicator.code, indicator.title)}
                                                            disabled={isSaving}
                                                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium btn-royal disabled:opacity-50 min-w-[120px] justify-center"
                                                        >
                                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                            บันทึกทั้งหมด
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingIndicator(null)}
                                                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200"
                                                        >
                                                            <X size={16} />
                                                            ยกเลิก
                                                        </button>
                                                    </div>
                                                )}

                                            </div>
                                        ) : (
                                            // View Mode
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {hasData ? (
                                                        <CheckCircle2 size={20} className="text-[var(--royal-blue)]" />
                                                    ) : (
                                                        <Circle size={20} className="text-gray-300" />
                                                    )}
                                                    <span
                                                        className="px-2 py-1 rounded text-sm font-semibold font-[family-name:var(--font-prompt)] bg-gray-100 text-[var(--royal-blue)]"
                                                    >
                                                        {indicator.code}
                                                    </span>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium font-[family-name:var(--font-sarabun)] text-gray-900">
                                                            {indicator.title}
                                                        </h3>
                                                        {/* Summaries */}
                                                        {record?.agreement && (
                                                            <div className="mt-1 flex items-start gap-1">
                                                                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1 rounded">Plan</span>
                                                                <HtmlContent content={record.agreement} className="text-sm text-gray-500 line-clamp-1" />
                                                            </div>
                                                        )}
                                                        {record?.actualResults && (
                                                            <div className="mt-1 flex items-start gap-1">
                                                                <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-1 rounded">Done</span>
                                                                <HtmlContent content={record.actualResults} className="text-sm text-gray-500 line-clamp-1" />
                                                            </div>
                                                        )}
                                                        {record?.challengeData && selectedCategory === "challenge" && (
                                                            <div className="mt-1 flex items-start gap-1">
                                                                <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 px-1 rounded">Challenge</span>
                                                                <span className="text-sm text-gray-500 line-clamp-1">{record.challengeData.titleTH}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0 ml-4">
                                                    {/* Upload Button */}
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

                                                    <button
                                                        onClick={() => handleStartEdit(indicator.code)}
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
