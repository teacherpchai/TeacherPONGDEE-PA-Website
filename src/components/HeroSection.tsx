"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Award, Users, BookOpen, FlaskConical, Star } from "lucide-react";
import Link from "next/link";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import Image from "next/image";

// Map icon names to components
const iconMap: Record<string, React.ReactNode> = {
    users: <Users size={24} />,
    book: <BookOpen size={24} />,
    award: <Award size={24} />,
    flask: <FlaskConical size={24} />,
    star: <Star size={24} />,
};

export default function HeroSection() {
    const { settings, loading: isLoading } = useSiteSettings(); // Adapted to use 'loading' from context
    const [currentSloganIndex, setCurrentSloganIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    const slogans = settings?.heroSlogans && settings.heroSlogans.length > 0 ? settings.heroSlogans : ["ครูมืออาชีพ"];
    const stats = settings?.heroStats || [];
    const profile = settings?.profile || {
        nameTH: "กำลังโหลด...",
        nameEN: "Loading...",
        position: "",
        bio: "",
        imageUrl: "", // Ensure imageUrl exists in fallback
        department: "",
        subject: ""
    };

    useEffect(() => {
        const currentSlogan = slogans[currentSloganIndex];

        if (isTyping) {
            if (displayedText.length < currentSlogan.length) {
                const timeout = setTimeout(() => {
                    setDisplayedText(currentSlogan.slice(0, displayedText.length + 1));
                }, 100);
                return () => clearTimeout(timeout);
            } else {
                const timeout = setTimeout(() => {
                    setIsTyping(false);
                }, 2000);
                return () => clearTimeout(timeout);
            }
        } else {
            if (displayedText.length > 0) {
                const timeout = setTimeout(() => {
                    setDisplayedText(displayedText.slice(0, -1));
                }, 50);
                return () => clearTimeout(timeout);
            } else {
                setCurrentSloganIndex((prev) => (prev + 1) % slogans.length);
                setIsTyping(true);
            }
        }
    }, [displayedText, isTyping, currentSloganIndex, slogans]);

    // Reset when settings change
    useEffect(() => {
        setCurrentSloganIndex(0);
        setDisplayedText("");
        setIsTyping(true);
    }, [settings?.heroSlogans]);

    if (isLoading || !settings) {
        return (
            <section className="relative min-h-screen flex items-center justify-center molecular-pattern">
                <div className="text-center">
                    <div className="animate-pulse w-16 h-16 rounded-full mx-auto" style={{ backgroundColor: "var(--gold)" }} />
                </div>
            </section>
        );
    }

    return (
        <section className="relative min-h-screen flex items-center molecular-pattern overflow-hidden">
            {/* Background Decorations */}
            <div
                className="absolute top-0 right-0 w-1/2 h-full opacity-5"
                style={{
                    background: `linear-gradient(135deg, var(--royal-blue) 0%, transparent 50%)`
                }}
            />
            <div
                className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-10"
                style={{ backgroundColor: "var(--gold)" }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 fade-in">
                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                            style={{
                                borderColor: "var(--gold)",
                                color: "var(--royal-blue)"
                            }}
                        >
                            <Award size={16} style={{ color: "var(--gold)" }} />
                            <span className="font-[family-name:var(--font-sarabun)]">
                                {profile.position}
                            </span>
                        </div>

                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h1
                                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-[family-name:var(--font-prompt)]"
                                style={{ color: "var(--royal-blue)" }}
                            >
                                {profile.nameTH.split(" ")[0]}
                                <br />
                                <span style={{ color: "var(--gold)" }}>
                                    {profile.nameEN.split(" ").slice(-1)[0]}
                                </span>
                            </h1>

                            {/* Typewriter Effect */}
                            <div className="h-12 flex items-center">
                                <span
                                    className="text-xl md:text-2xl font-medium font-[family-name:var(--font-prompt)]"
                                    style={{ color: "var(--foreground-muted)" }}
                                >
                                    {displayedText}
                                    <span
                                        className="inline-block w-0.5 h-6 ml-1 animate-pulse"
                                        style={{ backgroundColor: "var(--gold)" }}
                                    />
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <p
                            className="text-lg max-w-lg leading-relaxed font-[family-name:var(--font-sarabun)] fade-in fade-in-delay-1"
                            style={{ color: "var(--foreground-muted)" }}
                        >
                            {profile.bio}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 fade-in fade-in-delay-2">
                            <Link
                                href="/performance"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all btn-gold font-[family-name:var(--font-sarabun)]"
                            >
                                ดู PA Performance
                                <ChevronRight size={20} />
                            </Link>
                            <a
                                href="#about"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium border-2 transition-all hover:bg-gray-50 font-[family-name:var(--font-sarabun)]"
                                style={{
                                    borderColor: "var(--royal-blue)",
                                    color: "var(--royal-blue)"
                                }}
                            >
                                เกี่ยวกับ{profile.nameTH.split(" ")[0]}
                            </a>
                        </div>
                    </div>

                    {/* Right Content - Image & Stats */}
                    <div className="relative fade-in fade-in-delay-3">
                        {/* Profile Image */}
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            <div
                                className="absolute inset-0 rounded-3xl transform rotate-6"
                                style={{
                                    background: `linear-gradient(135deg, var(--gold-light), var(--gold-dark))`
                                }}
                            />
                            <div
                                className="absolute inset-0 rounded-3xl transform -rotate-3"
                                style={{
                                    background: `linear-gradient(135deg, var(--royal-blue-light), var(--royal-blue-dark))`
                                }}
                            />
                            <div
                                className="relative rounded-3xl overflow-hidden border-4 bg-gray-100 flex items-center justify-center"
                                style={{
                                    borderColor: "var(--gold)",
                                    aspectRatio: "1/1"
                                }}
                            >
                                {profile.imageUrl ? (
                                    profile.imageUrl.startsWith("data:") ? (
                                        // Data URL (base64 from cropped image) - use unoptimized
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={profile.imageUrl}
                                            alt={profile.nameTH}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        // External URL - use Next.js Image
                                        <Image
                                            src={profile.imageUrl}
                                            alt={profile.nameTH}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    )
                                ) : (
                                    <div className="text-center p-8">
                                        <FlaskConical
                                            size={80}
                                            className="mx-auto mb-4"
                                            style={{ color: "var(--royal-blue)" }}
                                        />
                                        <p
                                            className="text-lg font-medium font-[family-name:var(--font-sarabun)]"
                                            style={{ color: "var(--foreground-muted)" }}
                                        >
                                            รูปโปรไฟล์{profile.nameTH.split(" ")[0]}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="glass rounded-xl p-4 text-center transition-transform hover:scale-105"
                                >
                                    <div
                                        className="flex justify-center mb-2"
                                        style={{ color: "var(--gold)" }}
                                    >
                                        {iconMap[stat.icon] || <Star size={24} />}
                                    </div>
                                    <div
                                        className="text-xl font-bold font-[family-name:var(--font-prompt)]"
                                        style={{ color: "var(--royal-blue)" }}
                                    >
                                        {stat.value}
                                    </div>
                                    <div
                                        className="text-sm font-[family-name:var(--font-sarabun)]"
                                        style={{ color: "var(--foreground-muted)" }}
                                    >
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
