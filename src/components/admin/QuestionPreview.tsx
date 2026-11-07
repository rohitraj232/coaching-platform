
"use client";

import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiLoader,
} from "react-icons/fi";

type Translation = {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

type Question = {
  id: string;
  question_code: string;
  question_order: number;
  marks: number;
  negative_marks: number;
  en: Translation | null;
  hi: Translation | null;
  correct_option: "A" | "B" | "C" | "D" | null;
  is_valid: boolean;
};

type PreviewResponse = {
  success: boolean;
  message?: string;
  quiz?: {
    id: string;
    title: string;
    total_marks: number;
    is_published: boolean;
  };
  questions?: Question[];
  totalQuestions?: number;
  validQuestions?: number;
};

type Props = {
  quizId: string;
};

export default function QuestionPreview({ quizId }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadQuestions() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/quizzes/${quizId}/questions`,
        { cache: "no-store" }
      );

      const result: PreviewResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load questions.");
      }

      setQuestions(result.questions || []);
      setQuizTitle(result.quiz?.title || "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, [quizId]);

  const validCount = questions.filter((q) => q.is_valid).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border bg-white p-10 text-gray-500">
        <FiLoader className="animate-spin" />
        Loading questions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 font-semibold text-red-700">
          <FiAlertCircle />
          Unable to load questions
        </div>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          onClick={loadQuestions}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-10 text-center">
        <FiEye className="mx-auto mb-3 text-3xl text-gray-400" />
        <h3 className="font-semibold text-gray-800">
          No questions imported yet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload the English and Hindi Excel files to preview questions.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-xl border bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Question Preview
          </h2>
          <p className="mt-1 text-sm text-gray-500">{quizTitle}</p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700">
            Total: <strong>{questions.length}</strong>
          </span>
          <span className="rounded-lg bg-green-50 px-3 py-2 text-green-700">
            Valid: <strong>{validCount}</strong>
          </span>
          <span className="rounded-lg bg-red-50 px-3 py-2 text-red-700">
            Invalid: <strong>{questions.length - validCount}</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-800">
          Imported Questions
        </h3>

        <div className="flex rounded-lg border bg-white p-1">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              language === "en"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage("hi")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              language === "hi"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {questions.map((question) => {
        const translation = question[language];

        const options = [
          { key: "A", value: translation?.option_a },
          { key: "B", value: translation?.option_b },
          { key: "C", value: translation?.option_c },
          { key: "D", value: translation?.option_d },
        ];

        return (
          <article
            key={question.id}
            className="overflow-hidden rounded-xl border bg-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  {question.question_code}
                </span>
                <span className="text-sm text-gray-500">
                  Question {question.question_order}
                </span>
              </div>

              {question.is_valid ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
                  <FiCheckCircle />
                  Valid
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                  <FiAlertCircle />
                  Invalid
                </span>
              )}
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Question
                </p>
                <p className="font-medium leading-7 text-gray-900">
                  {translation?.question_text ||
                    "Translation not available"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {options.map((option) => {
                  const isCorrect =
                    question.correct_option === option.key;

                  return (
                    <div
                      key={option.key}
                      className={`rounded-lg border p-3 ${
                        isCorrect
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                          {option.key}
                        </span>
                        <span className="text-sm text-gray-800">
                          {option.value || "Missing option"}
                        </span>
                        {isCorrect && (
                          <FiCheckCircle className="ml-auto shrink-0 text-green-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-sm">
                <span className="text-gray-600">
                  Marks: <strong className="text-gray-900">{question.marks}</strong>
                </span>
                <span className="text-gray-600">
                  Negative marks:{" "}
                  <strong className="text-gray-900">
                    {question.negative_marks}
                  </strong>
                </span>
                <span className="text-gray-600">
                  Correct answer:{" "}
                  <strong className="text-green-700">
                    {question.correct_option || "Not set"}
                  </strong>
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
