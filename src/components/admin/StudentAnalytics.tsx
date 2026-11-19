
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    FiUsers,
    FiFileText,
    FiCheckCircle,
    FiXCircle,
    FiTrendingUp,
    FiSearch,
    FiRefreshCw,
    FiEye,
    FiDownload,
} from "react-icons/fi";

interface StudentAnalyticsItem {
    studentId: string;
    fullName: string | null;
    phone: string | null;
    classLevel: string | null;
    isActive: boolean;
    registeredAt: string;
    totalAttempts: number;
    passedAttempts: number;
    failedAttempts: number;
    averageScore: number;
    passPercentage: number;
    highestScore: number;
    lowestScore: number;
}

interface AnalyticsStats {
    totalStudents: number;
    studentsWithAttempts: number;
    studentsWithoutAttempts: number;
    totalAttempts: number;
    passedAttempts: number;
    failedAttempts: number;
    averageScore: number;
    passPercentage: number;
}

interface AnalyticsResponse {
    success: boolean;
    stats: AnalyticsStats;
    students: StudentAnalyticsItem[];
    message?: string;
}

type ClassFilter = "all" | string;
type AttemptFilter = "all" | "attempted" | "not_attempted";

export default function StudentAnalytics() {
    const [data, setData] = useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState<ClassFilter>("all");
    const [attemptFilter, setAttemptFilter] =
        useState<AttemptFilter>("all");

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "/api/admin/dashboard/student-analytics",
                { cache: "no-store" }
            );

            const result: AnalyticsResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to fetch student analytics."
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
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const filteredStudents = useMemo(() => {
        if (!data) return [];

        return data.students.filter((student) => {
            const searchTerm = search.toLowerCase().trim();

            const matchesSearch =
                !searchTerm ||
                (student.fullName || "").toLowerCase().includes(searchTerm) ||
                (student.phone || "").toLowerCase().includes(searchTerm);

            const matchesClass =
                classFilter === "all" ||
                student.classLevel === classFilter;

            const matchesAttempt =
                attemptFilter === "all" ||
                (attemptFilter === "attempted" &&
                    student.totalAttempts > 0) ||
                (attemptFilter === "not_attempted" &&
                    student.totalAttempts === 0);

            return matchesSearch && matchesClass && matchesAttempt;
        });
    }, [data, search, classFilter, attemptFilter]);

    const statCards = [
        {
            title: "Total Students",
            value: data?.stats.totalStudents ?? 0,
            icon: FiUsers,
            color: "bg-blue-50 text-blue-600",
        },
        {
            title: "Total Attempts",
            value: data?.stats.totalAttempts ?? 0,
            icon: FiFileText,
            color: "bg-purple-50 text-purple-600",
        },
        {
            title: "Passed Attempts",
            value: data?.stats.passedAttempts ?? 0,
            icon: FiCheckCircle,
            color: "bg-green-50 text-green-600",
        },
        {
            title: "Failed Attempts",
            value: data?.stats.failedAttempts ?? 0,
            icon: FiXCircle,
            color: "bg-red-50 text-red-600",
        },
    ];

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <div className="text-center">
                    <FiRefreshCw className="mx-auto animate-spin text-2xl text-orange-500" />
                    <p className="mt-3 text-sm text-gray-500">
                        Loading student analytics...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <p className="font-medium text-red-700">{error}</p>
                <button
                    onClick={fetchAnalytics}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                    <FiRefreshCw />
                    Try Again
                </button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Student-wise Performance Analytics
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Track individual student performance across quizzes.
                    </p>
                </div>

                <button
                    onClick={fetchAnalytics}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    <FiRefreshCw size={16} />
                    Refresh
                </button>

                <a
                    href="/api/admin/dashboard/student-analytics/export"
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                    <FiDownload size={17} />
                    Export Excel
                </a>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-xl border border-gray-200 bg-white p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {card.title}
                                    </p>
                                    <h3 className="mt-2 text-2xl font-bold text-gray-900">
                                        {card.value}
                                    </h3>
                                </div>

                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}
                                >
                                    <Icon size={21} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Overall Performance */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Overall Average Score
                            </p>
                            <h3 className="mt-2 text-3xl font-bold text-gray-900">
                                {data.stats.averageScore.toFixed(2)}%
                            </h3>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <FiTrendingUp size={22} />
                        </div>
                    </div>

                    <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full rounded-full bg-orange-500 transition-all"
                            style={{
                                width: `${Math.min(
                                    100,
                                    Math.max(0, data.stats.averageScore)
                                )}%`,
                            }}
                        />
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                        Average of each student's average attempt percentage.
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Overall Pass Percentage
                            </p>
                            <h3 className="mt-2 text-3xl font-bold text-gray-900">
                                {data.stats.passPercentage.toFixed(2)}%
                            </h3>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <FiCheckCircle size={22} />
                        </div>
                    </div>

                    <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{
                                width: `${Math.min(
                                    100,
                                    Math.max(0, data.stats.passPercentage)
                                )}%`,
                            }}
                        />
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                        {data.stats.studentsWithAttempts} students attempted quizzes ·{" "}
                        {data.stats.studentsWithoutAttempts} without attempts.
                    </p>
                </div>
            </div>

            {/* Student List */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Student Performance
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Showing {filteredStudents.length} of{" "}
                                {data.students.length} students
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {/* Search */}
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search student..."
                                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                />
                            </div>

                            {/* Class Filter */}
                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                            >
                                <option value="all">All Classes</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                    (classNumber) => (
                                        <option
                                            key={classNumber}
                                            value={String(classNumber)}
                                        >
                                            Class {classNumber}
                                        </option>
                                    )
                                )}
                            </select>

                            {/* Attempt Filter */}
                            <select
                                value={attemptFilter}
                                onChange={(e) =>
                                    setAttemptFilter(e.target.value as AttemptFilter)
                                }
                                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                            >
                                <option value="all">All Students</option>
                                <option value="attempted">Attempted</option>
                                <option value="not_attempted">Not Attempted</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-5 py-4 font-semibold">Student</th>
                                <th className="px-5 py-4 font-semibold">Class</th>
                                <th className="px-5 py-4 font-semibold">Attempts</th>
                                <th className="px-5 py-4 font-semibold">Passed</th>
                                <th className="px-5 py-4 font-semibold">Failed</th>
                                <th className="px-5 py-4 font-semibold">Average</th>
                                <th className="px-5 py-4 font-semibold">Pass %</th>
                                <th className="px-5 py-4 font-semibold">Account</th>
                                <th className="px-5 py-4 font-semibold">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.map((student) => (
                                <tr
                                    key={student.studentId}
                                    className="transition hover:bg-gray-50"
                                >
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-gray-900">
                                            {student.fullName || "Unnamed Student"}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {student.phone || "No phone"}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4 text-gray-700">
                                        Class {student.classLevel || "N/A"}
                                    </td>

                                    <td className="px-5 py-4 font-medium text-gray-900">
                                        {student.totalAttempts}
                                    </td>

                                    <td className="px-5 py-4 font-medium text-green-600">
                                        {student.passedAttempts}
                                    </td>

                                    <td className="px-5 py-4 font-medium text-red-600">
                                        {student.failedAttempts}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="font-semibold text-gray-900">
                                            {student.averageScore.toFixed(2)}%
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="font-semibold text-gray-900">
                                            {student.passPercentage.toFixed(2)}%
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${student.isActive
                                                ? "bg-green-50 text-green-700"
                                                : "bg-red-50 text-red-700"
                                                }`}
                                        >
                                            {student.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/students/${student.studentId}`}
                                            className="inline-flex items-center gap-2 rounded-lg border border-orange-200 px-3 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-50"
                                        >
                                            <FiEye size={16} />
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-5 py-12 text-center text-gray-500"
                                    >
                                        No students found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
