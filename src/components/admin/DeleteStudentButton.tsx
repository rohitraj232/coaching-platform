
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi";

interface DeleteStudentButtonProps {
  studentId: string;
  studentName: string;
}

export default function DeleteStudentButton({
  studentId,
  studentName,
}: DeleteStudentButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    const confirmation = window.prompt(
      `WARNING: Permanently delete ${studentName}?\n\n` +
      "This will permanently delete their account, profile, " +
      "quiz attempts, answers, results and leaderboard records.\n\n" +
      'Type DELETE to confirm.'
    );

    if (confirmation !== "DELETE") return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/students/${studentId}/delete`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete student."
        );
      }

      alert("Student permanently deleted successfully.");

      router.push("/admin/students");
      router.refresh();
    } catch (err) {
      console.error("Delete student error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiTrash2 />

        {loading ? "Deleting..." : "Delete Student"}
      </button>

      {error && (
        <p className="max-w-xs text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
