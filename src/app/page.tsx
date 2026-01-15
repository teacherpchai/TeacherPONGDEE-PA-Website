"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
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

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />

      <Footer />
    </main>
  );
}
