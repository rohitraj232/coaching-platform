
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiUserCheck, FiUserX } from "react-icons/fi";

interface StudentStatusButtonProps {
  studentId: string;
  studentName: string;
  isActive: boolean;
}

export default function StudentStatusButton({
  studentId,
  studentName,
  isActive,
}: StudentStatusButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStatusChange = async () => {
    const nextStatus = !isActive;

    const confirmed = window.confirm(
      nextStatus
        ? `Are you sure you want to activate ${studentName}'s account?`
        : `Are you sure you want to deactivate ${studentName}'s account? The student will lose access to the student portal.`
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/students/${studentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: nextStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update student status."
        );
      }

      router.refresh();
    } catch (err) {
      console.error("Student status update error:", err);

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
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleStatusChange}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isActive
            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
        }`}
      >
        {isActive ? (
          <FiUserX />
        ) : (
          <FiUserCheck />
        )}

        {loading
          ? "Updating..."
          : isActive
            ? "Deactivate"
            : "Activate"}
      </button>

      {error && (
        <p className="max-w-[180px] text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
