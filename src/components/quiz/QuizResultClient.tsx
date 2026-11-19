
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiMinusCircle,
  FiAlertCircle,
  FiHome,
  FiRefreshCw,
} from "react-icons/fi";

interface QuizResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  status: string;
  score: number;
  totalMarks: number;
  passingMarks: number;
  percentage: number;
  isPassed: boolean;
  totalQuestions: number;
  correct: number;
  wrong: number;
  unanswered: number;
  correctMarks: number;
  negativeMarksDeducted: number;
  selectedLanguage: string;
  startedAt: string;
  submittedAt: string;
  autoSubmitReason: string | null;
}

interface QuizResultClientProps {
  quizId: string;
  attemptId: string;
}

export default function QuizResultClient({
  quizId,
  attemptId,
}: QuizResultClientProps) {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchResult() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/quizzes/${quizId}/attempts/${attemptId}/result`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load quiz result."
          );
        }

        if (!cancelled) {
          setResult(data.result);
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

    fetchResult();

    return () => {
      cancelled = true;
    };
  }, [quizId, attemptId]);

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
            Loading your result...
          </p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <FiAlertCircle className="mx-auto text-4xl text-red-500" />

        <h2 className="mt-4 text-xl font-bold text-slate-800">
          Unable to Load Result
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          {error || "Result not found."}
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

  const passed = result.isPassed;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            passed ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {passed ? (
            <FiAward className="text-4xl text-green-600" />
          ) : (
            <FiAlertCircle className="text-4xl text-red-600" />
          )}
        </div>

        <h1 className="mt-5 text-3xl font-bold text-slate-800">
          Quiz Result
        </h1>

        <p className="mt-2 text-slate-500">
          {result.quizTitle}
        </p>

        <span
          className={`mt-4 inline-flex rounded-full px-5 py-2 text-sm font-bold ${
            passed
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {passed ? "Congratulations! You Passed" : "You Did Not Pass"}
        </span>
      </div>

      {/* Score Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-center text-sm font-medium text-slate-500">
          Your Score
        </p>

        <div className="mt-3 text-center">
          <h2 className="text-5xl font-extrabold text-slate-800">
            {Number(result.score.toFixed(2))}
            <span className="text-2xl font-semibold text-slate-400">
              {" "}/ {result.totalMarks}
            </span>
          </h2>

          <p className="mt-2 text-lg font-semibold text-blue-600">
            {Number(result.percentage.toFixed(2))}%
          </p>
        </div>

        <div className="mx-auto mt-6 h-3 max-w-xl overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${
              passed ? "bg-green-500" : "bg-red-500"
            }`}
            style={{
              width: `${Math.min(
                100,
                Math.max(0, result.percentage)
              )}%`,
            }}
          />
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          <p>
            Passing Marks:{" "}
            <strong className="text-slate-800">
              {result.passingMarks}
            </strong>
          </p>

          <p>
            Language:{" "}
            <strong className="uppercase text-slate-800">
              {result.selectedLanguage}
            </strong>
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FiCheckCircle />}
          title="Correct"
          value={result.correct}
          color="green"
        />

        <StatCard
          icon={<FiXCircle />}
          title="Wrong"
          value={result.wrong}
          color="red"
        />

        <StatCard
          icon={<FiMinusCircle />}
          title="Unanswered"
          value={result.unanswered}
          color="slate"
        />

        <StatCard
          icon={<FiAward />}
          title="Total Questions"
          value={result.totalQuestions}
          color="blue"
        />
      </div>

      {/* Marks Breakdown */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">
          Marks Breakdown
        </h2>

        <div className="mt-5 space-y-4">
          <BreakdownRow
            label="Marks from Correct Answers"
            value={result.correctMarks}
          />

          <BreakdownRow
            label="Negative Marks Deducted"
            value={result.negativeMarksDeducted}
            negative
          />

          <div className="border-t border-slate-200 pt-4">
            <BreakdownRow
              label="Final Score"
              value={result.score}
              bold
            />
          </div>
        </div>
      </div>

      {/* Attempt Details */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">
          Attempt Details
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <DetailItem
            label="Started At"
            value={formatDate(result.startedAt)}
          />

          <DetailItem
            label="Submitted At"
            value={formatDate(result.submittedAt)}
          />

          <DetailItem
            label="Attempt Status"
            value={result.status}
          />

          <DetailItem
            label="Submission Reason"
            value={
              result.autoSubmitReason || "Manual Submission"
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <FiHome />
          Back to Quizzes
        </Link>

<Link
  href={`/quiz/${quizId}/review/${attemptId}`}
  className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
>
  Review Answers
</Link>

<Link
  href={`/quizzes/${quizId}/leaderboard`}
  className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
>
  View Leaderboard
</Link>

      </div>
    </div>
  );
}

/* Reusable Components */

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: "green" | "red" | "slate" | "blue";
}) {
  const colors = {
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${colors[color]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">{title}</p>

      <h3 className="mt-1 text-2xl font-bold text-slate-800">
        {value}
      </h3>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  negative = false,
  bold = false,
}: {
  label: string;
  value: number;
  negative?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`text-sm ${
          bold
            ? "font-bold text-slate-800"
            : "text-slate-600"
        }`}
      >
        {label}
      </span>

      <span
        className={`text-sm ${
          bold
            ? "font-bold text-slate-900"
            : negative
              ? "font-semibold text-red-600"
              : "font-semibold text-slate-700"
        }`}
      >
        {negative ? "-" : ""}
        {Number(value.toFixed(2))}
      </span>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold capitalize text-slate-700">
        {value}
      </p>
    </div>
  );
}
