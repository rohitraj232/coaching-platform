
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FiArrowLeft,
    FiRefreshCw,
    FiUsers,
    FiFileText,
    FiCheckCircle,
    FiXCircle,
    FiTrendingUp,
    FiCalendar,
    FiPhone,
    FiBookOpen,
    FiAward,
} from "react-icons/fi";

interface Student {
    id: string;
    full_name: string | null;
    phone: string | null;
    class_level: string | null;
    is_active: boolean;
    created_at: string;
}

interface StudentStats {
    totalAttempts: number;
    passedAttempts: number;
    failedAttempts: number;
    averageScore: number;
    passPercentage: number;
    highestScore: number;
    lowestScore: number;
}

interface QuizAttempt {
    attemptId: string;
    quizId: string;
    quizTitle: string;
    score: number;
    totalMarks: number;
    percentage: number;
    passingMarks: number;
    result: "passed" | "failed";
    status: string;
    startedAt: string;
    submittedAt: string;
}

interface AnalyticsResponse {
    success: boolean;
    message?: string;
    student: Student;
    stats: StudentStats;
    attempts: QuizAttempt[];
}

interface Props {
    studentId: string;
}

export default function StudentAnalyticsDetails({
    studentId,
}: Props) {
    const [data, setData] = useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/admin/dashboard/student-analytics/${studentId}`,
                { cache: "no-store" }
            );

            const result: AnalyticsResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to load student analytics"
                );
            }

            setData(result);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [studentId]);

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <FiRefreshCw className="animate-spin text-2xl text-orange-500" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm text-red-600">
                    {error || "Student data not found"}
                </p>
                <button
                    onClick={fetchDetails}
                    className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const { student, stats, attempts } = data;

    const statCards = [
        {
            label: "Total Attempts",
            value: stats.totalAttempts,
            icon: FiFileText,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Passed",
            value: stats.passedAttempts,
            icon: FiCheckCircle,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            label: "Failed",
            value: stats.failedAttempts,
            icon: FiXCircle,
            color: "text-red-600",
            bg: "bg-red-50",
        },
        {
            label: "Average Score",
            value: `${stats.averageScore}%`,
            icon: FiTrendingUp,
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href="/admin"
                    className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600"
                >
                    <FiArrowLeft />
                    Back to Dashboard
                </Link>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Student Performance
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Detailed quiz performance and attempt history
                        </p>
                    </div>

                    <button
                        onClick={fetchDetails}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <FiRefreshCw />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Student Profile */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-600">
                            {student.full_name?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div>
                            <Link
                                href={`/admin/student-analytics/${student.id}`}
                                className="text-lg font-bold text-gray-800 hover:text-orange-600"
                            >
                                {student.full_name || "Unnamed Student"}
                            </Link>

                            <p className="mt-1 text-sm text-gray-500">
                                Class {student.class_level || "-"}
                            </p>
                        </div>
                    </div>

                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${student.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                    >
                        {student.is_active ? "Active" : "Inactive"}
                    </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiPhone className="text-orange-500" />
                        {student.phone || "No phone number"}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiBookOpen className="text-orange-500" />
                        Class {student.class_level || "-"}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiCalendar className="text-orange-500" />
                        Joined {formatDate(student.created_at)}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.label}
                            className="rounded-xl border border-gray-200 bg-white p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{card.label}</p>
                                    <h3 className="mt-2 text-2xl font-bold text-gray-800">
                                        {card.value}
                                    </h3>
                                </div>

                                <div className={`rounded-xl p-3 ${card.bg} ${card.color}`}>
                                    <Icon size={21} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-2">
                        <FiTrendingUp className="text-orange-500" />
                        <h3 className="font-semibold text-gray-800">
                            Pass Percentage
                        </h3>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                        <span className="text-3xl font-bold text-gray-800">
                            {stats.passPercentage}%
                        </span>
                        <span className="text-sm text-gray-500">
                            {stats.passedAttempts} of {stats.totalAttempts} passed
                        </span>
                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{
                                width: `${stats.passPercentage}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-2">
                        <FiAward className="text-orange-500" />
                        <h3 className="font-semibold text-gray-800">
                            Score Range
                        </h3>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Highest Score</p>
                            <p className="mt-1 text-2xl font-bold text-green-600">
                                {stats.highestScore}%
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Lowest Score</p>
                            <p className="mt-1 text-2xl font-bold text-red-600">
                                {stats.lowestScore}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quiz Attempt History */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 p-5">
                    <div className="flex items-center gap-2">
                        <FiUsers className="text-orange-500" />
                        <h3 className="font-semibold text-gray-800">
                            Quiz Attempt History
                        </h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        All submitted quiz attempts by this student
                    </p>
                </div>

                {attempts.length === 0 ? (
                    <div className="p-10 text-center">
                        <FiFileText className="mx-auto text-3xl text-gray-300" />
                        <p className="mt-3 text-sm text-gray-500">
                            No submitted quiz attempts found.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-5 py-4">Quiz</th>
                                    <th className="px-5 py-4">Score</th>
                                    <th className="px-5 py-4">Percentage</th>
                                    <th className="px-5 py-4">Result</th>
                                    <th className="px-5 py-4">Submitted At</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {attempts.map((attempt) => (
                                    <tr
                                        key={attempt.attemptId}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4 font-medium text-gray-800">
                                            {attempt.quizTitle}
                                        </td>

                                        <td className="px-5 py-4 text-gray-600">
                                            {attempt.score} / {attempt.totalMarks}
                                        </td>

                                        <td className="px-5 py-4 font-semibold text-gray-700">
                                            {attempt.percentage}%
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${attempt.result === "passed"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {attempt.result === "passed" ? "Passed" : "Failed"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-gray-500">
                                            {attempt.submittedAt
                                                ? formatDate(attempt.submittedAt)
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
