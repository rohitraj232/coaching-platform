
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiTrash2, FiX, FiAlertTriangle, FiLoader } from "react-icons/fi";

type Props = {
    quizId: string;
    quizTitle: string;
};

export default function DeleteQuizButton({
    quizId,
    quizTitle,
}: Props) {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const canDelete = confirmTitle.trim() === quizTitle.trim();

    async function handleDelete() {
        if (!canDelete || loading) return;

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/admin/quizzes/${quizId}`,
                {
                    method: "DELETE",
                    cache: "no-store",
                }
            );

            const responseText = await response.text();

            let result;

            try {
                result = JSON.parse(responseText);
            } catch {
                console.error("Delete API returned non-JSON:", {
                    status: response.status,
                    url: response.url,
                    contentType: response.headers.get("content-type"),
                    response: responseText.slice(0, 500),
                });

                throw new Error(
                    `API returned HTML instead of JSON. HTTP Status: ${response.status}. Check the browser console and server terminal.`
                );
            }

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to delete quiz.");
            }

            setIsOpen(false);
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setConfirmTitle("");
                    setError("");
                    setIsOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
                <FiTrash2 size={14} />
                Delete
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    <FiAlertTriangle size={22} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Delete Quiz Permanently?
                                    </h2>
                                    <p className="text-xs text-red-600">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                disabled={loading}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
                            <p className="text-sm font-semibold text-slate-800">
                                {quizTitle}
                            </p>

                            <p className="mt-2 text-xs leading-5 text-red-700">
                                All questions, Hindi and English translations, answer
                                keys, student attempts, saved answers, results, and
                                leaderboard records associated with this quiz will be
                                permanently deleted.
                            </p>
                        </div>

                        <div className="mt-5">
                            <label
                                htmlFor={`confirm-title-${quizId}`}
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Type the quiz title to confirm deletion
                            </label>

                            <input
                                id={`confirm-title-${quizId}`}
                                type="text"
                                value={confirmTitle}
                                onChange={(e) => setConfirmTitle(e.target.value)}
                                placeholder="Enter quiz title"
                                disabled={loading}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                            />
                        </div>

                        {error && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                disabled={loading}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={!canDelete || loading}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {loading ? (
                                    <>
                                        <FiLoader className="animate-spin" size={16} />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 size={16} />
                                        Delete Permanently
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
