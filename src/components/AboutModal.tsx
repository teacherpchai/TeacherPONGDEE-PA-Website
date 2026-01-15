"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ProfileEducationCard from "@/components/ProfileEducationCard";
import ProfileCareerCard from "@/components/ProfileCareerCard";
import ProfileWorkloadCard from "@/components/ProfileWorkloadCard";
import { Profile } from "@/types";

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile;
    loading: boolean;
}

export default function AboutModal({ isOpen, onClose, profile, loading }: AboutModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    // Handle animation state
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen) {
            // Using requestAnimationFrame to ensure we don't trigger immediate re-render during commit phase
            requestAnimationFrame(() => {
                setIsVisible(true);
                document.body.style.overflow = "hidden"; // Prevent background scrolling
            });
        } else {
            timer = setTimeout(() => setIsVisible(false), 300); // Wait for transition
            document.body.style.overflow = "unset";
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const firstName = profile?.nameTH ? profile.nameTH.split(" ")[0] : "ครู";

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full max-w-6xl max-h-[90vh] bg-[#F8FAFC] rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-transform duration-300 transform ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-prompt)] text-[var(--royal-blue)]">
                        เกี่ยวกับ <span className="text-[var(--gold)]">{firstName}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="text-center mb-8">
                        <p className="text-lg font-[family-name:var(--font-sarabun)] text-[var(--foreground-muted)]">
                            ประสบการณ์และความมุ่งมั่นในการพัฒนาการศึกษา
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Education Card */}
                        <ProfileEducationCard
                            education={profile?.structuredEducation}
                            legacyEducation={profile?.education}
                            isLoading={loading}
                        />

                        {/* Career Card */}
                        <ProfileCareerCard
                            career={profile?.structuredCareer}
                            legacyCareer={profile?.career}
                            isLoading={loading}
                        />

                        {/* Workload Card */}
                        <ProfileWorkloadCard
                            profile={profile}
                            isLoading={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
