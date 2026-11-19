
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiRefreshCw,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
  FiXCircle,
  FiSearch,
  FiFilter,
  FiX,
} from "react-icons/fi";

interface HistoryItem {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  courseTitle: string;
  selectedLanguage: string;
  status: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passingMarks: number;
  isPassed: boolean;
  startedAt: string | null;
  expiresAt: string | null;
  submittedAt: string | null;
  autoSubmitReason: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type StatusFilter = "all" | "passed" | "failed" | "in_progress";

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All Attempts", value: "all" },
  { label: "Passed", value: "passed" },
  { label: "Failed", value: "failed" },
  { label: "In Progress", value: "in_progress" },
];

const INITIAL_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export default function QuizHistoryClient() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>(
    INITIAL_PAGINATION
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const fetchHistory = useCallback(
    async (
      page: number,
      search = "",
      status: StatusFilter = "all"
    ) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          search,
          status,
        });

        const response = await fetch(
          `/api/student/quiz-history?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load quiz history."
          );
        }

        setHistory(data.history || []);
        setPagination(data.pagination || INITIAL_PAGINATION);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchHistory(1, "", "all");
  }, [fetchHistory]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const search = searchInput.trim();

    setAppliedSearch(search);
    fetchHistory(1, search, statusFilter);
  }

  function handleStatusChange(status: StatusFilter) {
    setStatusFilter(status);
    fetchHistory(1, appliedSearch, status);
  }

  function handleResetFilters() {
    setSearchInput("");
    setAppliedSearch("");
    setStatusFilter("all");
    fetchHistory(1, "", "all");
  }

  function changePage(page: number) {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === pagination.page
    ) {
      return;
    }

    fetchHistory(page, appliedSearch, statusFilter);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function formatDate(date: string | null) {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusLabel(item: HistoryItem) {
    if (item.status === "in_progress") {
      return "In Progress";
    }

    if (item.status === "evaluated") {
      return item.isPassed ? "Passed" : "Failed";
    }

    return item.status.replaceAll("_", " ");
  }

  function getStatusClasses(item: HistoryItem) {
    if (item.status === "in_progress") {
      return "bg-blue-50 text-blue-700";
    }

    if (item.status === "evaluated" && item.isPassed) {
      return "bg-green-50 text-green-700";
    }

    if (item.status === "evaluated" && !item.isPassed) {
      return "bg-red-50 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  const showingFrom =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;

  const showingTo = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  const hasActiveFilters =
    appliedSearch !== "" || statusFilter !== "all";

  return (
    <div className="mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Quiz History
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and track all your quiz attempts and results.
          </p>
        </div>

        <Link
          href="/quizzes"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          <FiBookOpen size={17} />
          Explore Quizzes
        </Link>
      </div>

      {/* Total Attempts */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <FiBookOpen size={23} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Quiz Attempts
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {loading && pagination.total === 0
                ? "..."
                : pagination.total}
            </h2>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FiFilter className="text-orange-500" size={19} />

          <h2 className="font-semibold text-gray-900">
            Search & Filter
          </h2>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search quiz by title..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSearch size={16} />
            Search
          </button>
        </form>

        {/* Status Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => {
            const active = statusFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                disabled={loading}
                onClick={() => handleStatusChange(filter.value)}
                className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                {filter.label}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              disabled={loading}
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              <FiX size={15} />
              Clear Filters
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {showingFrom}-{showingTo}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {pagination.total}
            </span>{" "}
            attempts
          </p>

          {loading && (
            <span className="text-xs font-medium text-orange-600">
              Updating results...
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Initial Loading */}
      {loading && history.length === 0 && !error && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <FiRefreshCw
            className="mx-auto animate-spin text-orange-500"
            size={26}
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading quiz history...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && history.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
            <FiBookOpen size={30} />
          </div>

          <h3 className="mt-4 text-lg font-bold text-gray-900">
            {hasActiveFilters
              ? "No Matching Quizzes Found"
              : "No Quiz History Yet"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            {hasActiveFilters
              ? "Try changing your search or filters."
              : "Your quiz attempts will appear here once you start attempting quizzes."}
          </p>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <FiRefreshCw size={16} />
              Clear Filters
            </button>
          ) : (
            <Link
              href="/quizzes"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <FiBookOpen size={17} />
              Explore Quizzes
            </Link>
          )}
        </div>
      )}

      {/* History List */}
      {history.length > 0 && (
        <div className="space-y-4">
          {history.map((item) => {
            const isInProgress = item.status === "in_progress";
            const isEvaluated = item.status === "evaluated";

            return (
              <div
                key={item.attemptId}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="p-5 sm:p-6">
                  {/* Title and Status */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-bold text-gray-900">
                        {item.quizTitle}
                      </h3>

                      {item.courseTitle && (
                        <p className="mt-1 text-sm text-gray-500">
                          {item.courseTitle}
                        </p>
                      )}
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(item)}`}
                    >
                      {getStatusLabel(item)}
                    </span>
                  </div>

                  {/* Quiz Information */}
                  <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Score
                      </p>

                      <p className="mt-1 font-bold text-gray-900">
                        {item.score} / {item.totalMarks}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Percentage
                      </p>

                      <p className="mt-1 font-bold text-gray-900">
                        {item.percentage}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Language
                      </p>

                      <p className="mt-1 font-semibold capitalize text-gray-900">
                        {item.selectedLanguage}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Passing Marks
                      </p>

                      <p className="mt-1 font-bold text-gray-900">
                        {item.passingMarks}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-500 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <FiClock className="shrink-0 text-gray-400" />

                      <span>
                        Started: {formatDate(item.startedAt)}
                      </span>
                    </div>

                    {item.submittedAt && (
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="shrink-0 text-gray-400" />

                        <span>
                          Submitted: {formatDate(item.submittedAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Result Message */}
                  {isEvaluated && (
                    <div
                      className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${
                        item.isPassed
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {item.isPassed ? (
                        <FiCheckCircle size={18} />
                      ) : (
                        <FiXCircle size={18} />
                      )}

                      {item.isPassed
                        ? "Congratulations! You passed this quiz."
                        : "You did not pass this quiz. Keep practicing!"}
                    </div>
                  )}

                  {isInProgress && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-700">
                      <FiClock size={18} />
                      This quiz is still in progress. Resume to continue.
                    </div>
                  )}

                  {/* Auto Submit Information */}
                  {item.autoSubmitReason && (
                    <p className="mt-3 text-xs text-gray-500">
                      Auto-submitted:{" "}
                      {item.autoSubmitReason.replaceAll("_", " ")}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                    {isInProgress && (
                      <Link
                        href={`/quiz/${item.quizId}/attempt/${item.attemptId}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        <FiPlay size={16} />
                        Resume Quiz
                      </Link>
                    )}

                    {isEvaluated && (
                      <>
                        <Link
                          href={`/quiz/${item.quizId}/result/${item.attemptId}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                        >
                          <FiEye size={16} />
                          View Result
                        </Link>

                        <Link
                          href={`/quiz/${item.quizId}/review/${item.attemptId}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          <FiBookOpen size={16} />
                          Review Answers
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-semibold text-gray-900">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {pagination.totalPages}
            </span>
          </p>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => changePage(pagination.page - 1)}
              disabled={loading || pagination.page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft size={17} />
              Previous
            </button>

            <button
              type="button"
              onClick={() => changePage(pagination.page + 1)}
              disabled={
                loading ||
                pagination.page >= pagination.totalPages
              }
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <FiChevronRight size={17} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
