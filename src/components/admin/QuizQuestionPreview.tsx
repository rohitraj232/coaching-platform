
"use client";

import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

type Translation = {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

type QuizQuestion = {
  id: string;
  question_code: string;
  question_order: number;
  marks: number;
  negative_marks: number;
  en: Translation | null;
  hi: Translation | null;
  correct_option: string | null;
  is_valid: boolean;
};

type Props = {
  quizId: string;
};

export default function QuizQuestionPreview({ quizId }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch(
          `/api/admin/quizzes/${quizId}/questions`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load questions.");
        }

        setQuestions(result.questions || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [quizId]);

  if (loading) {
    return (
      <div className="mt-6 rounded-xl border bg-white p-6">
        Loading questions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  const validCount = questions.filter((q) => q.is_valid).length;
  const invalidCount = questions.length - validCount;

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Question Preview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review uploaded English and Hindi questions.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {questions.length} Questions
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Total</p>
          <p className="mt-1 text-xl font-bold">{questions.length}</p>
        </div>

        <div className="rounded-xl bg-green-50 p-3">
          <p className="text-xs text-green-700">Valid</p>
          <p className="mt-1 text-xl font-bold text-green-700">
            {validCount}
          </p>
        </div>

        <div className="rounded-xl bg-red-50 p-3">
          <p className="text-xs text-red-700">Invalid</p>
          <p className="mt-1 text-xl font-bold text-red-700">
            {invalidCount}
          </p>
        </div>
      </div>

      {questions.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-500">
          No questions uploaded yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {questions.map((question) => {
            const isOpen = expanded === question.id;

            return (
              <div
                key={question.id}
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded(isOpen ? null : question.id)
                  }
                  className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {question.is_valid ? (
                      <FiCheckCircle className="shrink-0 text-green-600" />
                    ) : (
                      <FiAlertCircle className="shrink-0 text-red-600" />
                    )}

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">
                        {question.question_code}
                      </p>
                      <p className="text-xs text-slate-500">
                        {question.marks} marks · Negative:{" "}
                        {question.negative_marks}
                      </p>
                    </div>
                  </div>

                  {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                {isOpen && (
                  <div className="space-y-5 border-t bg-slate-50 p-4">
                    {(
                      [
                        ["English", question.en],
                        ["Hindi", question.hi],
                      ] as const
                    ).map(([language, translation]) => (
                      <div key={language}>
                        <h3 className="mb-2 text-sm font-bold text-slate-700">
                          {language}
                        </h3>

                        {translation ? (
                          <>
                            <p className="text-sm font-medium text-slate-900">
                              {translation.question_text}
                            </p>

                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              {(
                                [
                                  ["A", translation.option_a],
                                  ["B", translation.option_b],
                                  ["C", translation.option_c],
                                  ["D", translation.option_d],
                                ] as const
                              ).map(([option, value]) => (
                                <div
                                  key={option}
                                  className={`rounded-lg border p-3 text-sm ${
                                    question.correct_option === option
                                      ? "border-green-300 bg-green-50 font-semibold text-green-800"
                                      : "border-slate-200 bg-white text-slate-700"
                                  }`}
                                >
                                  {option}. {value}
                                  {question.correct_option === option && (
                                    <span className="ml-2 text-xs">
                                      (Correct answer)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-red-600">
                            Translation missing.
                          </p>
                        )}
                      </div>
                    ))}

                    <p className="text-xs text-slate-500">
                      Question order: {question.question_order}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
