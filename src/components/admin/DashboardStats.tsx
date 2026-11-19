
"use client";

import { useCallback, useEffect, useState } from "react";
import {
    FiUsers,
    FiUserCheck,
    FiUserX,
    FiFileText,
    FiCheckCircle,
    FiActivity,
    FiRefreshCw,
    FiTrendingUp,
} from "react-icons/fi";

interface DashboardData {
    stats: {
        totalStudents: number;
        activeStudents: number;
        inactiveStudents: number;
        totalQuizzes: number;
        publishedQuizzes: number;
        totalAttempts: number;
        averageScore: number;
        submittedAttempts: number;
        passedAttempts: number;
        failedAttempts: number;
        passPercentage: number;
    };
    classWiseStudents: {
        classLevel: string;
        total: number;
    }[];
    recentStudents: {
        id: string;
        full_name: string | null;
        phone: string | null;
        class_level: string | null;
        created_at: string;
        is_active: boolean;
    }[];
    recentQuizActivity: {
        id: string;
        student_id: string;
        quiz_id: string;
        score: number | null;
        total_marks: number;
        status: string;
        started_at: string;
        submitted_at: string | null;
        profiles: {
            full_name: string | null;
        } | null;
        quizzes: {
            title: string;
        } | null;
    }[];
}

const statCards = [
    {
        key: "totalStudents",
        title: "Total Students",
        icon: FiUsers,
        color: "bg-blue-50 text-blue-600",
    },
    {
        key: "activeStudents",
        title: "Active Students",
        icon: FiUserCheck,
        color: "bg-green-50 text-green-600",
    },
    {
        key: "inactiveStudents",
        title: "Inactive Students",
        icon: FiUserX,
        color: "bg-red-50 text-red-600",
    },
    {
        key: "totalQuizzes",
        title: "Total Quizzes",
        icon: FiFileText,
        color: "bg-purple-50 text-purple-600",
    },
    {
        key: "publishedQuizzes",
        title: "Published Quizzes",
        icon: FiCheckCircle,
        color: "bg-orange-50 text-orange-600",
    },
    {
        key: "totalAttempts",
        title: "Quiz Attempts",
        icon: FiActivity,
        color: "bg-indigo-50 text-indigo-600",
    },
] as const;

