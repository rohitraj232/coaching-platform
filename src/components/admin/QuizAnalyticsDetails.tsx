
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiTarget,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  total_marks: number;
  passing_marks: number;
  duration_minutes: number;
  is_published: boolean;
  created_at: string;
}

interface Attempt {
  attemptId: string;
  studentId: string;
  studentName: string;
  phone: string;
  classLevel: string | number;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  status: string;
  startedAt: string;
  submittedAt: string;
}

interface AnalyticsData {
  success: boolean;
  quiz: Quiz;
  stats: {
    totalAttempts: number;
    passedAttempts: number;
    failedAttempts: number;
    averageScore: number;
    passPercentage: number;
  };
  attempts: Attempt[];
}

export default function QuizAnalyticsDetails({
  quizId,
}: {
  quizId: string;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/dashboard/quiz-analytics/${quizId}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load quiz analytics"
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [quizId]);

  const filteredAttempts = useMemo(() => {
    if (!data) return [];

    const query = search.toLowerCase().trim();

    if (!query) return data.attempts;

    return data.attempts.filter(
      (attempt) =>
        attempt.studentName.toLowerCase().includes(query) ||
        attempt.phone.includes(query)
    );
  }, [data, search]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-600">
          {error || "Unable to load quiz analytics"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const { quiz, stats } = data;

  const cards = [
    {
      title: "Total Attempts",
      value: stats.totalAttempts,
      icon: FiUsers,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Passed",
      value: stats.passedAttempts,
      icon: FiCheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Failed",
      value: stats.failedAttempts,
      icon: FiXCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Average Score",
      value: `${stats.averageScore}%`,
      icon: FiAward,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button and heading */}
      <div>
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-600"
        >
          <FiArrowLeft />
          Back to Dashboard
        </Link>

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {quiz.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Quiz performance and student attempt details
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
              quiz.is_published
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {quiz.is_published ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      {/* Quiz information */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {quiz.description && (
          <p className="mb-4 text-sm text-gray-500">
            {quiz.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs text-gray-500">Total Marks</p>
            <p className="mt-1 font-semibold text-gray-800">
              {quiz.total_marks}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Passing Marks</p>
            <p className="mt-1 font-semibold text-gray-800">
              {quiz.passing_marks}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="mt-1 flex items-center gap-1 font-semibold text-gray-800">
              <FiClock className="text-orange-500" />
              {quiz.duration_minutes} minutes
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Pass Percentage</p>
            <p className="mt-1 flex items-center gap-1 font-semibold text-gray-800">
              <FiTarget className="text-orange-500" />
              {stats.passPercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Analytics cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
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
                  <h2 className="mt-2 text-2xl font-bold text-gray-800">
                    {card.value}
                  </h2>
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

      {/* Pass percentage */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            Overall Pass Percentage
          </h2>
          <span className="font-bold text-green-600">
            {stats.passPercentage}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{
              width: `${Math.min(stats.passPercentage, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Student attempts */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-gray-800">
              Student Attempts
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {data.attempts.length} submitted attempts
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or phone..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            {data.attempts.length === 0
              ? "No submitted attempts for this quiz yet."
              : "No matching students found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Class</th>
                  <th className="px-5 py-4">Score</th>
                  <th className="px-5 py-4">Percentage</th>
                  <th className="px-5 py-4">Result</th>
                  <th className="px-5 py-4">Submitted At</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredAttempts.map((attempt) => (
                  <tr
                    key={attempt.attemptId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {attempt.studentName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {attempt.phone || "No phone"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      Class {attempt.classLevel || "-"}
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-700">
                      {attempt.score} / {attempt.totalMarks}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {attempt.percentage}%
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          attempt.passed
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {attempt.passed ? "Passed" : "Failed"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {new Date(attempt.submittedAt).toLocaleString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
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
    </div>
  );
}
