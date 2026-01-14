// ========================================
// Kru Pongdee Digital PA Portfolio
// TypeScript Interfaces & Types
// ========================================

// Model for a Fiscal Year (e.g., "2568")
export interface FiscalYear {
    id: string; // "2568", "2569"
    isActive: boolean; // Only one year is active at a time
    themeColor?: string; // Optional: change theme per year
    createdAt?: Date;
    updatedAt?: Date;
}

// Category type for PA Tasks
export type PACategory = "learning" | "support" | "self_dev" | "challenge";

// Model for Evidence Files (stored in Firebase Storage)
export interface EvidenceFile {
    id?: string;
    name: string; // "ProjectReport.pdf"
    url: string; // Download URL
    type: "image" | "document" | "video";
    uploadedAt?: Date;
}

// Chart Data for visualization
export interface ChartDataPoint {
    label: string;      // "O-NET คณิตฯ"
    value: number;      // 75.5
    maxValue?: number;  // 100 (for progress bars)
    color?: string;     // "#10b981"
}

export interface VisualizationData {
    chartType: "bar" | "pie" | "progress" | "none";
    chartTitle?: string;
    dataPoints: ChartDataPoint[];
}

// Rich Media Item - รองรับ image, video, YouTube
export interface RichMediaItem {
    id: string;
    type: "image" | "video" | "youtube";
    title?: string;           // หัวข้อ/caption
    description?: string;     // คำอธิบายเพิ่มเติม
    url: string;              // URL ของ file หรือ YouTube
    youtubeId?: string;       // สำหรับ YouTube (extracted from URL)
    thumbnailUrl?: string;    // thumbnail สำหรับ video
    order: number;            // ลำดับการแสดงผล
}

// Model for a PA Task (Inside a specific year)
// ตารางส่วนที่ 2 มี 4 คอลัมน์:
// 1. ลักษณะงาน (category + indicatorCode + title)
// 2. งาน (Tasks) = agreement
// 3. ผลลัพธ์ (Outcomes) = outcomes
// 4. ตัวชี้วัด (Indicators) = indicators
export interface PATask {
    id: string;
    year: string; // "2568"
    category: PACategory;
    indicatorCode: string; // e.g., "2.1.1", "2.2.3"
    title: string; // e.g., "สร้างและหรือพัฒนาหลักสูตร"
    agreement: string; // งาน (Tasks) ที่จะดำเนินการพัฒนาตามข้อตกลง
    outcomes: string; // ผลลัพธ์ (Outcomes) ที่คาดหวังให้เกิดขึ้นกับผู้เรียน
    indicators: string; // ตัวชี้วัด (Indicators) ที่แสดงถึงการเปลี่ยนแปลง
    actualResults: string; // ผลการปฏิบัติงานจริง (สำหรับรายงานผล)
    evidenceFiles: EvidenceFile[]; // Array of file links
    visualization?: VisualizationData; // Chart data for visualization
    mediaGallery?: EvidenceFile[]; // Inline images/videos for display
    richMedia?: RichMediaItem[]; // Rich media content (images, videos, YouTube)
    order?: number; // Display order
    createdAt?: Date;
    updatedAt?: Date;
    // For Challenge category only
    challengeData?: ChallengeData;
}

// Structured data for Challenge (ประเด็นท้าทาย)
export interface ChallengeData {
    // 1. ชื่อเรื่อง
    titleTH: string;
    titleEN: string;

    // 2. สภาพปัญหา (4 หัวข้อย่อย)
    problem: {
        context: string;           // บริบทและความสำคัญของปัญหา
        limitations: string;       // แนวทางการแก้ไขปัญหาทั่วไปและข้อจำกัด
        approach: string;          // แนวทางการจัดการเรียนรู้ตามประเด็นท้าทาย
        objectives: string;        // วัตถุประสงค์และสิ่งที่คาดหวัง
    };

