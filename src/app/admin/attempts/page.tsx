
import Link from "next/link";
import {
  FiClipboard,
  FiEye,
  FiUsers,
  FiAward,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    quizId?: string;
    language?: string;
    page?: string;
    limit?: string;
  }>;
}

type Attempt = {
  id: string;
  quiz_id: string;
  student_id: string;
  selected_language: string;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  status: "in_progress" | "submitted" | "evaluated";
  score: number | null;
  total_marks: number;
  tab_switch_count: number;
  auto_submit_reason: string | null;
  quiz: { title: string } | null;
};

type StudentProfile = {
  id: string;
  full_name: string | null;
};

type QuizOption = {
  id: string;
  title: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status: string) {
  switch (status) {
    case "in_progress":
      return "bg-blue-50 text-blue-700";
    case "submitted":
      return "bg-amber-50 text-amber-700";
    case "evaluated":
      return "bg-green-50 text-green-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function buildPageUrl(
  params: Record<string, string>,
  page: number
) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  query.set("page", String(page));

  return `/admin/attempts?${query.toString()}`;
}

export default async function AdminAttemptsPage({
  searchParams,
}: PageProps) {
  await requireAdmin();

  const params = await searchParams;

  const search = (params.q || "").trim();
  const statusFilter = [
    "in_progress",
    "submitted",
    "evaluated",
  ].includes(params.status || "")
    ? params.status!
    : "";

  const quizFilter = params.quizId || "";
  const languageFilter = ["en", "hi"].includes(params.language || "")
    ? params.language!
    : "";

  const pageSize = [10, 25, 50].includes(Number(params.limit))
    ? Number(params.limit)
    : 10;

  const requestedPage = Math.max(1, Number(params.page) || 1);

  const supabase = createAdminClient();

  // Fetch attempts
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select(`
      id,
      quiz_id,
      student_id,
      selected_language,
      started_at,
      expires_at,
      submitted_at,
      status,
      score,
      total_marks,
      tab_switch_count,
      auto_submit_reason,
      quiz:quizzes ( title )
    `)
    .order("started_at", { ascending: false })
    .limit(1000);

  if (error) {
    throw new Error(`Unable to load attempts: ${error.message}`);
  }

  const attempts = (data || []) as unknown as Attempt[];

  // Fetch student profiles
  const studentIds = [
    ...new Set(attempts.map((attempt) => attempt.student_id)),
  ];

  const { data: profiles, error: profilesError } =
    studentIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds)
      : { data: [], error: null };

  if (profilesError) {
    throw new Error("Unable to load student profiles.");
  }

  const studentMap = new Map(
    ((profiles || []) as StudentProfile[]).map((profile) => [
      profile.id,
      profile.full_name || "Unknown Student",
    ])
  );

  // Fetch quiz options for the filter
  const { data: quizzes, error: quizzesError } = await supabase
    .from("quizzes")
    .select("id, title")
    .order("created_at", { ascending: false });

  if (quizzesError) {
    throw new Error("Unable to load quizzes.");
  }

  const quizOptions = (quizzes || []) as QuizOption[];

  // Apply filters
  const filteredAttempts = attempts.filter((attempt) => {
    const studentName =
      studentMap.get(attempt.student_id) || "Unknown Student";

    const quizTitle = attempt.quiz?.title || "Deleted Quiz";

    const matchesSearch =
      !search ||
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      quizTitle.toLowerCase().includes(search.toLowerCase()) ||
      attempt.student_id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter || attempt.status === statusFilter;

    const matchesQuiz =
      !quizFilter || attempt.quiz_id === quizFilter;

    const matchesLanguage =
      !languageFilter ||
      attempt.selected_language === languageFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesQuiz &&
      matchesLanguage
    );
  });

  // Filtered summary counts
  const totalAttempts = filteredAttempts.length;

  const inProgressCount = filteredAttempts.filter(
    (attempt) => attempt.status === "in_progress"
  ).length;

  const submittedCount = filteredAttempts.filter(
    (attempt) => attempt.status === "submitted"
  ).length;

  const evaluatedCount = filteredAttempts.filter(
    (attempt) => attempt.status === "evaluated"
  ).length;

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(totalAttempts / pageSize)
  );

  const currentPage = Math.min(requestedPage, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedAttempts = filteredAttempts.slice(
    startIndex,
    endIndex
  );

  const activeParams = {
    q: search,
    status: statusFilter,
    quizId: quizFilter,
    language: languageFilter,
    limit: String(pageSize),
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Quiz Attempts & Results
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor student attempts and review their performance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          title="Total Attempts"
          value={totalAttempts}
          icon={<FiClipboard />}
          color="blue"
        />

        <SummaryCard
          title="In Progress"
          value={inProgressCount}
          icon={<FiUsers />}
          color="amber"
        />

        <SummaryCard
          title="Submitted"
          value={submittedCount}
          icon={<FiClipboard />}
          color="orange"
        />

        <SummaryCard
          title="Evaluated"
          value={evaluatedCount}
          icon={<FiAward />}
          color="green"
        />
      </div>

      {/* Search and Filters */}
      <form
        action="/admin/attempts"
        method="GET"
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="mb-4 flex items-center gap-2 font-semibold text-slate-700">
          <FiFilter className="text-blue-600" />
          Search & Filters
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search student or quiz..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="evaluated">Evaluated</option>
          </select>

          <select
            name="quizId"
            defaultValue={quizFilter}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Quizzes</option>

            {quizOptions.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>

          <select
            name="language"
            defaultValue={languageFilter}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows per page:</span>

            <select
              name="limit"
              defaultValue={String(pageSize)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 outline-none"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/attempts"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </form>

      {/* Attempts Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800">
            Student Attempts
          </h2>

          <span className="text-sm text-slate-500">
            {totalAttempts} result(s)
          </span>
        </div>

        {paginatedAttempts.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No attempts found. Try changing your search or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Quiz</th>
                  <th className="px-5 py-4">Language</th>
                  <th className="px-5 py-4">Score</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Started</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedAttempts.map((attempt) => {
                  const studentName =
                    studentMap.get(attempt.student_id) ||
                    "Unknown Student";

                  const quizTitle =
                    attempt.quiz?.title || "Deleted Quiz";

                  const percentage =
                    attempt.score !== null &&
                    Number(attempt.total_marks) > 0
                      ? (
                          (Number(attempt.score) /
                            Number(attempt.total_marks)) *
                          100
                        ).toFixed(1)
                      : null;

                  return (
                    <tr
                      key={attempt.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {studentName}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {attempt.student_id.slice(0, 8)}...
                        </p>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-700">
                        {quizTitle}
                      </td>

                      <td className="px-5 py-4 uppercase text-slate-600">
                        {attempt.selected_language}
                      </td>

                      <td className="px-5 py-4">
                        {attempt.score !== null ? (
                          <>
                            <p className="font-semibold text-slate-800">
                              {attempt.score} / {attempt.total_marks}
                            </p>
                            <p className="text-xs text-slate-400">
                              {percentage}%
                            </p>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            attempt.status
                          )}`}
                        >
                          {attempt.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(attempt.started_at)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(attempt.submitted_at)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/attempts/${attempt.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          <FiEye /> View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalAttempts > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <strong>{startIndex + 1}</strong> to{" "}
              <strong>{Math.min(endIndex, totalAttempts)}</strong> of{" "}
              <strong>{totalAttempts}</strong> attempts
            </p>

            <div className="flex items-center gap-2">
              <Link
                href={buildPageUrl(
                  activeParams,
                  Math.max(1, currentPage - 1)
                )}
                aria-disabled={currentPage === 1}
                className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${
                  currentPage === 1
                    ? "pointer-events-none border-slate-100 text-slate-300"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FiChevronLeft /> Previous
              </Link>

              <span className="px-2 text-sm font-medium text-slate-700">
                {currentPage} / {totalPages}
              </span>

              <Link
                href={buildPageUrl(
                  activeParams,
                  Math.min(totalPages, currentPage + 1)
                )}
                aria-disabled={currentPage === totalPages}
                className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${
                  currentPage === totalPages
                    ? "pointer-events-none border-slate-100 text-slate-300"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Next <FiChevronRight />
              </Link>
            </div>
          </div>
        )}
      </div>
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
  value: number;
  icon: React.ReactNode;
  color: "blue" | "amber" | "orange" | "green";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{title}</p>

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[color]}`}
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
