
"use client";

import { FormEvent, useState } from "react";
import { FiX, FiSave, FiLoader } from "react-icons/fi";

export interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  class_level: string;
  subject: string;
  chapter: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

interface Props {
  material: StudyMaterial;
  onClose: () => void;
  onUpdated: (material: StudyMaterial) => void;
}

const CLASS_OPTIONS = ["8", "9", "10", "11", "12"];

async function parseApiResponse(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      `API returned an empty response. HTTP Status: ${response.status}`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid API response. HTTP Status: ${response.status}. ${text.slice(0, 200)}`
    );
  }
}

export default function EditStudyMaterial({
  material,
  onClose,
  onUpdated,
}: Props) {
  const [title, setTitle] = useState(material.title);
  const [description, setDescription] = useState(
    material.description || ""
  );
  const [classLevel, setClassLevel] = useState(material.class_level);
  const [subject, setSubject] = useState(material.subject);
  const [chapter, setChapter] = useState(material.chapter || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/study-materials/${material.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            classLevel,
            subject,
            chapter,
          }),
        }
      );

      const result = await parseApiResponse(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update material."
        );
      }

      onUpdated(result.material);
      onClose();
    } catch (err) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Study Material
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Update PDF material details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close edit form"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Material Title *
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={5000}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Class *
              </label>

              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
              >
                {CLASS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    Class {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Subject *
              </label>

              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={100}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Chapter
            </label>

            <input
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              maxLength={255}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={17} />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