    // 3. วิธีการดำเนินการ (5 หัวข้อย่อย)
    methodology: {
        researchDesign: string;    // รูปแบบการวิจัย
        population: string;        // ประชากรและกลุ่มเป้าหมาย
        instruments: string;       // เครื่องมือที่ใช้ในการวิจัย
        procedures: string;        // ขั้นตอนการดำเนินการ
        dataAnalysis: string;      // การวิเคราะห์ข้อมูล
    };

    // 4. ผลลัพธ์ที่คาดหวัง (2 หัวข้อย่อย)
    outcomes: {
        quantitative: string;      // ผลลัพธ์เชิงปริมาณ
        qualitative: string;       // ผลลัพธ์เชิงคุณภาพ
    };
}

// Model for Student Outcomes (Stats)
export interface StudentOutcome {
    id?: string;
    year: string;
    title: string; // "O-NET Score"
    value: number; // 75.5
    comparisonValue?: number; // Previous year score
    unit?: string; // "%" or "points"
}

// Model for Profile/About Section
export interface Profile {
    // Personal Info
    nameTH: string;           // "ครูปองดี ชัยจันทรา"
    nameEN: string;           // "Pongdee Chaijachanda"
    position: string;         // "ครู" (ตำแหน่ง)
    academicRank?: string;    // "ชำนาญการ" (วิทยฐานะ)
    department: string;       // "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี"
    subject: string;          // "เคมี"
    bio: string;              // คำอธิบายสั้น
    imageUrl?: string;        // รูปโปรไฟล์

    // Contact Info
    email?: string;
    phone?: string;
    school?: string;          // ชื่อโรงเรียน
    address?: string;         // ที่อยู่/จังหวัด

    // Social Links
    socialLinks?: {
        facebook?: string;
        linkedin?: string;
        website?: string;
        line?: string;
    };

    // Education & Career (Legacy - kept for backward compatibility)
    education?: string[];     // ["ป.ตรี วิทยาศาสตร์เคมี", "ป.โท การศึกษา"]
    career?: string[];        // ["เริ่มบรรจุ พ.ศ. 25XX", "ปัจจุบัน: ชำนาญการ"]

    // Structured Education & Career (New - hierarchical)
    structuredEducation?: EducationItem[];
    structuredCareer?: CareerItem[];

    // Current Workload (Legacy - kept for backward compatibility)
    currentSubjects?: string; // "สอนเคมี ม.ปลาย"
    teachingHours?: string;   // "18.33 คาบ/สัปดาห์"
    currentSemester?: string; // "ภาคเรียนที่ 2/2568"

    // Dual Semester Workload (New)
    // For PA year 69: semester2 = 2/2568, semester1 = 1/2569
    workloadSemester2?: SemesterWorkload; // แสดงก่อน (Legacy)
    workloadSemester1?: SemesterWorkload; // แสดงหลัง (Legacy)

    // Structured Workload (New - 4 work types)
    structuredWorkloadSemester1?: StructuredSemesterWorkload;
    structuredWorkloadSemester2?: StructuredSemesterWorkload;
}

// Legacy Workload data for each semester (kept for backward compatibility)
export interface SemesterWorkload {
    semesterLabel: string;    // "ภาคเรียนที่ 2/2568"
    subjects: string;         // "สอนเคมี ม.ปลาย"
    teachingHours: string;    // "18.33 คาบ/สัปดาห์"
}

// ============================================
// Structured Workload Types (New - 4 work categories)
// ============================================

// รายวิชาที่สอน
export interface TeachingSubject {
    subjectCode: string;      // รหัสวิชา เช่น "ว30221"
    subjectName: string;      // ชื่อรายวิชา เช่น "เคมี 1"
    level?: string;           // ระดับชั้น เช่น "ม.4"
    periodsPerWeek: number;   // คาบ/สัปดาห์
    // Auto-calculated: hoursPerWeek = periodsPerWeek * 50/60 = periodsPerWeek * 0.833
}

