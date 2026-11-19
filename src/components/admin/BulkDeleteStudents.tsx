
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiTrash2, FiUsers, FiRefreshCw } from "react-icons/fi";

export default function BulkDeleteStudents() {
  const router = useRouter();

  const [classLevel, setClassLevel] = useState("");
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const checkStudents = async () => {
    if (!classLevel) {
      setError("Please select a class.");
      return;
    }

    setChecking(true);
    setError("");
    setResult(null);
    setStudentCount(null);

    try {
      const response = await fetch(
        `/api/admin/students/bulk-delete?classLevel=${classLevel}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch students.");
      }

      setStudentCount(data.studentCount);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setChecking(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!classLevel || studentCount === null || studentCount === 0) {
      return;
    }

    const confirmation = window.prompt(
      `You are about to permanently delete ${studentCount} students from Class ${classLevel}.\n\n` +
      "Their accounts, profiles, quiz attempts and answers will be deleted.\n\n" +
      'Type DELETE to continue.'
    );

    if (confirmation !== "DELETE") return;

    setDeleting(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/admin/students/bulk-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classLevel,
          confirmation: "DELETE",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setResult(data);
        setStudentCount(null);

        if (data.deletedCount > 0 || data.failedCount > 0) {
          await checkStudents();
        }

        return;
      }

      setResult(data);
      setStudentCount(0);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-red-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-red-50 p-3 text-red-600">
          <FiUsers size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Bulk Delete Students
          </h2>
          <p className="text-sm text-gray-500">
            Permanently remove all students from a selected class.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Select Class
          </label>

          <select
            value={classLevel}
            onChange={(e) => {
              setClassLevel(e.target.value);
              setStudentCount(null);
              setResult(null);
              setError("");
            }}
            disabled={checking || deleting}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Choose class</option>

            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={String(index + 1)}>
                Class {index + 1}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={checkStudents}
          disabled={!classLevel || checking || deleting}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <FiRefreshCw />
          {checking ? "Checking..." : "Check Students"}
        </button>
      </div>

      {studentCount !== null && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            Students in Class {classLevel}
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {studentCount}
          </p>

          {studentCount > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={deleting}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              <FiTrash2 />
              {deleting ? "Deleting Students..." : `Delete All Class ${classLevel} Students`}
            </button>
          )}

          {studentCount === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No students found in this class.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800">
            Deletion Summary
          </h3>

          <p className="mt-2 text-sm text-gray-600">
            Total students: {result.totalStudents ?? 0}
          </p>

          <p className="text-sm font-semibold text-green-700">
            Successfully deleted: {result.deletedCount ?? 0}
          </p>

          <p className="text-sm font-semibold text-red-600">
            Failed: {result.failedCount ?? 0}
          </p>

          {result.failedStudents?.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-sm font-semibold text-red-600">
                Students requiring attention:
              </p>

              {result.failedStudents.map((student: any) => (
                <p key={student.id} className="text-xs text-red-600">
                  {student.name}: {student.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
