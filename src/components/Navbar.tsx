"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, User, Home, FileText, ClipboardList, BarChart3, LayoutDashboard } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { getCurrentFiscalYear } from "@/lib/fiscalYear";

interface NavbarProps {
    years?: string[];
    selectedYear?: string;
    onYearChange?: (year: string) => void;
}

interface SubMenuItem {
    href: string;
    label: string;
}

interface DropdownMenu {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    items: SubMenuItem[];
}

const paAgreementMenu: DropdownMenu = {
    id: "pa-agreement",
    label: "ข้อตกลงการพัฒนางาน (PA)",
    icon: FileText,
    items: [
        { href: "/pa-agreement/workload", label: "ภาระงาน" },
        { href: "/pa-agreement/learning", label: "ด้านการจัดการเรียนรู้" },
        { href: "/pa-agreement/support", label: "ด้านการส่งเสริมและสนับสนุน" },
        { href: "/pa-agreement/development", label: "ด้านการพัฒนาตนเองและวิชาชีพ" },
        { href: "/pa-agreement/challenge", label: "ประเด็นท้าทาย" },
    ],
};

const paReportMenu: DropdownMenu = {
    id: "pa-report",
    label: "รายงานผลการปฏิบัติงานฯ",
    icon: BarChart3,
    items: [
        { href: "/pa-report/learning", label: "สรุปผลด้านการจัดการเรียนรู้" },
        { href: "/pa-report/support", label: "สรุปผลด้านการส่งเสริมและสนับสนุน" },
        { href: "/pa-report/development", label: "สรุปผลด้านการพัฒนาตนเองและวิชาชีพ" },
        { href: "/pa-report/challenge", label: "สรุปผลประเด็นท้าทาย" },
        { href: "/pa-report/evidence", label: "คลังหลักฐาน" },
    ],
};

