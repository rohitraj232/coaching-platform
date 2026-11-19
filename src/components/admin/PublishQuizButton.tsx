
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSend, FiLoader } from "react-icons/fi";

type Props = {
  quizId: string;
};

export default function PublishQuizButton({ quizId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  async function handlePublish() {
    const confirmed = window.confirm(
      "Are you sure you want to publish this quiz? Students will be able to access it according to its schedule."
    );

    if (!confirmed) return;

    setLoading(true);
    setErrors([]);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/quizzes/${quizId}/publish`,
        { method: "POST" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(result.message || "Unable to publish quiz.");
        setErrors(result.errors || []);
        return;
      }

      setMessage(result.message);
      router.refresh();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-900">
        Publish Quiz
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Validate your questions and publish this quiz for students.
      </p>

      <button
        type="button"
        onClick={handlePublish}
        disabled={loading}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <FiLoader className="animate-spin" />
        ) : (
          <FiSend />
        )}
        {loading ? "Validating..." : "Validate & Publish"}
      </button>

      {message && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="font-semibold text-red-800">
            Please fix these issues:
          </h3>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
