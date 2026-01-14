"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import ProfileEducationCard from "@/components/ProfileEducationCard";
import ProfileCareerCard from "@/components/ProfileCareerCard";
import ProfileWorkloadCard from "@/components/ProfileWorkloadCard";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function Home() {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--royal-blue)]"></div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  const { profile } = settings;

  // Get first name for display
  const firstName = profile.nameTH ? profile.nameTH.split(" ")[0] : "ครู";

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />

      {/* About Section */}
      <section
        id="about"
        className="py-20"
        style={{ backgroundColor: "var(--background-secondary)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-prompt)]"
              style={{ color: "var(--royal-blue)" }}
            >
              เกี่ยวกับ <span style={{ color: "var(--gold)" }}>{firstName}</span>
            </h2>
            <p
              className="mt-4 text-lg font-[family-name:var(--font-sarabun)]"
              style={{ color: "var(--foreground-muted)" }}
            >
              ประสบการณ์และความมุ่งมั่นในการพัฒนาการศึกษา
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Education Card - Premium Component */}
            <ProfileEducationCard
              education={profile.structuredEducation}
              legacyEducation={profile.education}
              isLoading={loading}
            />

            {/* Career Card - Premium Component */}
            <ProfileCareerCard
              career={profile.structuredCareer}
              legacyCareer={profile.career}
              isLoading={loading}
            />

            {/* Workload Card - Premium Component */}
            <ProfileWorkloadCard
              profile={profile}
              isLoading={loading}
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
