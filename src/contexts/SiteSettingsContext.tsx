"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SiteSettings, Profile } from "@/types";
import { firebaseService } from "@/lib/firebaseService";

interface SiteSettingsContextType {
    settings: SiteSettings | null;
    profile: Profile | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
    settings: null,
    profile: null,
    loading: true,
    refreshSettings: async () => { },
});

export const SiteSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const data = await firebaseService.getSiteSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            // Fallback to avoid null settings
            setSettings({
                siteName: "Digital PA Portfolio",
                siteDescription: "Digital Performance Agreement Portfolio",
                siteKeywords: [],
                logoText: "PA",
                profile: {
                    nameTH: "ชื่อ-นามสกุล",
                    nameEN: "Name Surname",
                    position: "ครูผู้ช่วย",
                    department: "",
                    subject: "",
                    bio: "",
                },
                heroSlogans: [],
                heroStats: [],
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SiteSettingsContext.Provider
            value={{
                settings,
                profile: settings?.profile || null,
                loading,
                refreshSettings: fetchSettings,
            }}
        >
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
