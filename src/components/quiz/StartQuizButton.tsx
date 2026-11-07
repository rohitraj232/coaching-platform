
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlay } from "react-icons/fa";

interface StartQuizButtonProps {
  quizId: string;
}

export default function StartQuizButton({
  quizId,
}: StartQuizButtonProps) {
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi">("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/quizzes/${quizId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Unable to start quiz.");
        return;
      }

      // Navigate to the quiz attempt page.
      router.push(
        `/quiz/${quizId}/attempt/${result.attempt.id}`
      );
    } catch (error) {
      console.error("Start quiz error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Language Selection */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Select Quiz Language
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedLanguage("en")}
            className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
              selectedLanguage === "en"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600"
            }`}
          >
            English
          </button>

          <button
            type="button"
            onClick={() => setSelectedLanguage("hi")}
            className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
              selectedLanguage === "hi"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600"
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Start Button */}
      <button
        type="button"
        onClick={startQuiz}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FaPlay />

        {loading ? "Starting Quiz..." : "Start Quiz"}
      </button>
    </div>
  );
}
