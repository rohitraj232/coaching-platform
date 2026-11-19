
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiAward,
  FiArrowLeft,
  FiRefreshCw,
  FiAlertCircle,
  FiUsers,
} from "react-icons/fi";

interface LeaderboardEntry {
  rank: number;
  studentName: string;
  score: number;
  submittedAt: string;
}

interface LeaderboardData {
  quiz: {
    id: string;
    title: string;
  };
  leaderboard: LeaderboardEntry[];
  myRank: number | null;
  myEntry: LeaderboardEntry | null;
  totalParticipants: number;
}

interface LeaderboardClientProps {
  quizId: string;
}

export default function LeaderboardClient({
  quizId,
}: LeaderboardClientProps) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchLeaderboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/quizzes/${quizId}/leaderboard`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load leaderboard."
          );
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [quizId]);

  function formatDate(date: string) {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-600">
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <FiAlertCircle className="mx-auto text-4xl text-red-500" />

        <h2 className="mt-4 text-xl font-bold text-slate-800">
          Unable to Load Leaderboard
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          {error || "Leaderboard not found."}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <FiRefreshCw />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="mb-7">
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <FiArrowLeft />
          Back to Quizzes
        </Link>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Leaderboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {data.quiz.title}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-blue-700">
            <FiUsers className="text-xl" />

            <div>
              <p className="text-xs">Participants</p>
              <p className="font-bold">
                {data.totalParticipants}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* My Rank */}
      <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-700">
              Your Rank
            </p>

            {data.myEntry ? (
              <>
                <h2 className="mt-1 text-3xl font-extrabold text-blue-900">
                  #{data.myRank}
                </h2>

                <p className="mt-1 text-sm text-blue-700">
                  {data.myEntry.score} points
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-blue-800">
                You haven't completed this quiz yet.
              </p>
            )}
          </div>

          <FiAward className="text-4xl text-blue-600" />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-800">
            Top Performers
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Showing up to the top 100 evaluated attempts.
          </p>
        </div>

        {data.leaderboard.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FiUsers className="mx-auto text-4xl text-slate-300" />

            <p className="mt-3 font-semibold text-slate-700">
              No results available yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              The leaderboard will appear after students submit their quizzes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Rank</th>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Score</th>
                  <th className="px-5 py-4">Submitted At</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.leaderboard.map((student) => {
                  const isMe =
                    data.myRank === student.rank &&
                    data.myEntry?.studentName === student.studentName &&
                    data.myEntry?.score === student.score;

                  return (
                    <tr
                      key={`${student.rank}-${student.studentName}-${student.submittedAt}`}
                      className={
                        isMe
                          ? "bg-blue-50"
                          : "hover:bg-slate-50"
                      }
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {student.rank <= 3 ? (
                            <FiAward
                              className={`text-xl ${
                                student.rank === 1
                                  ? "text-yellow-500"
                                  : student.rank === 2
                                    ? "text-slate-400"
                                    : "text-orange-500"
                              }`}
                            />
                          ) : (
                            <span className="w-6 text-sm font-bold text-slate-600">
                              {student.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">
                          {student.studentName}
                        </span>

                        {isMe && (
                          <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                            You
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-800">
                          {student.score}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(student.submittedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data.myEntry && data.myRank && data.myRank > 100 && (
          <div className="border-t border-blue-100 bg-blue-50 p-5">
            <p className="text-sm font-semibold text-blue-800">
              Your position: #{data.myRank}
            </p>

            <p className="mt-1 text-sm text-blue-700">
              Your score is {data.myEntry.score} points.
              You're outside the top 100.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
