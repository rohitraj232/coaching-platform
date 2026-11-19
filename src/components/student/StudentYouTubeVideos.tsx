
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiYoutube,
  FiPlay,
  FiRefreshCw,
  FiAlertCircle,
  FiBookOpen,
  FiCalendar,
  FiExternalLink,
  FiX,
} from "react-icons/fi";

interface StudentYouTubeVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_video_id: string;
  thumbnail_url: string | null;
  class_level: string;
  subject: string;
  chapter: string | null;
  created_at: string;
}

interface StudentYouTubeVideosResponse {
  success: boolean;
  classLevel: string;
  total: number;
  videos: StudentYouTubeVideo[];
  message?: string;
}

interface StudentYouTubeVideosProps {
  classLevel: string;
}

export default function StudentYouTubeVideos({
  classLevel,
}: StudentYouTubeVideosProps) {
  const [videos, setVideos] = useState<StudentYouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/student/youtube-videos", {
        method: "GET",
        cache: "no-store",
      });

      const data: StudentYouTubeVideosResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load YouTube videos."
        );
      }

      setVideos(data.videos || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading videos."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Get unique subjects
  const subjects = useMemo(() => {
    const subjectMap = new Map<string, string>();

    videos.forEach((video) => {
      const subject = video.subject.trim();

      if (subject) {
        const key = subject.toLowerCase();

        if (!subjectMap.has(key)) {
          subjectMap.set(key, subject);
        }
      }
    });

    return Array.from(subjectMap.values()).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [videos]);

  // Search and filter videos
  const filteredVideos = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return videos.filter((video) => {
      const matchesSearch =
        !searchText ||
        video.title.toLowerCase().includes(searchText) ||
        (video.description || "").toLowerCase().includes(searchText) ||
        video.subject.toLowerCase().includes(searchText) ||
        (video.chapter || "").toLowerCase().includes(searchText);

      const matchesSubject =
        selectedSubject === "all" ||
        video.subject.toLowerCase() ===
          selectedSubject.toLowerCase();

      return matchesSearch && matchesSubject;
    });
  }, [videos, search, selectedSubject]);

  const formatDate = (date: string) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedSubject("all");
  };

  const hasFilters =
    search.trim() !== "" || selectedSubject !== "all";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <FiYoutube size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  YouTube Videos
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Watch video lectures prepared for your class.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchVideos}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw
              className={loading ? "animate-spin" : ""}
              size={16}
            />
            Refresh Videos
          </button>
        </div>

        {/* Class and Video Count */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Your Class</p>
            <h2 className="mt-2 text-2xl font-bold text-[#003B64]">
              Class {classLevel}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Available Video Lectures
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#003B64]">
              {loading ? "..." : videos.length}
            </h2>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative md:col-span-2">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, subject or chapter..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#003B64] focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>

            {/* Subject Filter */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) =>
                  setSelectedSubject(e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#003B64] focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Subjects</option>

                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {loading ? "..." : filteredVideos.length}
              </span>{" "}
              video(s)
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-[#003B64] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <div className="aspect-video animate-pulse bg-gray-200" />

                <div className="space-y-3 p-5">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <FiAlertCircle
              size={35}
              className="mx-auto text-red-500"
            />

            <h3 className="mt-3 text-lg font-semibold text-gray-900">
              Unable to Load Videos
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchVideos}
              className="mt-5 rounded-lg bg-[#003B64] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002d4d]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredVideos.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              {hasFilters ? (
                <FiSearch size={28} />
              ) : (
                <FiYoutube size={30} />
              )}
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {hasFilters
                ? "No Videos Found"
                : "No Videos Available Yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {hasFilters
                ? "No videos match your search or selected subject. Try changing your filters."
                : "Your teachers have not published any video lectures for your class yet. Please check again later."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 font-semibold text-[#003B64] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Video Cards */}
        {!loading && !error && filteredVideos.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Thumbnail */}
                <a
                  href={video.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Watch ${video.title} on YouTube`}
                  className="relative block aspect-video overflow-hidden bg-gray-100"
                >
                  <img
                    src={
                      video.thumbnail_url ||
                      `https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`
                    }
                    alt={video.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/35">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition duration-300 group-hover:scale-110">
                      <FiPlay size={25} fill="currentColor" />
                    </div>
                  </div>

                  <span className="absolute bottom-3 right-3 rounded-md bg-black/75 px-2.5 py-1 text-xs font-semibold text-white">
                    <FiYoutube className="mr-1 inline" size={14} />
                    YouTube
                  </span>
                </a>

                {/* Video Details */}
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#003B64]">
                      Class {video.class_level}
                    </span>

                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                      {video.subject}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-gray-900 transition group-hover:text-[#003B64]">
                    {video.title}
                  </h3>

                  {video.chapter && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <FiBookOpen
                        size={15}
                        className="shrink-0 text-gray-400"
                      />
                      <span className="line-clamp-1">
                        Chapter: {video.chapter}
                      </span>
                    </p>
                  )}

                  {video.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                      {video.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <FiCalendar size={14} />
                      {formatDate(video.created_at)}
                    </span>

                    <a
                      href={video.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 transition hover:text-red-700"
                    >
                      Watch Video
                      <FiExternalLink size={15} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
