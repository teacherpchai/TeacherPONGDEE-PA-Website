"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileEducationCard from "@/components/ProfileEducationCard";
import ProfileCareerCard from "@/components/ProfileCareerCard";
import ProfileWorkloadCard from "@/components/ProfileWorkloadCard";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function AboutPage() {
    const { settings, loading } = useSiteSettings();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--royal-blue)]"></div>
            </div>
        );
    }

    if (!settings) {
        return null; // Or a dedicated error/empty state
    }

    const { profile } = settings;
    const firstName = profile.nameTH ? profile.nameTH.split(" ")[0] : "ครู";

    return (
        <main className="min-h-screen bg-[var(--background-secondary)]">
            <Navbar />

            <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-12 fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-prompt)] text-[var(--royal-blue)] mb-4">
                        เกี่ยวกับ <span className="text-[var(--gold)]">{firstName}</span>
                    </h1>
                    <p className="text-xl font-[family-name:var(--font-sarabun)] text-[var(--foreground-muted)] max-w-2xl mx-auto">
                        ประสบการณ์และความมุ่งมั่นในการพัฒนาการศึกษา
                    </p>
                </div>

                {/* Top Row: Education & Career */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 fade-in fade-in-delay-1 mb-8">
                    {/* Education Card (1/3 width on large screens) */}
                    <div className="lg:col-span-4 flex flex-col h-full">
                        <ProfileEducationCard
                            education={profile.structuredEducation}
                            legacyEducation={profile.education}
                            isLoading={loading}
                        />
                    </div>

                    {/* Career Card (2/3 width on large screens) */}
                    <div className="lg:col-span-8 flex flex-col h-full">
                        <ProfileCareerCard
                            career={profile.structuredCareer}
                            legacyCareer={profile.career}
                            isLoading={loading}
                        />
                    </div>
                </div>

                {/* Bottom Row: Workload (Full Width) */}
                <div className="fade-in fade-in-delay-2">
                    <ProfileWorkloadCard
                        profile={profile}
                        isLoading={loading}
                    />
                </div>
            </div>

            <Footer />
        </main>
    );
}