export default function DashboardStats() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardStats = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/admin/dashboard/stats", {
                cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to load dashboard statistics."
                );
            }

            setData(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    if (loading && !data) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-32 animate-pulse rounded-2xl border border-gray-100 bg-gray-100"
                        />
                    ))}
                </div>
                <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm font-medium text-red-600">{error}</p>

                <button
                    onClick={fetchDashboardStats}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                    <FiRefreshCw />
                    Try Again
                </button>
            </div>
        );
    }

    if (!data) return null;

    const maxStudents = Math.max(
        1,
        ...data.classWiseStudents.map((item) => item.total)
    );

    return (
        <div className="space-y-6">
            {/* Dashboard heading */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Dashboard Overview
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Here's what's happening in your coaching institute.
                    </p>
                </div>

                <button
                    onClick={fetchDashboardStats}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Statistics cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    const value = data.stats[card.key];

                    return (
                        <div
                            key={card.key}
                            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        {card.title}
                                    </p>

                                    <h3 className="mt-3 text-3xl font-bold text-gray-900">
                                        {value.toLocaleString("en-IN")}
                                    </h3>
                                </div>

                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
                                >
                                    <Icon size={22} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Average score */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <FiTrendingUp size={22} />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            Average Quiz Score
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {data.stats.averageScore}%
                        </h3>
                    </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                        className="h-full rounded-full bg-orange-500 transition-all"
                        style={{
                            width: `${Math.min(100, Math.max(0, data.stats.averageScore))}%`,
                        }}
                    />
                </div>
            </div>


            {/* Active vs Inactive Students */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                        Student Account Overview
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Comparison of active and inactive student accounts.
                    </p>
                </div>

                {(() => {
                    const total = data.stats.totalStudents;

                    const activePercentage =
                        total > 0
                            ? (data.stats.activeStudents / total) * 100
                            : 0;

                    const inactivePercentage =
                        total > 0
                            ? (data.stats.inactiveStudents / total) * 100
                            : 0;

                    return (
                        <div className="space-y-6">
                            {/* Active Students */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">
                                        Active Students
                                    </span>
                                    <span className="text-sm font-semibold text-green-600">
                                        {data.stats.activeStudents} ({activePercentage.toFixed(1)}%)
                                    </span>
                                </div>

                                <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-green-500 transition-all duration-500"
                                        style={{ width: `${activePercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Inactive Students */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">
                                        Inactive Students
                                    </span>
                                    <span className="text-sm font-semibold text-red-600">
                                        {data.stats.inactiveStudents} ({inactivePercentage.toFixed(1)}%)
                                    </span>
                                </div>

                                <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-red-500 transition-all duration-500"
                                        style={{ width: `${inactivePercentage}%` }}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <p className="text-sm text-gray-500">
                                    Total registered students:{" "}
                                    <span className="font-semibold text-gray-900">
                                        {total}
                                    </span>
                                </p>
                            </div>
                        </div>
                    );
                })()}
            </div>


            {/* Quiz Performance Analytics */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                        Quiz Performance Analytics
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Overall student performance across submitted quizzes.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-blue-50 p-4">
                        <p className="text-sm font-medium text-blue-700">
                            Submitted Attempts
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-blue-900">
                            {data.stats.submittedAttempts}
                        </h3>
                    </div>

                    <div className="rounded-xl bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-700">
                            Passed Attempts
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-green-900">
                            {data.stats.passedAttempts}
                        </h3>
                    </div>

                    <div className="rounded-xl bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-700">
                            Failed Attempts
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-red-900">
                            {data.stats.failedAttempts}
                        </h3>
                    </div>

                    <div className="rounded-xl bg-orange-50 p-4">
                        <p className="text-sm font-medium text-orange-700">
                            Pass Percentage
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-orange-900">
                            {data.stats.passPercentage}%
                        </h3>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-gray-600">
                            Overall pass rate
                        </span>
                        <span className="font-semibold text-gray-900">
                            {data.stats.passPercentage}%
                        </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full rounded-full bg-green-500 transition-all duration-500"
                            style={{
                                width: `${Math.min(
                                    100,
                                    Math.max(0, data.stats.passPercentage)
                                )}%`,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Class-wise student chart */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                        Class-wise Students
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Student distribution across classes 1–12.
                    </p>
                </div>

                <div className="space-y-4">
                    {data.classWiseStudents.map((item) => (
                        <div
                            key={item.classLevel}
                            className="grid grid-cols-[75px_1fr_35px] items-center gap-3"
                        >
                            <span className="text-sm font-medium text-gray-600">
                                Class {item.classLevel}
                            </span>

                            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className="h-full rounded-full bg-orange-500 transition-all duration-500"
                                    style={{
                                        width: `${(item.total / maxStudents) * 100}%`,
                                    }}
                                />
                            </div>

                            <span className="text-right text-sm font-semibold text-gray-800">
                                {item.total}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent registrations */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                    <h3 className="text-lg font-bold text-gray-900">
                        Recent Student Registrations
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Latest students who registered on your platform.
                    </p>
                </div>

                {data.recentStudents.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500">
                        No student registrations found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Student</th>
                                    <th className="px-5 py-3 font-medium">Phone</th>
                                    <th className="px-5 py-3 font-medium">Class</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Registered</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {data.recentStudents.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-5 py-4 font-medium text-gray-900">
                                            {student.full_name || "Unnamed Student"}
                                        </td>

                                        <td className="px-5 py-4 text-gray-600">
                                            {student.phone || "—"}
                                        </td>

                                        <td className="px-5 py-4 text-gray-600">
                                            {student.class_level
                                                ? `Class ${student.class_level}`
                                                : "—"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${student.is_active
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-red-50 text-red-600"
                                                    }`}
                                            >
                                                {student.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-gray-500">
                                            {new Date(student.created_at).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                }
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


            {/* Recent Quiz Activity */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                    <h3 className="text-lg font-bold text-gray-900">
                        Recent Quiz Activity
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Latest quiz attempts by students.
                    </p>
                </div>

                {data.recentQuizActivity.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500">
                        No quiz activity found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Student</th>
                                    <th className="px-5 py-3 font-medium">Quiz</th>
                                    <th className="px-5 py-3 font-medium">Score</th>
                                    <th className="px-5 py-3 font-medium">Percentage</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Date</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {data.recentQuizActivity.map((attempt) => {
                                    const percentage =
                                        Number(attempt.total_marks) > 0 &&
                                            attempt.score !== null
                                            ? (Number(attempt.score) /
                                                Number(attempt.total_marks)) *
                                            100
                                            : 0;

                                    return (
                                        <tr key={attempt.id}>
                                            <td className="px-5 py-4 font-medium text-gray-900">
                                                {attempt.profiles?.full_name || "Unknown Student"}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {attempt.quizzes?.title || "Unknown Quiz"}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {attempt.score ?? "—"} / {attempt.total_marks}
                                            </td>

                                            <td className="px-5 py-4 font-medium text-gray-700">
                                                {percentage.toFixed(1)}%
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                    {attempt.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-gray-500">
                                                {new Date(
                                                    attempt.submitted_at || attempt.started_at
                                                ).toLocaleDateString("en-IN")}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}
