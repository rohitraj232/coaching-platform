
"use client";
import Link from "next/link";

import { useCallback, useEffect, useState } from "react";
import {
    FiBarChart2,
    FiCheckCircle,
    FiXCircle,
    FiRefreshCw,
    FiSearch,
    FiTrendingUp,
    FiDownload,
} from "react-icons/fi";

interface QuizAnalyticsItem {
    quizId: string;
    title: string;
    totalMarks: number;
    passingMarks: number;
    isPublished: boolean;
    totalAttempts: number;
    averageScore: number;
    passedAttempts: number;
    failedAttempts: number;
    passPercentage: number;
    highestScore: number;
    lowestScore: number;
}

type QuizFilter =
    | "all"
    | "published"
    | "draft"
    | "attempted"
    | "not_attempted";

export default function QuizAnalytics() {
    const [analytics, setAnalytics] = useState<QuizAnalyticsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<QuizFilter>("all");

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "/api/admin/dashboard/quiz-analytics",
                { cache: "no-store" }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to load quiz analytics"
                );
            }

            setAnalytics(result.analytics || []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Search and filter quizzes
    const filteredAnalytics = analytics.filter((quiz) => {
        const matchesSearch = quiz.title
            .toLowerCase()
            .includes(search.toLowerCase().trim());

        const matchesFilter =
            filter === "all" ||
            (filter === "published" && quiz.isPublished) ||
            (filter === "draft" && !quiz.isPublished) ||
            (filter === "attempted" && quiz.totalAttempts > 0) ||
            (filter === "not_attempted" && quiz.totalAttempts === 0);

        return matchesSearch && matchesFilter;
    });

    // Overall statistics
    const totalAttempts = analytics.reduce(
        (sum, quiz) => sum + quiz.totalAttempts,
        0
    );

    const totalPassed = analytics.reduce(
        (sum, quiz) => sum + quiz.passedAttempts,
        0
    );

    const totalFailed = analytics.reduce(
        (sum, quiz) => sum + quiz.failedAttempts,
        0
    );

    const overallPassPercentage =
        totalAttempts > 0
            ? (totalPassed / totalAttempts) * 100
            : 0;

    // Loading state
    if (loading) {
        return (
            <div className="space-y-5">
                <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-28 animate-pulse rounded-2xl bg-gray-100"
                        />
                    ))}
                </div>

                <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
                <p className="font-semibold text-red-600">{error}</p>

                <button
                    onClick={fetchAnalytics}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                    <FiRefreshCw />
                    Try Again
                </button>
            </div>
        );
    }

    const filterOptions: { label: string; value: QuizFilter }[] = [
        { label: "All Quizzes", value: "all" },
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
        { label: "Attempted", value: "attempted" },
        { label: "Not Attempted", value: "not_attempted" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Quiz Performance Analytics
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Analyze student performance across individual quizzes.
                    </p>
                </div>

                <button
                    onClick={fetchAnalytics}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    <FiRefreshCw />
                    Refresh
                </button>
                
                <a
                    href="/api/admin/dashboard/quiz-analytics/export"
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                    <FiDownload size={17} />
                    Export Excel
                </a>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Total Quizzes"
                    value={analytics.length}
                    icon={<FiBarChart2 />}
                    color="blue"
                />

                <SummaryCard
                    title="Total Attempts"
                    value={totalAttempts}
                    icon={<FiTrendingUp />}
                    color="orange"
                />

                <SummaryCard
                    title="Passed Attempts"
                    value={totalPassed}
                    icon={<FiCheckCircle />}
                    color="green"
                />

                <SummaryCard
                    title="Failed Attempts"
                    value={totalFailed}
                    icon={<FiXCircle />}
                    color="red"
                />
            </div>

            {/* Overall Pass Rate */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                        <h3 className="font-bold text-gray-900">
                            Overall Pass Percentage
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Based on all evaluated submitted attempts.
                        </p>
                    </div>

                    <span className="text-2xl font-bold text-green-600">
                        {overallPassPercentage.toFixed(1)}%
                    </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{
                            width: `${Math.min(100, overallPassPercentage)}%`,
                        }}
                    />
                </div>
            </div>

            {/* Individual Quiz Performance */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="font-bold text-gray-900">
                            Individual Quiz Performance
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            {filteredAnalytics.length} quizzes found
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search quiz..."
                            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400"
                        />
                    </div>
                </div>

                {/* Quiz Filters */}
                <div className="mb-5 flex flex-wrap gap-2">
                    {filterOptions.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => setFilter(item.value)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filter === item.value
                                ? "bg-orange-500 text-white"
                                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Quiz Cards */}
                {filteredAnalytics.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-500">
                        No quizzes found.
                    </div>
                ) : (

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {filteredAnalytics.map((quiz) => (
                            <Link
                                key={quiz.quizId}
                                href={`/admin/quiz-analytics/${quiz.quizId}`}
                                className="block rounded-xl border border-gray-100 bg-white p-5 transition hover:border-orange-300 hover:shadow-md"
                            >
                                {/* Quiz Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h4 className="truncate font-bold text-gray-900">
                                            {quiz.title}
                                        </h4>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Total marks: {quiz.totalMarks} · Passing marks:{" "}
                                            {quiz.passingMarks}
                                        </p>
                                    </div>

                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${quiz.isPublished
                                            ? "bg-green-50 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {quiz.isPublished ? "Published" : "Draft"}
                                    </span>
                                </div>

                                {/* Quiz Metrics */}
                                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <Metric label="Attempts" value={quiz.totalAttempts} />

                                    <Metric
                                        label="Average"
                                        value={`${quiz.averageScore}%`}
                                    />

                                    <Metric
                                        label="Passed"
                                        value={quiz.passedAttempts}
                                        color="green"
                                    />

                                    <Metric
                                        label="Failed"
                                        value={quiz.failedAttempts}
                                        color="red"
                                    />
                                </div>

                                {/* Pass Percentage */}
                                <div className="mt-5">
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="font-medium text-gray-600">
                                            Pass percentage
                                        </span>

                                        <span className="font-bold text-gray-900">
                                            {quiz.passPercentage}%
                                        </span>
                                    </div>

                                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full bg-green-500 transition-all"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    Math.max(0, quiz.passPercentage)
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Highest and Lowest Score */}
                                <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
                                    <span>
                                        Highest:{" "}
                                        <strong className="text-gray-800">
                                            {quiz.highestScore}%
                                        </strong>
                                    </span>

                                    <span>
                                        Lowest:{" "}
                                        <strong className="text-gray-800">
                                            {quiz.lowestScore}%
                                        </strong>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                )}
            </div>
        </div>
    );
}

// Summary Card Component
function SummaryCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: "blue" | "orange" | "green" | "red";
}) {
    const styles = {
        blue: "bg-blue-50 text-blue-600",
        orange: "bg-orange-50 text-orange-600",
        green: "bg-green-50 text-green-600",
        red: "bg-red-50 text-red-600",
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                    {title}
                </p>

                <div className={`rounded-xl p-2.5 ${styles[color]}`}>
                    {icon}
                </div>
            </div>

            <h3 className="mt-3 text-2xl font-bold text-gray-900">
                {value}
            </h3>
        </div>
    );
}

// Metric Component
function Metric({
    label,
    value,
    color = "gray",
}: {
    label: string;
    value: string | number;
    color?: "gray" | "green" | "red";
}) {
    const textColors = {
        gray: "text-gray-900",
        green: "text-green-600",
        red: "text-red-600",
    };

    return (
        <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{label}</p>

            <p className={`mt-1 text-lg font-bold ${textColors[color]}`}>
                {value}
            </p>
        </div>
    );
}