// งานประเภทอื่น (ไม่ใช่สอน)
export interface OtherWorkItem {
    description: string;      // รายละเอียดงาน
    hoursPerWeek: number;     // ชั่วโมง/สัปดาห์
}

// ข้อมูลภาระงานภาคเรียน (Structured - 4 ประเภท)
export interface StructuredSemesterWorkload {
    semesterLabel: string;                    // "ภาคเรียนที่ 2/2568"

    // 1. ชั่วโมงสอนตามตารางสอน
    teachingSubjects: TeachingSubject[];

    // 2. งานส่งเสริมและสนับสนุนการจัดการเรียนรู้
    supportWork: OtherWorkItem[];

    // 3. งานพัฒนาคุณภาพการจัดการศึกษาของสถานศึกษา
    developmentWork: OtherWorkItem[];

    // 4. งานตอบสนองนโยบายและจุดเน้น
    policyWork: OtherWorkItem[];
}

// Constants for workload calculation
export const MINUTES_PER_PERIOD = 50;
export const HOURS_PER_PERIOD = MINUTES_PER_PERIOD / 60; // 0.833...

// Education Level Type
export type EducationLevel = "junior_high" | "senior_high" | "bachelor" | "master" | "doctoral";

// Structured Education Item
export interface EducationItem {
    level: EducationLevel;
    year: string;             // "พ.ศ. 2545"
    degree: string;           // "ประกาศนียบัตรมัธยมศึกษาตอนต้น"
    major?: string;           // "สาขาวิชาเคมี"
    institution: string;      // "โรงเรียนศรีสะเกษวิทยาลัย"
    location?: string;        // "จังหวัดศรีสะเกษ"
    notes?: string;           // หมายเหตุเพิ่มเติม (รองรับหลายบรรทัด)
}

// Structured Career Item (Timeline)
export interface CareerItem {
    startDate: string;        // "25 กันยายน พ.ศ. 2560"
    endDate?: string;         // "25 กันยายน พ.ศ. 2562" หรือ "ปัจจุบัน"
    position: string;         // "ครู ตำแหน่ง ครูผู้ช่วย"
    rank?: string;            // "อันดับ ค.ศ.1"
    institution: string;      // "โรงเรียนบรบือวิทยาคาร"
    department?: string;      // "สำนักงานเขตพื้นที่การศึกษามัธยมศึกษา"
    notes?: string;           // หมายเหตุ
}

// Education Level Labels (Thai)
export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
    junior_high: "มัธยมศึกษาตอนต้น",
    senior_high: "มัธยมศึกษาตอนปลาย",
    bachelor: "ปริญญาตรี",
    master: "ปริญญาโท",
    doctoral: "ปริญญาเอก"
};

// Education Level Colors
export const EDUCATION_LEVEL_COLORS: Record<EducationLevel, { bg: string; text: string; icon: string }> = {
    junior_high: { bg: "#E3F2FD", text: "#1565C0", icon: "🏫" },
    senior_high: { bg: "#E8EAF6", text: "#3949AB", icon: "🎓" },
    bachelor: { bg: "#E8F5E9", text: "#2E7D32", icon: "📚" },
    master: { bg: "#FFF3E0", text: "#E65100", icon: "📜" },
    doctoral: { bg: "#FFF8E1", text: "#F9A825", icon: "🎖️" }
};

// Hero Stats for homepage
export interface HeroStat {
    icon: string;   // "users" | "book" | "award" | "flask"
    value: string;  // "500+"
    label: string;  // "นักเรียนสอน"
}

// Model for Site Settings (Admin Configurable)
export interface SiteSettings {
    // Site Identity
    siteName: string;           // "Kru Pongdee | Digital PA Portfolio"
    siteDescription: string;    // SEO description
    siteKeywords: string[];     // ["PA Portfolio", "ครูปองดี"]
    logoText: string;           // "Kru.P"

