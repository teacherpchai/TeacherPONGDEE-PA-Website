// ========================================
// Firebase API Service
// Replaces googleApi.ts
// ========================================

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    addDoc,
    orderBy,
    Timestamp
} from "firebase/firestore";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "firebase/storage";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db, storage, auth } from "@/lib/firebase";
import {
    PATask,
    Profile,
    EvidenceFile,
    SiteSettings,
    FiscalYear
} from "@/types";

// ============ Types ============
export interface YearData {
    year: string;
    isActive: boolean;
}

// ============ Auth Functions ============
// Handled by AuthContext largely, but helper here for login page
export async function login(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function logout() {
    await signOut(auth);
}

// ============ Years Functions ============

export async function getYears(): Promise<FiscalYear[]> {
    try {
        const q = query(collection(db, "fiscal_years"), orderBy("year", "desc"));
        const querySnapshot = await getDocs(q);
        const years: FiscalYear[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            years.push({
                id: doc.id,
                isActive: data.isActive,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
                year: data.year || doc.id // Ensure year property exists if using it
            } as FiscalYear & { year: string }); // Temporary intersection to satisfy local usage if needed, but FiscalYear in types has id, does it have year? No, it has id as year.
            // Wait, FiscalYear in types.ts is:
            // interface FiscalYear { id: string; isActive: boolean; themeColor?: string; ... }
            // But YearData was { year: string, isActive: boolean }
            // The Admin page uses `year.year` which implies FiscalYear type might be expected to have `year` property, OR they are treating `id` as `year`.
            // Let's check Admin page: `setSelectedYear(year.year)` -> implies `year` property.
            // But FiscalYear interface only has `id`.
            // LET'S CHECK types/index.ts AGAIN.
        });
        return years;
    } catch (error) {
        console.error("Error fetching years:", error);
        return [];
    }
}

export async function addYear(yearId: string, isActive: boolean = false): Promise<string | null> {
    try {
        // If setting active, deactivate others (optional logic, can be enhanced)
        if (isActive) {
            // Logic to deactivate others could go here or be processed by Cloud Functions
        }

        await setDoc(doc(db, "fiscal_years", yearId), {
            id: yearId,
            year: yearId,
            isActive: isActive,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        return yearId;
    } catch (error) {
        console.error("Error adding year:", error);
        return null;
    }
}

// ============ PA Records Functions ============

export async function getPARecords(year: string): Promise<PATask[]> {
    try {
        const q = query(collection(db, "pa_tasks"), where("year", "==", year));
        const querySnapshot = await getDocs(q);
        const tasks: PATask[] = [];
        querySnapshot.forEach((d) => {
            tasks.push({ id: d.id, ...d.data() } as PATask);
        });

        // Client-side sort by order or indicatorCode
        tasks.sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
            return a.indicatorCode.localeCompare(b.indicatorCode);
        });

        return tasks;
    } catch (error) {
        console.error("Error fetching PA records:", error);
        return [];
    }
}

export async function addPARecord(record: Omit<PATask, "id">): Promise<string | null> {
    try {
        const docRef = await addDoc(collection(db, "pa_tasks"), {
            ...record,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding PA record:", error);
        return null;
    }
}

export async function updatePARecord(id: string, updates: Partial<PATask>): Promise<boolean> {
    try {
        const docRef = doc(db, "pa_tasks", id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });
        return true;
    } catch (error) {
        console.error("Error updating PA record:", error);
        return false;
    }
}

export async function deletePARecord(id: string): Promise<boolean> {
    try {
        await deleteDoc(doc(db, "pa_tasks", id));
        return true;
    } catch (error) {
        console.error("Error deleting PA record:", error);
        return false;
    }
}

// ============ Site Settings (Profile) Functions ============

const SETTINGS_DOC_ID = "global";

// Default site settings
const defaultSiteSettings: SiteSettings = {
    siteName: "Digital PA Portfolio",
    siteDescription: "Digital Performance Agreement Portfolio",
    siteKeywords: ["PA Portfolio", "Teacher Portfolio"],
    logoText: "PA",
    profile: {
        nameTH: "ชื่อ-นามสกุล",
        nameEN: "Name Surname",
        position: "ครูผู้ช่วย",
        department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
        subject: "วิชา",
        bio: "คำอธิบายสั้นๆ เกี่ยวกับตัวเอง",
    },
    heroSlogans: ["ครูมืออาชีพ", "นวัตกรรมการศึกษา"],
    heroStats: [
        { icon: "users", value: "100+", label: "นักเรียนสอน" },
        { icon: "book", value: "18", label: "คาบสอน/สัปดาห์" },
    ],
};

export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const docRef = doc(db, "settings", SETTINGS_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as SiteSettings;
        } else {
            // Initialize if not exists, but only if we are likely an admin (authed)
            // Otherwise just return defaults to avoid "insufficient permissions" error
            if (auth.currentUser) {
                try {
                    await setDoc(docRef, defaultSiteSettings);
                } catch (writeErr) {
                    console.warn("Auto-creation of settings failed (expected for public users):", writeErr);
                }
            }
            return defaultSiteSettings;
        }
    } catch (error) {
        console.error("Error fetching site settings:", error);
        return defaultSiteSettings;
    }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
    try {
        const docRef = doc(db, "settings", SETTINGS_DOC_ID);
        await setDoc(docRef, settings, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating site settings:", error);
        return false;
    }
}

export async function getProfile(): Promise<Profile | null> {
    const settings = await getSiteSettings();
    return settings.profile || null;
}

// ============ File Upload ============

export async function uploadFile(
    file: File,
    folder: string = "uploads"
): Promise<string | null> {
    try {
        const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTask.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        return null;
    }
}

export async function uploadEvidenceFile(
    file: File,
    year: string,
    taskId: string
): Promise<EvidenceFile | null> {
    const url = await uploadFile(file, `evidence/${year}/${taskId}`);
    if (!url) return null;

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    let fileType: "image" | "document" | "video" = "document";

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
        fileType = "image";
    } else if (["mp4", "webm", "mov"].includes(extension)) {
        fileType = "video";
    }

    return {
        name: file.name,
        url: url,
        type: fileType,
        uploadedAt: new Date() // Helper adds this locally, Firestore will store pure JSON
    };
}

// For compatibility alias
export const firebaseService = {
    login,
    logout,
    getYears,
    addYear,
    getPARecords,
    addPARecord,
    updatePARecord,
    deletePARecord,
    getSiteSettings,
    updateSiteSettings,
    uploadFile,
    uploadEvidenceFile,
    getProfile
};
