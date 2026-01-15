"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import AboutModal from "@/components/AboutModal";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function Home() {
  const { settings, loading } = useSiteSettings();
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

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

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection onOpenAbout={() => setIsAboutModalOpen(true)} />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        profile={profile}
        loading={loading}
      />

      <Footer />
    </main>
  );
}
