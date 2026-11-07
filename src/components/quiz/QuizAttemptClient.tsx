
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaFlag,
  FaPaperPlane,
} from "react-icons/fa";

type Option = "A" | "B" | "C" | "D";

type QuizQuestion = {
  id: string;
  questionText: string;
  questionCode: string;
  questionOrder: number;
  marks: number;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selectedOption: Option | null;
};

type Props = {
  quizId: string;
  attemptId: string;
};

export default function QuizAttemptClient({
  quizId,
  attemptId,
}: Props) {
  const router = useRouter();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const submitStarted = useRef(false);
  const currentQuestion = questions[currentIndex];

  const answeredCount = questions.filter(
    (question) => question.selectedOption !== null
  ).length;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remaining
    ).padStart(2, "0")}`;
  };

  // Load questions and previously saved answers.
  useEffect(() => {
    let active = true;

    async function loadQuestions() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/quizzes/${quizId}/attempts/${attemptId}/questions`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load quiz.");
        }

        if (!active) return;

        setQuestions(result.questions);
        setRemainingSeconds(result.remainingSeconds);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load quiz."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQuestions();

    return () => {
      active = false;
    };
  }, [quizId, attemptId]);

  // Submit quiz only once from this browser instance.
  const submitQuiz = useCallback(
    async (reason?: string) => {
      if (submitStarted.current) return;

      submitStarted.current = true;
      setSubmitting(true);
      setWarning("");

      try {
        const response = await fetch(
          `/api/quizzes/${quizId}/attempts/${attemptId}/submit`,
          { method: "POST" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Submission failed.");
        }

        router.replace(
          `/quiz/${quizId}/result/${attemptId}`
        );
        router.refresh();
      } catch (err) {
        submitStarted.current = false;
        setSubmitting(false);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to submit quiz."
        );
      }
    },
    [quizId, attemptId, router]
  );

  // Countdown timer.
  useEffect(() => {
    if (loading || error || submitting || remainingSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [loading, error, submitting, remainingSeconds]);

  useEffect(() => {
    if (!loading && remainingSeconds === 0 && questions.length > 0) {
      submitQuiz("time_expired");
    }
  }, [loading, remainingSeconds, questions.length, submitQuiz]);

  // Detect page becoming hidden and record a tab switch.
  useEffect(() => {
    if (loading || error || submitting) return;

    let requestInProgress = false;

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "hidden") return;
      if (requestInProgress || submitStarted.current) return;

      requestInProgress = true;

      try {
        const response = await fetch(
          `/api/quizzes/${quizId}/attempts/${attemptId}/tab-switch`,
          { method: "POST" }
        );

        const result = await response.json();

        if (result.expired || result.shouldSubmit) {
          await submitQuiz(
            result.expired ? "time_expired" : "tab_switch_limit"
          );
          return;
        }

        if (result.success) {
          const count = result.tabSwitchCount;

          if (count === 1) {
            setWarning(
              "Warning 1: You left the quiz screen. Please stay on this page."
            );
          } else if (count === 2) {
            setWarning(
              "Final warning: One more detected switch will submit your quiz."
            );
          }
        } else if (response.status !== 409) {
          setError(result.message || "Unable to record tab switch.");
        }
      } catch {
        setError("Unable to record tab switch. Please check your connection.");
      } finally {
        requestInProgress = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [loading, error, submitting, quizId, attemptId, submitQuiz]);

  // Save selected answer.
  const selectAnswer = async (option: Option) => {
    if (!currentQuestion || saving || submitting) return;

    const questionId = currentQuestion.id;
    const previousAnswer = currentQuestion.selectedOption;

    if (previousAnswer === option) return;

    setQuestions((previous) =>
      previous.map((question) =>
        question.id === questionId
          ? { ...question, selectedOption: option }
          : question
      )
    );

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/quizzes/${quizId}/attempts/${attemptId}/answers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId,
            selectedOption: option,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save answer.");
      }
    } catch (err) {
      setQuestions((previous) =>
        previous.map((question) =>
          question.id === questionId
            ? { ...question, selectedOption: previousAnswer }
            : question
        )
      );

      setError(
        err instanceof Error ? err.message : "Unable to save answer."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading your quiz...</p>
      </main>
    );
  }

  if (error && questions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="mt-5 rounded-lg bg-blue-900 px-5 py-2 text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return <p className="p-8 text-center">No questions available.</p>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Online Examination
            </h1>
            <p className="text-sm text-slate-500">
              Answer all questions carefully.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-orange-700">
            <FaClock />
            <span className="font-bold tabular-nums">
              {formatTime(remainingSeconds)}
            </span>
          </div>
        </div>

        {/* Warning */}
        {warning && (
          <div className="mb-5 rounded-xl border border-orange-300 bg-orange-50 p-4 text-sm font-medium text-orange-800">
            {warning}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">

          {/* Question area */}
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900">
                Question {currentIndex + 1} of {questions.length}
              </span>

              <span className="text-sm text-slate-500">
                Marks: {currentQuestion.marks}
              </span>
            </div>

            <h2 className="mb-8 text-lg font-semibold leading-8 text-slate-900">
              {currentQuestion.questionText}
            </h2>

            <div className="space-y-3">
              {(["A", "B", "C", "D"] as Option[]).map((option) => {
                const selected =
                  currentQuestion.selectedOption === option;

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={saving || submitting}
                    onClick={() => selectAnswer(option)}
                    className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-blue-900 bg-blue-50"
                        : "border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        selected
                          ? "bg-blue-900 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {option}
                    </span>

                    <span className="pt-1 text-sm text-slate-800">
                      {currentQuestion.options[option]}
                    </span>

                    {selected && (
                      <FaCheckCircle className="ml-auto mt-1 text-blue-900" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
              <button
                type="button"
                disabled={currentIndex === 0 || saving || submitting}
                onClick={() => setCurrentIndex((index) => index - 1)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40"
              >
                <FaArrowLeft />
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  disabled={saving || submitting}
                  onClick={() => setCurrentIndex((index) => index + 1)}
                  className="flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Next
                  <FaArrowRight />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving || submitting}
                  onClick={() => submitQuiz("manual_submission")}
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <FaPaperPlane />
                  Submit Quiz
                </button>
              )}
            </div>

            {saving && (
              <p className="mt-3 text-right text-xs text-slate-500">
                Saving answer...
              </p>
            )}
          </section>

          {/* Question palette */}
          <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-900">
              Question Palette
            </h3>

            <div className="mb-5 grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const isCurrent = currentIndex === index;
                const isAnswered = question.selectedOption !== null;

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`flex h-10 items-center justify-center rounded-lg text-sm font-semibold ${
                      isCurrent
                        ? "bg-blue-900 text-white ring-2 ring-blue-300"
                        : isAnswered
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total questions</span>
                <strong>{questions.length}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Answered</span>
                <strong className="text-green-700">{answeredCount}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Not answered</span>
                <strong className="text-red-600">
                  {questions.length - answeredCount}
                </strong>
              </div>
            </div>

            <button
              type="button"
              disabled={saving || submitting}
              onClick={() => submitQuiz("manual_submission")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              <FaFlag />
              Submit Test
            </button>
          </aside>
        </div>

        {submitting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
              <p className="text-lg font-bold text-slate-900">
                Submitting your quiz...
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Please don't close this page.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
