
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiTrendingUp,
  FiArrowRight,
  FiRefreshCw,
  FiAlertCircle,
  FiUser,
  FiBarChart2,
} from "react-icons/fi";

interface Student {
  id: string;
  fullName: string;
  phone: string;
  classLevel: string;
  isActive: boolean;
  registeredAt: string;
}

interface DashboardStats {
  totalAvailableQuizzes: number;
  completedQuizzes: number;
  totalAttempts: number;
  averageScore: number;
}

interface RecentActivity {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  result: string;
  status: string;
  startedAt: string;
  submittedAt: string | null;
}

interface DashboardResponse {
  success: boolean;
  student: Student;
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  message?: string;
}

export default function StudentDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/student/dashboard", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load dashboard.");
      }

      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-36 rounded-2xl bg-gray-200" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 rounded-xl bg-gray-200" />
          ))}
        </div>

        <div className="h-60 rounded-xl bg-gray-200" />
        <div className="h-72 rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <FiAlertCircle className="mx-auto mb-3 text-3xl text-red-500" />

        <p className="font-medium text-red-700">
          {error || "Dashboard data not found."}
        </p>

        <button
          onClick={fetchDashboard}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          <FiRefreshCw />
          Try Again
        </button>
      </div>
    );
  }

  const { student, stats, recentActivity } = dashboard;

  const statCards = [
    {
      title: "Available Quizzes",
      value: stats.totalAvailableQuizzes,
      icon: FiBookOpen,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Completed Quizzes",
      value: stats.completedQuizzes,
      icon: FiCheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Attempts",
      value: stats.totalAttempts,
      icon: FiClock,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Average Score",
      value: `${stats.averageScore}%`,
      icon: FiTrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const quickLinks = [
    {
      title: "Available Quizzes",
      description: "Explore and attempt quizzes for your class.",
      href: "/quizzes",
      icon: FiBookOpen,
      iconColor: "bg-blue-100 text-blue-600",
      hoverColor: "group-hover:bg-blue-600",
    },
    {
      title: "My Quiz History",
      description: "View your previous attempts and results.",
      href: "/my-quizzes",
      icon: FiClock,
      iconColor: "bg-purple-100 text-purple-600",
      hoverColor: "group-hover:bg-purple-600",
    },
    {
      title: "My Profile",
      description: "View and update your personal information.",
      href: "/student/profile",
      icon: FiUser,
      iconColor: "bg-orange-100 text-orange-600",
      hoverColor: "group-hover:bg-orange-600",
    },
  ];

  const latestAttempt = recentActivity[0];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003B64] to-[#0B5A93] p-6 text-white sm:p-8">
        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-100">
            Student Dashboard
          </p>

          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Welcome back, {student.fullName}!
          </h1>

          <p className="mt-2 text-sm text-blue-100 sm:text-base">
            Keep learning, keep practicing, and achieve your goals.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
              Class {student.classLevel}
            </span>

            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
              Student Account
            </span>
          </div>

          <Link
            href="/quizzes"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#003B64] transition hover:bg-blue-50"
          >
            Explore Quizzes
            <FiArrowRight />
          </Link>
        </div>

        <FiAward className="absolute -bottom-8 -right-5 h-44 w-44 text-white/10" />
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            Your Overview
          </h2>

          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0B5A93] hover:underline"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {card.title}
                    </p>

                    <h3 className="mt-3 text-3xl font-bold text-gray-800">
                      {card.value}
                    </h3>
                  </div>

                  <div className={`rounded-xl p-4 ${card.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Navigation */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            Quick Navigation
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Quickly access your student portal features.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition group-hover:text-white ${item.iconColor} ${item.hoverColor}`}
                >
                  <Icon size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-800 transition group-hover:text-[#0B5A93]">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {item.description}
                  </p>
                </div>

                <FiArrowRight
                  className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#0B5A93]"
                  size={18}
                />
              </Link>
            );
          })}

          {/* Latest Quiz Leaderboard */}
          {latestAttempt && (
            <Link
              href={`/quizzes/${latestAttempt.quizId}/leaderboard`}
              className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">
                <FiBarChart2 size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-800 transition group-hover:text-green-700">
                  Quiz Leaderboard
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Compare your ranking in your latest attempted quiz.
                </p>
              </div>

              <FiArrowRight
                className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600"
                size={18}
              />
            </Link>
          )}
        </div>
      </section>

      {/* Performance */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">
          Your Performance
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Your average score across completed quiz attempts.
        </p>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Average Score
          </span>

          <span className="text-2xl font-bold text-[#003B64]">
            {stats.averageScore}%
          </span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, stats.averageScore))}%`,
            }}
          />
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Keep practicing to improve your performance.
        </p>
      </section>

      {/* Recent Activity */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Recent Quiz Activity
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your latest quiz attempts and results.
            </p>
          </div>

          <Link
            href="/my-quizzes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B5A93] hover:underline"
          >
            View All
            <FiArrowRight />
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="p-10 text-center">
            <FiBookOpen className="mx-auto mb-3 text-4xl text-gray-300" />

            <h3 className="font-semibold text-gray-700">
              No quiz attempts yet
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Start your first quiz to see your performance here.
            </p>

            <Link
              href="/quizzes"
              className="mt-4 inline-flex rounded-lg bg-[#003B64] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B5A93]"
            >
              Browse Quizzes
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Quiz</th>
                  <th className="px-5 py-4 font-semibold">Score</th>
                  <th className="px-5 py-4 font-semibold">Percentage</th>
                  <th className="px-5 py-4 font-semibold">Result</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentActivity.map((activity) => (
                  <tr
                    key={activity.attemptId}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {activity.quizTitle}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {activity.score}/{activity.totalMarks}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-700">
                      {activity.percentage}%
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          activity.result === "passed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {activity.result === "passed" ? "Passed" : "Failed"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {formatDate(
                        activity.submittedAt || activity.startedAt
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/quiz/${activity.quizId}/result/${activity.attemptId}`}
                        className="font-semibold text-[#0B5A93] hover:underline"
                      >
                        View Result
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
