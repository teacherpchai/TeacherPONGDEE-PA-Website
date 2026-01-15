"use client";

import { useState } from "react";
import { doc, setDoc, writeBatch, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import migrationData from "@/data/migration.json";

import { updateSiteSettings } from "@/lib/firebaseService";

export default function MigrationPage() {
    const [status, setStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
    const [log, setLog] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    const addLog = (msg: string) => setLog(prev => [...prev, msg]);

    const handleMigrate = async () => {
        if (!confirm("This will overwrite existing data. Continue?")) return;

        setStatus("running");
        setLog([]);
        setProgress(0);

        try {
            const { years, tasks, settings } = migrationData;
            const totalItems = years.length + tasks.length + (settings ? 1 : 0);
            let processed = 0;

            const updateProgress = () => {
                processed++;
                setProgress(Math.round((processed / totalItems) * 100));
            };

            // 1. Migrate Settings
            if (settings) {
                addLog("Migrating Site Settings...");
                // Handle profile separately if needed, but updateSiteSettings handles partial
                await updateSiteSettings(settings as any);
                addLog("✅ Site Settings updated.");
                updateProgress();
            }

            // 2. Migrate Years
            addLog(`Migrating ${years.length} Years...`);
            for (const year of years) {
                await setDoc(doc(db, "fiscal_years", year.id), {
                    ...year,
                    createdAt: new Date(year.createdAt || Date.now()), // Parse date string
                    updatedAt: new Date()
                });
                addLog(`✅ Year ${year.id} migrated.`);
                updateProgress();
            }

            // 3. Migrate Tasks
            addLog(`Migrating ${tasks.length} PA Tasks...`);
            // Use batches for tasks (limit 500)
            const batchSize = 400;
            for (let i = 0; i < tasks.length; i += batchSize) {
                const batch = writeBatch(db);
                const chunk = tasks.slice(i, i + batchSize);

                chunk.forEach((task) => {
                    const docRef = doc(db, "pa_tasks", task.id);
                    batch.set(docRef, {
                        ...task,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                });

                await batch.commit();
                addLog(`✅ Batch of ${chunk.length} tasks committed.`);
                // Update progress for chunk
                processed += chunk.length;
                setProgress(Math.round((processed / totalItems) * 100));
            }

            setStatus("completed");
            addLog("🎉 Migration Verification Completed Successfully!");

        } catch (error: any) {
            console.error(error);
            setStatus("error");
            addLog(`❌ Error: ${error.message}`);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Data Migration</h1>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Migration Summary</h2>
                <ul className="space-y-2 mb-6">
                    <li>📅 <strong>Years:</strong> {migrationData.years.length}</li>
                    <li>📝 <strong>PA Tasks:</strong> {migrationData.tasks.length}</li>
                    <li>⚙️ <strong>Settings:</strong> {migrationData.settings ? "Ready" : "Not Found"}</li>
                </ul>

                <button
                    onClick={handleMigrate}
                    disabled={status === "running"}
                    className={`px-6 py-3 rounded-lg font-bold text-white transition-colors w-full ${status === "running"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {status === "running" ? "Migrating..." : "Start Migration"}
                </button>
            </div>

            {/* Progress Bar */}
            {status !== "idle" && (
                <div className="mb-6">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-right text-sm text-gray-500 mt-1">{progress}%</div>
                </div>
            )}

            {/* Logs */}
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                {log.length === 0 ? (
                    <span className="text-gray-500">Waiting to start...</span>
                ) : (
                    log.map((line, i) => <div key={i}>{line}</div>)
                )}
            </div>
        </div>
    );
}
