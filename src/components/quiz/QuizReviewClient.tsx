
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiCheckCircle,
  FiXCircle,
  FiMinusCircle,
  FiArrowLeft,
  FiAlertCircle,
} from "react-icons/fi";

interface ReviewQuestion {
  questionId: string;
  questionCode: string;
  questionOrder: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selectedOption: string | null;
  correctOption: string | null;
  status: "correct" | "wrong" | "unanswered";
  marks: number;
  negativeMarks: number;
  marksAwarded: number;
  negativeMarksDeducted: number;
}

interface QuizReview {
  attemptId: string;
  quizId: string;
  selectedLanguage: string;
  submittedAt: string;
  totalQuestions: number;
  questions: ReviewQuestion[];
}

interface QuizReviewClientProps {
  quizId: string;
  attemptId: string;
}

export default function QuizReviewClient({
  quizId,
  attemptId,
}: QuizReviewClientProps) {
  const [review, setReview] = useState<QuizReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchReview() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/quizzes/${quizId}/attempts/${attemptId}/review`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load answer review."
          );
        }

        if (!cancelled) {
          setReview(data.review);
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

    fetchReview();

    return () => {
      cancelled = true;
    };
  }, [quizId, attemptId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-600">
            Loading answer review...
          </p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <FiAlertCircle className="mx-auto text-4xl text-red-500" />

        <h2 className="mt-4 text-xl font-bold text-slate-800">
          Unable to Load Review
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          {error || "Review not found."}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const correctCount = review.questions.filter(
    (question) => question.status === "correct"
  ).length;

  const wrongCount = review.questions.filter(
    (question) => question.status === "wrong"
  ).length;

  const unansweredCount = review.questions.filter(
    (question) => question.status === "unanswered"
  ).length;

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/quiz/${quizId}/result/${attemptId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <FiArrowLeft />
          Back to Result
        </Link>

        <h1 className="mt-5 text-2xl font-bold text-slate-800 sm:text-3xl">
          Answer Review
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Review your submitted answers and correct answers.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Correct"
          value={correctCount}
          color="green"
          icon={<FiCheckCircle />}
        />

        <SummaryCard
          label="Wrong"
          value={wrongCount}
          color="red"
          icon={<FiXCircle />}
        />

        <SummaryCard
          label="Unanswered"
          value={unansweredCount}
          color="slate"
          icon={<FiMinusCircle />}
        />
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {review.questions.map((question) => {
          const isCorrect = question.status === "correct";
          const isWrong = question.status === "wrong";
          const isUnanswered =
            question.status === "unanswered";

          const statusStyles = isCorrect
            ? "border-green-200 bg-green-50 text-green-700"
            : isWrong
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-slate-100 text-slate-600";

          return (
            <div
              key={question.questionId}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Question {question.questionOrder}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {question.questionCode}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusStyles}`}
                >
                  {question.status}
                </span>
              </div>

              {/* Question Body */}
              <div className="p-5">
                <h3 className="text-base font-semibold leading-7 text-slate-800">
                  {question.questionText}
                </h3>

                {/* Options */}
                <div className="mt-5 space-y-3">
                  {(
                    Object.entries(question.options) as [
                      "A" | "B" | "C" | "D",
                      string
                    ][]
                  ).map(([key, value]) => {
                    const isSelected =
                      question.selectedOption === key;

                    const isAnswer =
                      question.correctOption === key;

                    let optionStyle =
                      "border-slate-200 bg-white text-slate-700";

                    if (isAnswer) {
                      optionStyle =
                        "border-green-400 bg-green-50 text-green-800";
                    } else if (isSelected && !isAnswer) {
                      optionStyle =
                        "border-red-400 bg-red-50 text-red-800";
                    }

                    return (
                      <div
                        key={key}
                        className={`flex items-start gap-3 rounded-xl border p-4 ${optionStyle}`}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                          {key}
                        </span>

                        <div className="min-w-0 flex-1 pt-1 text-sm">
                          {value}
                        </div>

                        <div className="flex shrink-0 items-center gap-1 text-xs font-bold">
                          {isAnswer && (
                            <>
                              <FiCheckCircle className="text-green-600" />
                              <span className="text-green-700">
                                Correct
                              </span>
                            </>
                          )}

                          {isSelected && !isAnswer && (
                            <>
                              <FiXCircle className="text-red-600" />
                              <span className="text-red-700">
                                Your answer
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Unanswered message */}
                {isUnanswered && (
                  <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    You did not answer this question.
                  </p>
                )}

                {/* Marks */}
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm">
                  <p className="text-slate-500">
                    Marks:{" "}
                    <strong className="text-slate-800">
                      {question.marks}
                    </strong>
                  </p>

                  <p className="text-slate-500">
                    Awarded:{" "}
                    <strong className="text-green-700">
                      {question.marksAwarded}
                    </strong>
                  </p>

                  <p className="text-slate-500">
                    Negative Marks:{" "}
                    <strong className="text-red-600">
                      {question.negativeMarksDeducted}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action */}
      <div className="mt-8 text-center">
        <Link
          href={`/quiz/${quizId}/result/${attemptId}`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <FiArrowLeft />
          Back to Result
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: "green" | "red" | "slate";
  icon: React.ReactNode;
}) {
  const styles = {
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${styles[color]}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}
