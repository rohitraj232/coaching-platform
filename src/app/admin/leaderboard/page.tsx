
import Link from "next/link";
import {
  FiAward,
  FiUsers,
  FiTrendingUp,
  FiClipboard,
} from "react-icons/fi";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

interface PageProps {
  searchParams: Promise<{
    quizId?: string;
  }>;
}

interface QuizOption {
  id: string;
  title: string;
}

interface Attempt {
  id: string;
  student_id: string;
  quiz_id: string;
  score: number;
  total_marks: number;
  submitted_at: string | null;
}

interface StudentProfile {
  id: string;
  full_name: string | null;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRankStyle(rank: number) {
  if (rank === 1) return "bg-amber-100 text-amber-700";
  if (rank === 2) return "bg-slate-200 text-slate-700";
  if (rank === 3) return "bg-orange-100 text-orange-700";

  return "bg-slate-100 text-slate-600";
}

export default async function AdminLeaderboardPage({
  searchParams,
}: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const selectedQuizId = params.quizId || "";

  const supabase = createAdminClient();

  // Fetch all quizzes
  const { data: quizzes, error: quizzesError } = await supabase
    .from("quizzes")
    .select("id, title")
    .order("created_at", { ascending: false });

  if (quizzesError) {
    throw new Error("Unable to load quizzes.");
  }

  const quizOptions = (quizzes || []) as QuizOption[];

  const selectedQuiz = quizOptions.find(
    (quiz) => quiz.id === selectedQuizId
  );

  let attempts: Attempt[] = [];
  let studentMap = new Map<string, string>();

  if (selectedQuiz) {
    // Fetch evaluated attempts
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select(
        "id, student_id, quiz_id, score, total_marks, submitted_at"
      )
      .eq("quiz_id", selectedQuizId)
      .eq("status", "evaluated")
      .not("score", "is", null)
      .order("score", { ascending: false })
      .order("submitted_at", { ascending: true })
      .limit(100);

    if (error) {
      throw new Error("Unable to load leaderboard.");
    }

    attempts = (data || []) as Attempt[];

    // Fetch student names
    const studentIds = [
      ...new Set(attempts.map((attempt) => attempt.student_id)),
    ];

    if (studentIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", studentIds);

      if (profilesError) {
        throw new Error("Unable to load student profiles.");
      }

      studentMap = new Map(
        ((profiles || []) as StudentProfile[]).map((profile) => [
          profile.id,
          profile.full_name || "Unknown Student",
        ])
      );
    }
  }

  // Competition ranking: 1, 2, 2, 4
  let previousScore: number | null = null;
  let currentRank = 0;

  const leaderboard = attempts.map((attempt, index) => {
    const score = Number(attempt.score);

    if (previousScore === null || score !== previousScore) {
      currentRank = index + 1;
    }

    previousScore = score;

    const percentage =
      Number(attempt.total_marks) > 0
        ? (score / Number(attempt.total_marks)) * 100
        : 0;

    return {
      ...attempt,
      rank: currentRank,
      studentName:
        studentMap.get(attempt.student_id) || "Unknown Student",
      percentage,
    };
  });

  const topScore = leaderboard[0]?.score ?? 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Leaderboard Management
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View student rankings and performance for each quiz.
        </p>
      </div>

      {/* Quiz selector */}
      <form
        action="/admin/leaderboard"
        method="GET"
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row"
      >
        <select
          name="quizId"
          defaultValue={selectedQuizId}
          required
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="" disabled>
            Select a quiz
          </option>

          {quizOptions.map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.title}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-lg text-nowrap bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          View Leaderboard
        </button>

        <Link
          href="/admin/leaderboard"
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-center text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Clear
        </Link>
      </form>

      {!selectedQuiz ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FiAward className="mx-auto text-4xl text-slate-300" />

          <h2 className="mt-4 font-semibold text-slate-700">
            Select a quiz
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a quiz above to view its student leaderboard.
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              title="Total Participants"
              value={leaderboard.length}
              icon={<FiUsers />}
              color="blue"
            />

            <SummaryCard
              title="Highest Score"
              value={`${topScore} / ${
                leaderboard[0]?.total_marks ?? 0
              }`}
              icon={<FiAward />}
              color="amber"
            />

            <SummaryCard
              title="Average Percentage"
              value={
                leaderboard.length
                  ? `${(
                      leaderboard.reduce(
                        (sum, item) => sum + item.percentage,
                        0
                      ) / leaderboard.length
                    ).toFixed(1)}%`
                  : "0%"
              }
              icon={<FiTrendingUp />}
              color="green"
            />
          </div>

          {/* Leaderboard */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
              <div>
                <h2 className="font-semibold text-slate-800">
                  {selectedQuiz.title}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Top 100 evaluated attempts
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {leaderboard.length} Participants
              </span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <FiClipboard className="mx-auto text-4xl text-slate-300" />

                <h3 className="mt-4 font-semibold text-slate-700">
                  No results available
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  No evaluated student attempts are available for this quiz.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Rank</th>
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Score</th>
                      <th className="px-5 py-4">Percentage</th>
                      <th className="px-5 py-4">Submitted</th>
                      <th className="px-5 py-4">Attempt</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {leaderboard.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 font-bold ${getRankStyle(
                              item.rank
                            )}`}
                          >
                            {item.rank}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {item.studentName}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.student_id.slice(0, 8)}...
                          </p>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {item.score} / {item.total_marks}
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-semibold text-green-700">
                            {item.percentage.toFixed(2)}%
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(item.submitted_at)}
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/attempts/${item.id}`}
                            className="font-semibold text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "amber" | "green";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>

        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}
