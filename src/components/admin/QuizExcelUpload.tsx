"use client";

import { useState, type FormEvent } from "react";
import {
  FiUploadCloud,
  FiFile,
  FiCheckCircle,
} from "react-icons/fi";

type Props = {
  quizId: string;
};

export default function QuizExcelUpload({ quizId }: Props) {
  const [englishFile, setEnglishFile] = useState<File | null>(null);
  const [hindiFile, setHindiFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!englishFile || !hindiFile) {
      setError("Please select both English and Hindi Excel files.");
      return;
    }

    const formData = new FormData();
    formData.append("englishFile", englishFile);
    formData.append("hindiFile", hindiFile);

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/quizzes/${quizId}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed.");
      }

      setMessage(result.message);
      setEnglishFile(null);
      setHindiFile(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const fileInputClass =
    "mt-3 block w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Upload Question Files
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload both language files for this quiz. Question codes and
          marking details will be checked before saving.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <FiFile className="text-blue-600" size={20} />
            English Questions
          </div>

          <input
            type="file"
            accept=".xlsx"
            className={fileInputClass}
            onChange={(event) =>
              setEnglishFile(event.target.files?.[0] ?? null)
            }
          />

          {englishFile && (
            <p className="mt-2 truncate text-xs text-green-700">
              {englishFile.name}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <FiFile className="text-green-600" size={20} />
            Hindi Questions
          </div>

          <input
            type="file"
            accept=".xlsx"
            className={fileInputClass}
            onChange={(event) =>
              setHindiFile(event.target.files?.[0] ?? null)
            }
          />

          {hindiFile && (
            <p className="mt-2 truncate text-xs text-green-700">
              {hindiFile.name}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-semibold">Before uploading</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>Use .xlsx format.</li>
          <li>Both files must contain matching question codes.</li>
          <li>Correct options and marks must match.</li>
          <li>Maximum 500 questions per upload.</li>
          <li>Upload only once per quiz.</li>
        </ul>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <FiCheckCircle size={18} />
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !englishFile || !hindiFile}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <FiUploadCloud size={18} />
        {loading ? "Validating and uploading..." : "Validate & Upload Questions"}
      </button>
    </form>
  );
}