    // Profile Data
    profile: Profile;

    // Hero Section
    heroSlogans: string[];      // ["ครูมืออาชีพ", "นวัตกรรมการศึกษา"]
    heroStats: HeroStat[];

    // Footer
    copyrightText?: string;     // "© 2568 Kru Pongdee..."
    developerCredit?: string;   // "พัฒนาด้วย ❤️ โดยครูปองดี"
}

// Navigation Item Type
export interface NavItem {
    label: string;
    href: string;
    icon?: string;
}

// Tab configuration for PA categories
export interface CategoryTab {
    id: PACategory;
    label: string;
    labelTh: string;
    icon: string;
}

// Constants
export const PA_CATEGORIES: CategoryTab[] = [
    { id: "learning", label: "Learning", labelTh: "การจัดการเรียนรู้", icon: "BookOpen" },
    { id: "support", label: "Support", labelTh: "การส่งเสริมและสนับสนุน", icon: "HeartHandshake" },
    { id: "self_dev", label: "Self-Dev", labelTh: "การพัฒนาตนเองและวิชาชีพ", icon: "TrendingUp" },
    { id: "challenge", label: "Challenge", labelTh: "ประเด็นท้าทาย", icon: "Target" },
];

// Pre-defined PA Indicators
export interface PAIndicator {
    code: string;
    title: string;
    category: PACategory;
}

export const PA_INDICATORS: PAIndicator[] = [
    // Learning (2.1.x)
    { code: "2.1.1", title: "สร้างและหรือพัฒนาหลักสูตร", category: "learning" },
    { code: "2.1.2", title: "ออกแบบการจัดการเรียนรู้", category: "learning" },
    { code: "2.1.3", title: "จัดกิจกรรมการเรียนรู้", category: "learning" },
    { code: "2.1.4", title: "สร้างและหรือพัฒนาสื่อ นวัตกรรม และเทคโนโลยี", category: "learning" },
    { code: "2.1.5", title: "วัดและประเมินผล", category: "learning" },
    { code: "2.1.6", title: "ศึกษา วิเคราะห์ และสังเคราะห์ เพื่อแก้ปัญหาหรือพัฒนาการเรียนรู้", category: "learning" },
    { code: "2.1.7", title: "จัดบรรยากาศที่เอื้อต่อการเรียนรู้", category: "learning" },
    { code: "2.1.8", title: "อบรมและพัฒนาคุณลักษณะที่ดีของผู้เรียน", category: "learning" },
    // Support (2.2.x)
    { code: "2.2.1", title: "จัดทำข้อมูลสารสนเทศของผู้เรียนและรายวิชา", category: "support" },
    { code: "2.2.2", title: "ดำเนินการตามระบบดูแลช่วยเหลือผู้เรียน", category: "support" },
    { code: "2.2.3", title: "ปฏิบัติงานวิชาการ และงานอื่น ๆ ของสถานศึกษา", category: "support" },
    { code: "2.2.4", title: "ประสานความร่วมมือกับผู้ปกครอง ภาคีเครือข่าย", category: "support" },
    // Self Development (2.3.x)
    { code: "2.3.1", title: "พัฒนาตนเองอย่างเป็นระบบและต่อเนื่อง", category: "self_dev" },
    { code: "2.3.2", title: "มีส่วนร่วม และเป็นผู้นำในการแลกเปลี่ยนเรียนรู้ทางวิชาชีพ (PLC)", category: "self_dev" },
    { code: "2.3.3", title: "นำความรู้ ความสามารถ ทักษะที่ได้จากการพัฒนาตนเองและวิชาชีพมาใช้", category: "self_dev" },
    // Challenge
    { code: "challenge-1", title: "ประเด็นท้าทาย เรื่องที่ 1", category: "challenge" },
    { code: "challenge-2", title: "ประเด็นท้าทาย เรื่องที่ 2 (Optional)", category: "challenge" },
];

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