export default function Navbar({ years, selectedYear, onYearChange }: NavbarProps) {
    const { settings } = useSiteSettings();
    const { logoText, profile } = settings || { logoText: "PA", profile: { nameEN: "" } };

    // Use current fiscal year as default if no years provided
    const currentYear = getCurrentFiscalYear().toString();
    const defaultYears = [currentYear];
    const yearsList = years || defaultYears;

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = (id: string) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const toggleMobileDropdown = (id: string) => {
        setMobileOpenDropdown(mobileOpenDropdown === id ? null : id);
    };

    const renderDropdownMenu = (menu: DropdownMenu) => (
        <div key={menu.id} className="relative">
            <button
                onClick={() => toggleDropdown(menu.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors hover:text-[var(--gold)] font-[family-name:var(--font-sarabun)]"
                style={{ color: "var(--royal-blue)" }}
            >
                <menu.icon size={16} />
                <span className="hidden lg:inline">{menu.label}</span>
                <span className="lg:hidden">{menu.id === "pa-agreement" ? "PA ข้อตกลง" : "PA รายงาน"}</span>
                <ChevronDown
                    size={14}
                    className={`transition-transform ${openDropdown === menu.id ? "rotate-180" : ""}`}
                />
            </button>

            {openDropdown === menu.id && (
                <div
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border overflow-hidden z-50"
                    style={{ borderColor: "var(--gold)" }}
                >
                    {menu.items.map((item, index) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`block px-4 py-3 text-sm transition-colors hover:bg-gray-50 font-[family-name:var(--font-sarabun)] ${index !== menu.items.length - 1 ? "border-b border-gray-100" : ""
                                }`}
                            style={{ color: "var(--royal-blue)" }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

    const renderMobileDropdownMenu = (menu: DropdownMenu) => (
        <div key={menu.id} className="space-y-1">
            <button
                onClick={() => toggleMobileDropdown(menu.id)}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 font-[family-name:var(--font-sarabun)] rounded-lg"
                style={{ color: "var(--royal-blue)" }}
            >
                <div className="flex items-center gap-3">
                    <menu.icon size={18} />
                    {menu.label}
                </div>
                <ChevronDown
                    size={16}
                    className={`transition-transform ${mobileOpenDropdown === menu.id ? "rotate-180" : ""}`}
                />
            </button>

            {mobileOpenDropdown === menu.id && (
                <div className="ml-6 pl-4 border-l-2 space-y-1" style={{ borderColor: "var(--gold)" }}>
                    {menu.items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                                setMobileOpenDropdown(null);
                                setIsMobileMenuOpen(false);
                            }}
                            className="block px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 font-[family-name:var(--font-sarabun)] rounded-lg"
                            style={{ color: "var(--royal-blue)" }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "glass shadow-lg"
                : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20" ref={dropdownRef}>
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span
                            className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-prompt)]"
                            style={{ color: "var(--gold)" }}
                        >
                            {logoText}
                        </span>
                        <span
                            className="hidden sm:block text-sm md:text-base font-medium font-[family-name:var(--font-sarabun)]"
                            style={{ color: "var(--royal-blue)" }}
                        >
                            {profile.nameEN}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-4">
                        {/* Home */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-[var(--gold)] font-[family-name:var(--font-sarabun)]"
                            style={{ color: "var(--royal-blue)" }}
                        >
                            <Home size={16} />
                            หน้าหลัก
                        </Link>

                        {/* Dashboard */}
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-[var(--gold)] font-[family-name:var(--font-sarabun)]"
                            style={{ color: "var(--royal-blue)" }}
                        >
                            <LayoutDashboard size={16} />
                            Dashboard
                        </Link>

                        {/* PA Agreement Dropdown */}
                        {renderDropdownMenu(paAgreementMenu)}

                        {/* PA Report Dropdown */}
                        {renderDropdownMenu(paReportMenu)}

                        {/* Year Selector */}
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown("year")}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors hover:text-[var(--gold)] font-[family-name:var(--font-sarabun)]"
                                style={{ color: "var(--royal-blue)" }}
                            >
                                <ClipboardList size={16} />
                                ปี {selectedYear || yearsList[0]}
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${openDropdown === "year" ? "rotate-180" : ""}`}
                                />
                            </button>

                            {openDropdown === "year" && (
                                <div
                                    className="absolute top-full right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border overflow-hidden z-50"
                                    style={{ borderColor: "var(--gold)" }}
                                >
                                    {yearsList.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                onYearChange?.(year);
                                                setOpenDropdown(null);
                                            }}
                                            className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 font-[family-name:var(--font-sarabun)] ${selectedYear === year ? "bg-gray-100 font-semibold" : ""
                                                }`}
                                            style={{ color: "var(--royal-blue)" }}
                                        >
                                            ปีงบประมาณ {year}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Admin Login */}
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all btn-royal font-[family-name:var(--font-sarabun)]"
                        >
                            <User size={16} />
                            Admin
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg transition-colors hover:bg-gray-100"
                        style={{ color: "var(--royal-blue)" }}
                        aria-label={isMobileMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t shadow-lg max-h-[80vh] overflow-y-auto">
                    <div className="px-4 py-4 space-y-2">
                        {/* Home */}
                        <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 font-[family-name:var(--font-sarabun)]"
                            style={{ color: "var(--royal-blue)" }}
                        >
                            <Home size={18} />
                            หน้าหลัก
                        </Link>

                        {/* Dashboard */}
                        <Link
                            href="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 font-[family-name:var(--font-sarabun)]"
                            style={{ color: "var(--royal-blue)" }}
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Link>

                        {/* PA Agreement */}
                        {renderMobileDropdownMenu(paAgreementMenu)}

                        {/* PA Report */}
                        {renderMobileDropdownMenu(paReportMenu)}

                        {/* Year Selector */}
                        <div className="px-4 py-2">
                            <p className="text-xs text-gray-500 mb-2 font-[family-name:var(--font-sarabun)]">
                                เลือกปีงบประมาณ
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {yearsList.map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => {
                                            onYearChange?.(year);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`px-4 py-2 rounded-full text-sm transition-all font-[family-name:var(--font-sarabun)] ${selectedYear === year
                                            ? "btn-gold"
                                            : "border hover:bg-gray-50"
                                            }`}
                                        style={{
                                            borderColor: selectedYear === year ? "var(--gold)" : "var(--royal-blue)",
                                            color: selectedYear === year ? "var(--royal-blue-dark)" : "var(--royal-blue)"
                                        }}
                                    >
                                        ปี {year}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Admin Link */}
                        <Link
                            href="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-2 mx-4 px-4 py-3 rounded-full text-sm font-medium transition-all btn-royal font-[family-name:var(--font-sarabun)]"
                        >
                            <User size={18} />
                            เข้าสู่ระบบ Admin
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
