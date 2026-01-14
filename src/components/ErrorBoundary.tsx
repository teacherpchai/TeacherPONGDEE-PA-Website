"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console (could send to analytics in production)
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
        }

        return this.props.children;
    }
}

// Default error fallback UI
function ErrorFallback({
    error,
    onRetry
}: {
    error: Error | null;
    onRetry: () => void;
}) {
    return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}
                >
                    <AlertTriangle size={40} className="text-red-500" />
                </div>

                {/* Message */}
                <h2
                    className="text-2xl font-bold mb-2 font-[family-name:var(--font-prompt)]"
                    style={{ color: "var(--royal-blue)" }}
                >
                    เกิดข้อผิดพลาด
                </h2>
                <p className="text-gray-600 mb-6">
                    ขออภัย เกิดข้อผิดพลาดในการแสดงผลหน้านี้
                    กรุณาลองใหม่อีกครั้ง หรือกลับไปหน้าหลัก
                </p>

                {/* Error details (dev only) */}
                {process.env.NODE_ENV === "development" && error && (
                    <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                        <p className="text-xs font-mono text-red-600 break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                                 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw size={18} />
                        ลองใหม่
                    </button>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                                 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        <Home size={18} />
                        หน้าหลัก
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Simpler inline error display
export function InlineError({
    message = "เกิดข้อผิดพลาด",
    onRetry
}: {
    message?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700 flex-1">{message}</span>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                >
                    ลองใหม่
                </button>
            )}
        </div>
    );
}

export default ErrorBoundary;
