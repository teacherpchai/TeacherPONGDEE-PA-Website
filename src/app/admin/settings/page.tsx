"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Save,
    User,
    AtSign,
    Briefcase,
    GraduationCap,
    BarChart3,
    MessageSquare,
    Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { firebaseService } from "@/lib/firebaseService";
import { SiteSettings, HeroStat } from "@/types";
import Link from "next/link";
import ImageUploadCrop from "@/components/ImageUploadCrop";
import WorkloadFormSection from "@/components/WorkloadFormSection";
import RichTextEditor from "@/components/RichTextEditor";

export default function AdminSettingsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "contact" | "hero" | "about">("profile");
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    // Check auth and load settings
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        } else if (user) {
            loadSettings();
        }
    }, [user, authLoading, router]);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const data = await firebaseService.getSiteSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to load settings:", error);
            // Optionally handle error, maybe retry or show message
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            await firebaseService.updateSiteSettings(settings);
            alert("บันทึกสำเร็จ!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setIsSaving(false);
        }
    };

    const updateProfile = (field: string, value: any) => {
        if (!settings) return;
        setSettings({
            ...settings,
            profile: { ...settings.profile, [field]: value }
        });
    };

    const updateSocialLink = (field: string, value: string) => {
        if (!settings) return;
        setSettings({
            ...settings,
            profile: {
                ...settings.profile,
                socialLinks: { ...settings.profile.socialLinks, [field]: value }
            }
        });
    };

    const updateSetting = (field: keyof SiteSettings, value: unknown) => {
        if (!settings) return;
        setSettings({ ...settings, [field]: value });
    };

    const updateHeroStat = (index: number, field: keyof HeroStat, value: string) => {
        if (!settings) return;
        const newStats = [...settings.heroStats];
        newStats[index] = { ...newStats[index], [field]: value };
        setSettings({ ...settings, heroStats: newStats });
    };

    const addHeroStat = () => {
        if (!settings) return;
        setSettings({
            ...settings,
            heroStats: [...settings.heroStats, { icon: "star", value: "", label: "" }]
        });
    };

    const removeHeroStat = (index: number) => {
        if (!settings) return;
        setSettings({
            ...settings,
            heroStats: settings.heroStats.filter((_, i) => i !== index)
        });
    };

    const updateSlogan = (index: number, value: string) => {
        if (!settings) return;
        const newSlogans = [...settings.heroSlogans];
        newSlogans[index] = value;
        setSettings({ ...settings, heroSlogans: newSlogans });
    };

    const addSlogan = () => {
        if (!settings) return;
        setSettings({
            ...settings,
            heroSlogans: [...settings.heroSlogans, ""]
        });
    };

    const removeSlogan = (index: number) => {
        if (!settings) return;
        setSettings({
            ...settings,
            heroSlogans: settings.heroSlogans.filter((_, i) => i !== index)
        });
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background-secondary)]">
                <Loader2 className="animate-spin text-[var(--royal-blue)]" size={48} />
            </div>
        );
    }

    if (!settings) return null;

    const tabs = [
        { id: "profile" as const, label: "ข้อมูลส่วนตัว", icon: User },
        { id: "contact" as const, label: "ติดต่อ", icon: AtSign },
        { id: "hero" as const, label: "หน้าแรก", icon: BarChart3 },
        { id: "about" as const, label: "เกี่ยวกับ", icon: Briefcase },
    ];

    return (
        <div className="min-h-screen bg-[var(--background-secondary)]">
            {/* Header */}
            <header className="sticky top-0 bg-white border-b shadow-sm z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft size={20} className="text-[var(--royal-blue)]" />
                        </Link>
                        <h1 className="text-xl font-bold text-[var(--royal-blue)] font-[family-name:var(--font-prompt)]">
                            ตั้งค่าเว็บไซต์
                        </h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 btn-gold rounded-lg font-medium disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        บันทึกทั้งหมด
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? "bg-[var(--royal-blue)] text-white"
                                : "bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
                        <h2 className="text-lg font-semibold text-[var(--royal-blue)] flex items-center gap-2">
                            <User size={20} />
                            ข้อมูลส่วนตัว
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">ชื่อ-นามสกุล (ไทย)</label>
                                <input
                                    type="text"
                                    value={settings.profile.nameTH}
                                    onChange={(e) => updateProfile("nameTH", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="ครูปองดี ชัยจันทรา"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">ชื่อ-นามสกุล (อังกฤษ)</label>
                                <input
                                    type="text"
                                    value={settings.profile.nameEN}
                                    onChange={(e) => updateProfile("nameEN", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="Pongdee Chaijachanda"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">ตำแหน่ง</label>
                                <input
                                    type="text"
                                    value={settings.profile.position}
                                    onChange={(e) => updateProfile("position", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="ครู"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">วิทยฐานะ</label>
                                <input
                                    type="text"
                                    value={settings.profile.academicRank || ""}
                                    onChange={(e) => updateProfile("academicRank", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="ชำนาญการ"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">วิชาเอก</label>
                                <input
                                    type="text"
                                    value={settings.profile.subject}
                                    onChange={(e) => updateProfile("subject", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="เคมี"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">กลุ่มสาระการเรียนรู้</label>
                                <input
                                    type="text"
                                    value={settings.profile.department}
                                    onChange={(e) => updateProfile("department", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="วิทยาศาสตร์และเทคโนโลยี"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">ประวัติย่อ / Bio</label>
                            <RichTextEditor
                                value={settings.profile.bio}
                                onChange={(html) => updateProfile("bio", html)}
                                placeholder="ผู้สอนวิชาเคมี ม.ปลาย ที่มุ่งมั่นพัฒนา..."
                                minHeight="120px"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">รูปโปรไฟล์</label>
                            <ImageUploadCrop
                                currentImageUrl={settings.profile.imageUrl}
                                onImageChange={(imageDataUrl) => updateProfile("imageUrl", imageDataUrl)}
                                aspectRatio={1}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                หรือระบุ URL โดยตรง:
                            </p>
                            <input
                                type="text"
                                value={settings.profile.imageUrl || ""}
                                onChange={(e) => updateProfile("imageUrl", e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg text-sm mt-1"
                                placeholder="https://example.com/photo.jpg"
                            />
                        </div>

                        {/* Site Identity */}
                        <h3 className="text-base font-semibold text-gray-700 pt-4 border-t">ตั้งค่าเว็บไซต์</h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">โลโก้ (ตัวย่อ)</label>
                                <input
                                    type="text"
                                    value={settings.logoText}
                                    onChange={(e) => updateSetting("logoText", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="Kru.P"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">ชื่อเว็บไซต์</label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => updateSetting("siteName", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="Kru Pongdee | Digital PA Portfolio"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Tab */}
                {activeTab === "contact" && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
                        <h2 className="text-lg font-semibold text-[var(--royal-blue)] flex items-center gap-2">
                            <AtSign size={20} />
                            ข้อมูลติดต่อ
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={settings.profile.email || ""}
                                    onChange={(e) => updateProfile("email", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">โทรศัพท์</label>
                                <input
                                    type="tel"
                                    value={settings.profile.phone || ""}
                                    onChange={(e) => updateProfile("phone", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="089-123-4567"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">โรงเรียน</label>
                                <input
                                    type="text"
                                    value={settings.profile.school || ""}
                                    onChange={(e) => updateProfile("school", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="โรงเรียน..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">ที่อยู่/จังหวัด</label>
                                <input
                                    type="text"
                                    value={settings.profile.address || ""}
                                    onChange={(e) => updateProfile("address", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="จังหวัด..."
                                />
                            </div>
                        </div>

                        <h3 className="text-base font-semibold text-gray-700 pt-4 border-t">Social Media</h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Facebook URL</label>
                                <input
                                    type="url"
                                    value={settings.profile.socialLinks?.facebook || ""}
                                    onChange={(e) => updateSocialLink("facebook", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">LINE ID</label>
                                <input
                                    type="text"
                                    value={settings.profile.socialLinks?.line || ""}
                                    onChange={(e) => updateSocialLink("line", e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="@lineid"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Hero Tab */}
                {activeTab === "hero" && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
                        <h2 className="text-lg font-semibold text-[var(--royal-blue)] flex items-center gap-2">
                            <MessageSquare size={20} />
                            สโลแกน (ข้อความหมุนเวียน)
                        </h2>

                        <div className="space-y-2">
                            {settings.heroSlogans.map((slogan, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={slogan}
                                        onChange={(e) => updateSlogan(index, e.target.value)}
                                        className="flex-1 px-4 py-2 border rounded-lg"
                                        placeholder={`สโลแกน ${index + 1}`}
                                    />
                                    <button
                                        onClick={() => removeSlogan(index)}
                                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        title="ลบ"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addSlogan}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                + เพิ่มสโลแกน
                            </button>
                        </div>

                        <h2 className="text-lg font-semibold text-[var(--royal-blue)] flex items-center gap-2 pt-4 border-t">
                            <BarChart3 size={20} />
                            สถิติบนหน้าแรก
                        </h2>

                        <div className="space-y-3">
                            {settings.heroStats.map((stat, index) => (
                                <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg">
                                    <select
                                        value={stat.icon}
                                        onChange={(e) => updateHeroStat(index, "icon", e.target.value)}
                                        className="px-3 py-2 border rounded-lg"
                                        title="เลือก Icon"
                                    >
                                        <option value="users">👥 Users</option>
                                        <option value="book">📚 Book</option>
                                        <option value="award">🏆 Award</option>
                                        <option value="flask">🧪 Flask</option>
                                        <option value="star">⭐ Star</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={stat.value}
                                        onChange={(e) => updateHeroStat(index, "value", e.target.value)}
                                        className="w-24 px-3 py-2 border rounded-lg"
                                        placeholder="500+"
                                    />
                                    <input
                                        type="text"
                                        value={stat.label}
                                        onChange={(e) => updateHeroStat(index, "label", e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                        placeholder="นักเรียนสอน"
                                    />
                                    <button
                                        onClick={() => removeHeroStat(index)}
                                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        title="ลบ"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addHeroStat}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                + เพิ่มสถิติ
                            </button>
                        </div>
                    </div>
                )}

                {/* About Tab */}
                {activeTab === "about" && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
                        {/* Structured Education Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--royal-blue)] flex items-center gap-2 mb-4">
                                <GraduationCap size={20} />
                                ประวัติการศึกษา
                            </h2>

                            <div className="space-y-3">
                                {(settings.profile.structuredEducation || []).map((edu, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-[var(--royal-blue)]">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-medium text-gray-500">รายการที่ {index + 1}</span>
                                            <button
                                                onClick={() => {
                                                    const newEdu = [...(settings.profile.structuredEducation || [])];
                                                    newEdu.splice(index, 1);
                                                    setSettings({
                                                        ...settings,
                                                        profile: { ...settings.profile, structuredEducation: newEdu }
                                                    });
                                                }}
                                                className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-sm"
                                            >
                                                ✕ ลบ
                                            </button>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-gray-600">ระดับการศึกษา</label>
                                                <select
                                                    value={edu.level}
                                                    onChange={(e) => {
                                                        const newEdu = [...(settings.profile.structuredEducation || [])];
                                                        newEdu[index] = { ...newEdu[index], level: e.target.value as "junior_high" | "senior_high" | "bachelor" | "master" | "doctoral" };
                                                        setSettings({
                                                            ...settings,
                                                            profile: { ...settings.profile, structuredEducation: newEdu }
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                >
                                                    <option value="junior_high">มัธยมศึกษาตอนต้น</option>
                                                    <option value="senior_high">มัธยมศึกษาตอนปลาย</option>
                                                    <option value="bachelor">ปริญญาตรี</option>
                                                    <option value="master">ปริญญาโท</option>
                                                    <option value="doctoral">ปริญญาเอก</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-gray-600">ปี พ.ศ.</label>
                                                <input
                                                    type="text"
                                                    value={edu.year}
                                                    onChange={(e) => {
                                                        const newEdu = [...(settings.profile.structuredEducation || [])];
                                                        newEdu[index] = { ...newEdu[index], year: e.target.value };
                                                        setSettings({
                                                            ...settings,
                                                            profile: { ...settings.profile, structuredEducation: newEdu }
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    placeholder="พ.ศ. 2545"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1 text-gray-600">วุฒิการศึกษา</label>
                                                <input
                                                    type="text"
                                                    value={edu.degree}
                                                    onChange={(e) => {
                                                        const newEdu = [...(settings.profile.structuredEducation || [])];
                                                        newEdu[index] = { ...newEdu[index], degree: e.target.value };
                                                        setSettings({
                                                            ...settings,
                                                            profile: { ...settings.profile, structuredEducation: newEdu }
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    placeholder="ประกาศนียบัตร หรือ ปริญญา..."
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1 text-gray-600">สาขา/วิชาเอก</label>
                                                <input
                                                    type="text"
                                                    value={edu.major || ""}
                                                    onChange={(e) => {
                                                        const newEdu = [...(settings.profile.structuredEducation || [])];
                                                        newEdu[index] = { ...newEdu[index], major: e.target.value };
                                                        setSettings({
                                                            ...settings,
                                                            profile: { ...settings.profile, structuredEducation: newEdu }
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    placeholder="สาขาวิชา หรือ วิชาเอก"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-gray-600">สถาบัน</label>
                                                <input
                                                    type="text"
                                                    value={edu.institution}
                                                    onChange={(e) => {
                                                        const newEdu = [...(settings.profile.structuredEducation || [])];
                                                        newEdu[index] = { ...newEdu[index], institution: e.target.value };
                                                        setSettings({
                                                            ...settings,
                                                            profile: { ...settings.profile, structuredEducation: newEdu }
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    placeholder="โรงเรียน/มหาวิทยาลัย"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-gray-600">จังหวัด/หมายเหตุ</label>
                                                <input
                                                    type="text"
                                                    value={edu.location || ""}
                                                    onChange={(e) => {
                                                        const newEdu = [...(settings.profile.structuredEducation || [])];
                                                        newEdu[index] = { ...newEdu[index], location: e.target.value };
                                                        setSettings({
                                                            ...settings,
                                                            profile: { ...settings.profile, structuredEducation: newEdu }
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    placeholder="จังหวัด หรือ หมายเหตุ"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newEdu = [...(settings.profile.structuredEducation || [])];
                                        newEdu.push({ level: "bachelor", year: "", degree: "", institution: "" });
                                        setSettings({
                                            ...settings,
                                            profile: { ...settings.profile, structuredEducation: newEdu }
                                        });
                                    }}
                                    className="w-full py-2 border-2 border-dashed border-[var(--royal-blue)] text-[var(--royal-blue)] rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                                >
                                    + เพิ่มการศึกษา
                                </button>
                            </div>
                        </div>

                        {/* Structured Career Section */}
                        <div className="pt-6 border-t">
                            <h2 className="text-lg font-semibold text-[var(--royal-blue)] flex items-center gap-2 mb-4">
                                <Briefcase size={20} />
                                ประวัติการทำงาน
                            </h2>

                            <div className="space-y-3">
                                {(settings.profile.structuredCareer || []).map((career, index) => (
                                    <div key={index} className="bg-amber-50 p-4 rounded-lg border-l-4 border-[var(--gold)]">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-medium text-gray-500">รายการที่ {index + 1}</span>
                                            <button
                                                onClick={() => {
                                                    const newCareer = [...(settings.profile.structuredCareer || [])];
                                                    newCareer.splice(index, 1);
                                                    setSettings({
                                                        ...settings,
                                                        profile: { ...settings.profile, structuredCareer: newCareer }
                                                    });
                                                }}
                                                className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-sm"
                                            >
                                                ✕ ลบ
                                            </button>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-gray-600">วันที่เริ่ม</label>
                                                <input
                                                    type="text"
                                                    value={career.startDate}
                                                    onChange={(e) => {
                                                        const newCareer = [...(settings.profile.structuredCareer || [])];
                                                        newCareer[index] = { ...newCareer[index], startDate: e.target.value };
                                                        setSettings({
                                                            ...settings,
                                                            profile: { ...settings.profile, structuredCareer: newCareer }
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    placeholder="25 กันยายน พ.ศ. 2560"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-gray-600">วันที่สิ้นสุด</label>
                                                <input
                                                    type="text"
                                                    value={career.endDate || ""}
                                                    onChange={(e) => {
                                                        const newCareer = [...(settings.profile.structuredCareer || [])];
                                                        newCareer[index] = { ...newCareer[index], endDate: e.target.value };
                                                        setSettings({
                                                            ...settings,
                                                            profile: { ...settings.profile, structuredCareer: newCareer }
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    placeholder="ปัจจุบัน หรือ วันที่"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-gray-600">ตำแหน่ง</label>
                                                <input
                                                    type="text"
                                                    value={career.position}
                                                    onChange={(e) => {
                                                        const newCareer = [...(settings.profile.structuredCareer || [])];
                                                        newCareer[index] = { ...newCareer[index], position: e.target.value };
                                                        setSettings({
                                                            ...settings,
                                                            profile: { ...settings.profile, structuredCareer: newCareer }
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    placeholder="ครู ตำแหน่ง ครูผู้ช่วย"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1 text-gray-600">อันดับ/ค.ศ.</label>
                                                <input
                                                    type="text"
                                                    value={career.rank || ""}
                                                    onChange={(e) => {
                                                        const newCareer = [...(settings.profile.structuredCareer || [])];
                                                        newCareer[index] = { ...newCareer[index], rank: e.target.value };
                                                        setSettings({
                                                            ...settings,
                                                            profile: { ...settings.profile, structuredCareer: newCareer }
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    placeholder="อันดับ ค.ศ.1"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1 text-gray-600">สถานที่ทำงาน</label>
                                                <input
                                                    type="text"
                                                    value={career.institution}
                                                    onChange={(e) => {
                                                        const newCareer = [...(settings.profile.structuredCareer || [])];
                                                        newCareer[index] = { ...newCareer[index], institution: e.target.value };
                                                        setSettings({
                                                            ...settings,
                                                            profile: { ...settings.profile, structuredCareer: newCareer }
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    placeholder="โรงเรียน..."
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1 text-gray-600">สังกัด/หมายเหตุ</label>
                                                <input
                                                    type="text"
                                                    value={career.department || ""}
                                                    onChange={(e) => {
                                                        const newCareer = [...(settings.profile.structuredCareer || [])];
                                                        newCareer[index] = { ...newCareer[index], department: e.target.value };
                                                        setSettings({
                                                            ...settings,
                                                            profile: { ...settings.profile, structuredCareer: newCareer }
                                                        });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    placeholder="สำนักงานเขตพื้นที่การศึกษา..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newCareer = [...(settings.profile.structuredCareer || [])];
                                        newCareer.push({ startDate: "", position: "", institution: "" });
                                        setSettings({
                                            ...settings,
                                            profile: { ...settings.profile, structuredCareer: newCareer }
                                        });
                                    }}
                                    className="w-full py-2 border-2 border-dashed border-[var(--gold)] text-[var(--gold-dark)] rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
                                >
                                    + เพิ่มประวัติงาน
                                </button>
                            </div>
                        </div>

                        <h3 className="text-base font-semibold text-gray-700 pt-4 border-t">ภาระงานปัจจุบัน</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            สำหรับ PA ปีงบประมาณ (เช่น ปีงบ 2569 = 1 ต.ค. 2568 - 30 ก.ย. 2569 → ภาคเรียน 2/2568 และ 1/2569)
                        </p>

                        {/* Semester 2 - แสดงก่อน */}
                        <WorkloadFormSection
                            semesterNumber={2}
                            workload={settings.profile.structuredWorkloadSemester2 || {
                                semesterLabel: settings.profile.workloadSemester2?.semesterLabel || "",
                                teachingSubjects: [],
                                supportWork: [],
                                developmentWork: [],
                                policyWork: [],
                            }}
                            onChange={(workload) => updateProfile("structuredWorkloadSemester2", workload)}
                        />

                        {/* Semester 1 - แสดงหลัง */}
                        <WorkloadFormSection
                            semesterNumber={1}
                            workload={settings.profile.structuredWorkloadSemester1 || {
                                semesterLabel: settings.profile.workloadSemester1?.semesterLabel || "",
                                teachingSubjects: [],
                                supportWork: [],
                                developmentWork: [],
                                policyWork: [],
                            }}
                            onChange={(workload) => updateProfile("structuredWorkloadSemester1", workload)}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
