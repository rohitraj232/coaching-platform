
"use client";

import { FormEvent, useState } from "react";
import {
  FiYoutube,
  FiLink,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiImage,
} from "react-icons/fi";

import { getYouTubeVideoDetails } from "@/lib/youtube";

const CLASSES = ["8", "9", "10", "11", "12"];

interface ApiResponse {
  success: boolean;
  message: string;
}

export default function YouTubeVideoUpload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [classLevel, setClassLevel] = useState("12");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  const videoDetails = getYouTubeVideoDetails(youtubeUrl);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!videoDetails) {
      setMessage("Please enter a valid YouTube video URL.");
      setMessageType("error");
      return;
    }

    if (!title.trim() || !subject.trim()) {
      setMessage("Please enter video title and subject.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/youtube-videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          youtubeUrl,
          classLevel,
          subject,
          chapter,
          displayOrder: Number(displayOrder),
        }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to add video.");
      }

      setMessage("YouTube video added successfully!");
      setMessageType("success");

      // Reset form
      setTitle("");
      setDescription("");
      setYoutubeUrl("");
      setClassLevel("12");
      setSubject("");
      setChapter("");
      setDisplayOrder("0");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-red-50 p-3">
          <FiYoutube className="text-2xl text-red-600" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Add YouTube Video
          </h2>
          <p className="text-sm text-slate-500">
            Add a new lecture to your coaching website.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-5 flex items-start gap-2 rounded-lg border p-3 text-sm ${
            messageType === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {messageType === "success" ? (
            <FiCheckCircle className="mt-0.5 shrink-0" />
          ) : (
            <FiAlertCircle className="mt-0.5 shrink-0" />
          )}

          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Video Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Video Title <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            maxLength={255}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* YouTube URL */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            YouTube Video URL <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
              className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Supports YouTube, youtu.be and YouTube Shorts links.
          </p>
        </div>

        {/* Thumbnail Preview */}
        {youtubeUrl.trim() && (
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <FiImage />
              Thumbnail Preview
            </label>

            {videoDetails ? (
              <div className="max-w-md overflow-hidden rounded-lg border border-slate-200">
                <img
                  src={videoDetails.thumbnailUrl}
                  alt="YouTube video thumbnail"
                  className="aspect-video w-full object-cover"
                />

                <p className="bg-slate-50 px-3 py-2 text-xs text-green-700">
                  Video URL format is valid.
                </p>
              </div>
            ) : (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                Please enter a valid YouTube URL to see the thumbnail.
              </p>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description"
            rows={4}
            maxLength={5000}
            className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Class and Subject */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Class <span className="text-red-500">*</span>
            </label>

            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {CLASSES.map((item) => (
                <option key={item} value={item}>
                  Class {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Subject <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              maxLength={100}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Chapter and Display Order */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Chapter
            </label>

            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g. Real Numbers"
              maxLength={255}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Display Order
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              Lower numbers appear first.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Saving Video...
              </>
            ) : (
              <>
                <FiSave />
                Save Video
              </>
            )}
          </button>

          <p className="mt-3 text-xs text-slate-500">
            New videos are saved as drafts. You can publish them later.
          </p>
        </div>
      </form>
    </div>
  );
}
