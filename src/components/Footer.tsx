"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { getCurrentFiscalYear } from "@/lib/fiscalYear";

interface FooterLink {
    label: string;
    href: string;
}

const quickLinks: FooterLink[] = [
    { label: "หน้าหลัก", href: "/" },
    { label: "PA Performance", href: "/performance" },
    { label: "เข้าสู่ระบบ Admin", href: "/admin" },
];

export default function Footer() {
    const { settings } = useSiteSettings();
    const { profile, logoText, developerCredit, copyrightText } = settings || {
        profile: { nameTH: "", position: "" },
        logoText: "PA",
        developerCredit: "",
        copyrightText: ""
    };
    const currentYear = getCurrentFiscalYear(); // Fiscal year (e.g., 2569 for Oct 2568 - Sep 2569)

    return (
        <footer
            className="relative overflow-hidden"
            style={{ backgroundColor: "var(--royal-blue)" }}
        >
            {/* Decorative Elements */}
            <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
                style={{ backgroundColor: "var(--gold)" }}
            />
            <div
                className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-5"
                style={{ backgroundColor: "var(--gold)" }}
            />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
                    {/* Brand Section - Without Bio and Social Icons */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <span
                                className="text-3xl font-bold font-[family-name:var(--font-prompt)]"
                                style={{ color: "var(--gold)" }}
                            >
                                {logoText}
                            </span>
                        </div>
                        <p
                            className="text-sm leading-relaxed opacity-80 font-[family-name:var(--font-sarabun)]"
                            style={{ color: "white" }}
                        >
                            {profile.nameTH}
                            <br />
                            {profile.position}{profile.academicRank ? ` ${profile.academicRank}` : ""} {profile.department && `กลุ่มสาระการเรียนรู้${profile.department}`} {profile.subject && `(${profile.subject})`}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3
                            className="text-lg font-semibold font-[family-name:var(--font-prompt)]"
                            style={{ color: "var(--gold)" }}
                        >
                            ลิงก์ด่วน
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm opacity-80 hover:opacity-100 transition-opacity font-[family-name:var(--font-sarabun)]"
                                        style={{ color: "white" }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info - With Social Links */}
                    <div className="space-y-6">
                        <h3
                            className="text-lg font-semibold font-[family-name:var(--font-prompt)]"
                            style={{ color: "var(--gold)" }}
                        >
                            ติดต่อ
                        </h3>
                        <div className="space-y-4">
                            {profile.email && (
                                <a
                                    href={`mailto:${profile.email}`}
                                    className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 transition-opacity font-[family-name:var(--font-sarabun)]"
                                    style={{ color: "white" }}
                                >
                                    <Mail size={18} style={{ color: "var(--gold)" }} />
                                    {profile.email}
                                </a>
                            )}
                            {profile.phone && (
                                <a
                                    href={`tel:${profile.phone.replace(/-/g, "")}`}
                                    className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 transition-opacity font-[family-name:var(--font-sarabun)]"
                                    style={{ color: "white" }}
                                >
                                    <Phone size={18} style={{ color: "var(--gold)" }} />
                                    {profile.phone}
                                </a>
                            )}
                            {(profile.school || profile.address) && (
                                <div
                                    className="flex items-start gap-3 text-sm opacity-80 font-[family-name:var(--font-sarabun)]"
                                    style={{ color: "white" }}
                                >
                                    <MapPin size={18} className="flex-shrink-0 mt-0.5" style={{ color: "var(--gold)" }} />
                                    <span>
                                        {profile.school}{profile.school && profile.address ? " " : ""}{profile.address}
                                    </span>
                                </div>
                            )}

                            {/* Social Links - Text display */}
                            {profile.socialLinks?.line && (
                                <div
                                    className="flex items-center gap-3 text-sm opacity-80 font-[family-name:var(--font-sarabun)]"
                                    style={{ color: "white" }}
                                >
                                    <MessageCircle size={18} style={{ color: "var(--gold)" }} />
                                    <span>Line ID: {profile.socialLinks.line}</span>
                                </div>
                            )}
                            {profile.socialLinks?.facebook && (
                                <a
                                    href={profile.socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 transition-opacity font-[family-name:var(--font-sarabun)]"
                                    style={{ color: "white" }}
                                >
                                    <Facebook size={18} style={{ color: "var(--gold)" }} />
                                    <span>Facebook</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div
                    className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
                    style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                >
                    <p
                        className="text-sm opacity-60 font-[family-name:var(--font-sarabun)]"
                        style={{ color: "white" }}
                    >
                        {copyrightText || `© ${currentYear} ${profile.nameTH} Digital Portfolio. สงวนลิขสิทธิ์`}
                    </p>
                    <p
                        className="text-sm opacity-60 font-[family-name:var(--font-sarabun)]"
                        style={{ color: "white" }}
                    >
                        {developerCredit || `พัฒนาด้วย ❤️ โดย${(profile.nameTH || "").split(" ")[0]}`}
                    </p>
                </div>
            </div>
        </footer>
    );
}
