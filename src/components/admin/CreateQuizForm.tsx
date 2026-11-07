"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSave } from "react-icons/fi";

type Course = {
    id: string;
    title: string;
    class_level: string;
};

type FormData = {
    courseId: string;
    title: string;
    description: string;
    durationMinutes: string;
    totalMarks: string;
    passingMarks: string;
    negativeMarking: boolean;
    negativeMarks: string;
    startAt: string;
    endAt: string;
};

const initialForm: FormData = {
    courseId: "",
    title: "",
    description: "",
    durationMinutes: "30",
    totalMarks: "100",
    passingMarks: "33",
    negativeMarking: false,
    negativeMarks: "0.25",
    startAt: "",
    endAt: "",
};

type Props = {
    courses: Course[];
};

export default function CreateQuizForm({ courses }: Props) {
    const router = useRouter();

    const [form, setForm] = useState<FormData>(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function updateField<K extends keyof FormData>(
        field: K,
        value: FormData[K]
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!form.courseId) {
            setError("Please select a course.");
            return;
        }

        if (Number(form.passingMarks) > Number(form.totalMarks)) {
            setError("Passing marks cannot exceed total marks.");
            return;
        }

        if (form.negativeMarking && Number(form.negativeMarks) <= 0) {
            setError("Please enter valid negative marks.");
            return;
        }

        const startAt = form.startAt
            ? new Date(form.startAt).toISOString()
            : null;

        const endAt = form.endAt
            ? new Date(form.endAt).toISOString()
            : null;

        if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
            setError("End date must be later than start date.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/admin/quizzes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    courseId: form.courseId,
                    title: form.title.trim(),
                    description: form.description.trim() || null,
                    durationMinutes: Number(form.durationMinutes),
                    totalMarks: Number(form.totalMarks),
                    passingMarks: Number(form.passingMarks),
                    negativeMarking: form.negativeMarking,
                    negativeMarks: form.negativeMarking
                        ? Number(form.negativeMarks)
                        : 0,
                    startAt,
                    endAt,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to create quiz.");
            }

            setSuccess("Quiz created successfully!");

            router.push("/admin/quizzes");
            router.refresh();
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
            <div>
                <label className="text-sm font-semibold text-slate-700">
                    Select Course *
                </label>

                <select
                    required
                    value={form.courseId}
                    onChange={(e) => updateField("courseId", e.target.value)}
                    className={inputClass}
                >
                    <option value="">Choose a course</option>

                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            Class {course.class_level} - {course.title}
                        </option>
                    ))}
                </select>

                {courses.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                        No active courses found. Add or activate a course first.
                    </p>
                )}
            </div>

            <div>
                <label className="text-sm font-semibold text-slate-700">
                    Quiz Title *
                </label>
                <input
                    required
                    minLength={3}
                    maxLength={150}
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Example: Class 12 Physics Test 1"
                    className={inputClass}
                />
            </div>

            <div>
                <label className="text-sm font-semibold text-slate-700">
                    Description
                </label>
                <textarea
                    rows={3}
                    maxLength={1000}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Enter quiz instructions or description..."
                    className={inputClass}
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label className="text-sm font-semibold text-slate-700">
                        Duration (minutes) *
                    </label>
                    <input
                        required
                        type="number"
                        min="1"
                        max="600"
                        value={form.durationMinutes}
                        onChange={(e) => updateField("durationMinutes", e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="text-sm font-semibold text-slate-700">
                        Total Marks *
                    </label>
                    <input
                        required
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.totalMarks}
                        onChange={(e) => updateField("totalMarks", e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="text-sm font-semibold text-slate-700">
                        Passing Marks *
                    </label>
                    <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.passingMarks}
                        onChange={(e) => updateField("passingMarks", e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="text-sm font-semibold text-slate-700">
                        Negative Marks per Wrong Answer
                    </label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        disabled={!form.negativeMarking}
                        value={form.negativeMarks}
                        onChange={(e) => updateField("negativeMarks", e.target.value)}
                        className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={form.negativeMarking}
                        onChange={(e) =>
                            updateField("negativeMarking", e.target.checked)
                        }
                        className="h-4 w-4 accent-blue-600"
                    />
                    <span className="text-sm font-semibold text-slate-700">
                        Enable negative marking
                    </span>
                </label>

                <p className="mt-2 pl-7 text-xs text-slate-500">
                    Wrong answers will receive the negative marks specified above.
                </p>
            </div>

            <div>
                <h3 className="font-semibold text-slate-800">
                    Quiz Availability
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                    These dates are optional. Leave them empty if the quiz has no
                    scheduled availability window.
                </p>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Start Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={form.startAt}
                            onChange={(e) => updateField("startAt", e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            End Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={form.endAt}
                            onChange={(e) => updateField("endAt", e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <Link
                    href="/admin/quizzes"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                    <FiArrowLeft size={16} />
                    Cancel
                </Link>

                <button
                    type="submit"
                    disabled={loading || courses.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <FiSave size={17} />
                    {loading ? "Creating Quiz..." : "Save as Draft"}
                </button>
            </div>
        </form>
    );
}