
"use client";

import { FormEvent, useRef, useState } from "react";
import {
  FiUploadCloud,
  FiFileText,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const CLASS_OPTIONS = ["8", "9", "10", "11", "12"];

interface UploadResponse {
  success: boolean;
  message: string;
}

export default function StudyMaterialUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  const handleFileChange = (selectedFile?: File) => {
    setMessage("");
    setMessageType("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      selectedFile.type !== "application/pdf" ||
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("Please select a valid PDF file.");
      setMessageType("error");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("PDF file size must not exceed 10 MB.");
      setMessageType("error");
      return;
    }

    setFile(selectedFile);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setClassLevel("");
    setSubject("");
    setChapter("");
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!title.trim() || !classLevel || !subject.trim() || !file) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    const formData = new FormData();

    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("classLevel", classLevel);
    formData.append("subject", subject.trim());
    formData.append("chapter", chapter.trim());
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await fetch("/api/admin/study-materials", {
        method: "POST",
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to upload study material.");
      }

      setMessage(result.message || "PDF uploaded successfully.");
      setMessageType("success");

      resetForm();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <FiFileText size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Upload Study Material
            </h2>
            <p className="text-sm text-gray-500">
              Add PDF notes and study materials for students.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label
            htmlFor="material-title"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Material Title <span className="text-red-500">*</span>
          </label>

          <input
            id="material-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mathematics - Chapter 1 Notes"
            maxLength={255}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="material-description"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Description
          </label>

          <textarea
            id="material-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a short description..."
            rows={3}
            maxLength={5000}
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* Class and Subject */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="material-class"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Class <span className="text-red-500">*</span>
            </label>

            <select
              id="material-class"
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="">Select Class</option>

              {CLASS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  Class {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="material-subject"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Subject <span className="text-red-500">*</span>
            </label>

            <input
              id="material-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              maxLength={100}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {/* Chapter */}
        <div>
          <label
            htmlFor="material-chapter"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Chapter
          </label>

          <input
            id="material-chapter"
            type="text"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="e.g. Chapter 1 - Real Numbers"
            maxLength={255}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* PDF Upload */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Upload PDF <span className="text-red-500">*</span>
          </label>

          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-orange-400 hover:bg-orange-50/30">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="hidden"
              id="material-file"
            />

            {!file ? (
              <label
                htmlFor="material-file"
                className="flex cursor-pointer flex-col items-center"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <FiUploadCloud size={25} />
                </div>

                <p className="text-sm font-semibold text-gray-800">
                  Click to upload PDF
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  PDF only · Maximum file size 10 MB
                </p>
              </label>
            ) : (
              <div className="flex items-center justify-between gap-3 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                    <FiFileText size={23} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {file.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setFile(null);

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove selected PDF"
                >
                  <FiX size={19} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            role="alert"
            className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {messageType === "success" ? (
              <FiCheckCircle className="mt-0.5 shrink-0" size={17} />
            ) : (
              <FiAlertCircle className="mt-0.5 shrink-0" size={17} />
            )}

            <span>{message}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={resetForm}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={17} />
                Uploading...
              </>
            ) : (
              <>
                <FiUploadCloud size={18} />
                Upload Study Material
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
