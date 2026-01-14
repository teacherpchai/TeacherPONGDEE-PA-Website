"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await login(email, password);
            router.push("/admin");
        } catch (err: any) {
            console.error("Login failed:", err);
            setError("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4 molecular-pattern"
            style={{ backgroundColor: "var(--background-secondary)" }}
        >
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span
                        className="text-4xl font-bold font-[family-name:var(--font-prompt)]"
                        style={{ color: "var(--gold)" }}
                    >
                        Kru.P
                    </span>
                    <p
                        className="mt-2 text-lg font-[family-name:var(--font-sarabun)]"
                        style={{ color: "var(--royal-blue)" }}
                    >
                        Admin Panel
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1
                        className="text-2xl font-semibold mb-6 text-center font-[family-name:var(--font-prompt)]"
                        style={{ color: "var(--royal-blue)" }}
                    >
                        เข้าสู่ระบบ
                    </h1>

                    {/* Error Message */}
                    {error && (
                        <div
                            className="mb-6 p-4 rounded-xl flex items-center gap-3"
                            style={{ backgroundColor: "#FEE2E2" }}
                        >
                            <AlertCircle size={20} style={{ color: "#DC2626" }} />
                            <p
                                className="text-sm font-[family-name:var(--font-sarabun)]"
                                style={{ color: "#DC2626" }}
                            >
                                {error}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-2 font-[family-name:var(--font-sarabun)]"
                                style={{ color: "var(--foreground)" }}
                            >
                                อีเมล
                            </label>
                            <div className="relative">
                                <Mail
                                    size={20}
                                    className="absolute left-4 top-1/2 -translate-y-1/2"
                                    style={{ color: "var(--foreground-muted)" }}
                                />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none font-[family-name:var(--font-sarabun)]"
                                    style={{
                                        borderColor: "var(--background-secondary)",
                                        color: "var(--foreground)"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium mb-2 font-[family-name:var(--font-sarabun)]"
                                style={{ color: "var(--foreground)" }}
                            >
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <Lock
                                    size={20}
                                    className="absolute left-4 top-1/2 -translate-y-1/2"
                                    style={{ color: "var(--foreground-muted)" }}
                                />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors focus:outline-none font-[family-name:var(--font-sarabun)]"
                                    style={{
                                        borderColor: "var(--background-secondary)",
                                        color: "var(--foreground)"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all btn-royal disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-sarabun)]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    กำลังเข้าสู่ระบบ...
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    เข้าสู่ระบบ
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back Link */}
                    <div className="mt-6 text-center">
                        <a
                            href="/"
                            className="text-sm transition-colors hover:underline font-[family-name:var(--font-sarabun)]"
                            style={{ color: "var(--foreground-muted)" }}
                        >
                            ← กลับหน้าหลัก
                        </a>
                    </div>
                </div>

                {/* Footer Note */}
                <p
                    className="mt-8 text-center text-sm font-[family-name:var(--font-sarabun)]"
                    style={{ color: "var(--foreground-muted)" }}
                >
                    เฉพาะผู้ดูแลระบบเท่านั้น
                </p>
            </div>
        </main>
    );
}
