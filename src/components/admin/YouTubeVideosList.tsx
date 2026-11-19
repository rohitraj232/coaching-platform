
"use client";

import { useCallback, useEffect, useState } from "react";
import {
    FiYoutube,
    FiSearch,
    FiFilter,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiAlertCircle,
    FiLoader,
    FiPlayCircle,
    FiCalendar,
    FiBookOpen,
    FiEdit2,
    FiX,
    FiSave,
    FiTrash2,
    FiAlertTriangle,
} from "react-icons/fi";
import { getYouTubeVideoDetails } from "@/lib/youtube";

interface YouTubeVideo {
    id: string;
    title: string;
    description: string | null;
    youtube_url: string;
    youtube_video_id: string;
    thumbnail_url: string | null;
    class_level: string;
    subject: string;
    chapter: string | null;
    is_published: boolean;
    display_order: number;
    created_at: string;
}

interface ApiResponse {
    success: boolean;
    message?: string;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    videos: YouTubeVideo[];
}

interface EditVideoModalProps {
    video: YouTubeVideo;
    onClose: () => void;
    onUpdated: (video: YouTubeVideo) => void;
}

function EditVideoModal({
    video,
    onClose,
    onUpdated,
}: EditVideoModalProps) {
    const [title, setTitle] = useState(video.title);
    const [youtubeUrl, setYoutubeUrl] = useState(video.youtube_url);
    const [description, setDescription] = useState(
        video.description || ""
    );
    const [classLevel, setClassLevel] = useState(video.class_level);
    const [subject, setSubject] = useState(video.subject);
    const [chapter, setChapter] = useState(video.chapter || "");
    const [displayOrder, setDisplayOrder] = useState(
        String(video.display_order)
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const videoDetails = getYouTubeVideoDetails(youtubeUrl);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!title.trim() || !youtubeUrl.trim() || !subject.trim()) {
            setError("Please fill all required fields.");
            return;
        }

        if (!videoDetails) {
            setError("Please enter a valid YouTube URL.");
            return;
        }

        const order = Number(displayOrder);

        if (!Number.isInteger(order) || order < 0) {
            setError("Display order must be a non-negative integer.");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                `/api/admin/youtube-videos/${video.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        youtubeUrl,
                        description,
                        classLevel,
                        subject,
                        chapter,
                        displayOrder: order,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to update video.");
            }

            onUpdated(result.video);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-xl">

                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-200 p-5">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">
                            Edit YouTube Video
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Update your video information.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="space-y-4 p-5">

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            <FiAlertCircle />
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Video Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={255}
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* YouTube URL */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            YouTube URL *
                        </label>
                        <input
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        {videoDetails ? (
                            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                                <img
                                    src={videoDetails.thumbnailUrl}
                                    alt="YouTube thumbnail preview"
                                    className="aspect-video max-h-48 w-full bg-slate-100 object-contain"
                                />
                            </div>
                        ) : youtubeUrl.trim() ? (
                            <p className="mt-2 text-xs text-red-500">
                                Invalid YouTube URL.
                            </p>
                        ) : null}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={5000}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Class and Subject */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Class *
                            </label>
                            <select
                                value={classLevel}
                                onChange={(e) => setClassLevel(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                            >
                                <option value="8">Class 8</option>
                                <option value="9">Class 9</option>
                                <option value="10">Class 10</option>
                                <option value="11">Class 11</option>
                                <option value="12">Class 12</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Subject *
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                maxLength={100}
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Chapter and Display Order */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Chapter
                            </label>
                            <input
                                type="text"
                                value={chapter}
                                onChange={(e) => setChapter(e.target.value)}
                                maxLength={255}
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Display Order
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <FiLoader className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FiSave />
                                    Update Video
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function YouTubeVideosList() {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [classLevel, setClassLevel] = useState("");
    const [subject, setSubject] = useState("");

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [editingVideo, setEditingVideo] =
        useState<YouTubeVideo | null>(null);

    // Delete states belong in the parent list component.
    const [deletingVideo, setDeletingVideo] =
        useState<YouTubeVideo | null>(null);

    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const [updatingVideoId, setUpdatingVideoId] = useState<string | null>(null);

    const handlePublishToggle = async (video: YouTubeVideo) => {
        try {
            setUpdatingVideoId(video.id);

            const newStatus = !video.is_published;

            const response = await fetch(
                `/api/admin/youtube-videos/${video.id}/publish`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isPublished: newStatus,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to update video status.");
            }

            setVideos((previousVideos) =>
                previousVideos.map((item) =>
                    item.id === video.id
                        ? { ...item, is_published: newStatus }
                        : item
                )
            );
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setUpdatingVideoId(null);
        }
    };

    const limit = 10;

    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });

            if (search.trim()) {
                params.set("search", search.trim());
            }

            if (classLevel) {
                params.set("classLevel", classLevel);
            }

            if (subject.trim()) {
                params.set("subject", subject.trim());
            }

            const response = await fetch(
                `/api/admin/youtube-videos?${params.toString()}`,
                { cache: "no-store" }
            );

            const result: ApiResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to fetch videos."
                );
            }

            setVideos(result.videos || []);
            setTotal(result.total || 0);
            setTotalPages(result.totalPages || 0);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }, [page, search, classLevel, subject]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleClassChange = (value: string) => {
        setClassLevel(value);
        setPage(1);
    };

    const handleSubjectChange = (value: string) => {
        setSubject(value);
        setPage(1);
    };

    // Update video in the list after successful editing.
    const handleVideoUpdated = (updatedVideo: YouTubeVideo) => {
        setVideos((currentVideos) =>
            currentVideos.map((video) =>
                video.id === updatedVideo.id ? updatedVideo : video
            )
        );

        setEditingVideo(null);
    };

    // Permanently delete a video.
    const handleDeleteVideo = async () => {
        if (!deletingVideo) return;

        try {
            setDeleting(true);
            setDeleteError("");

            const response = await fetch(
                `/api/admin/youtube-videos/${deletingVideo.id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to delete video."
                );
            }

            setVideos((currentVideos) =>
                currentVideos.filter(
                    (video) => video.id !== deletingVideo.id
                )
            );

            const newTotal = Math.max(0, total - 1);
            const newTotalPages = Math.ceil(newTotal / limit);

            setTotal(newTotal);
            setTotalPages(newTotalPages);
            setDeletingVideo(null);

            // Move to the previous page if the current page becomes empty.
            if (videos.length === 1 && page > 1) {
                setPage((current) => current - 1);
            }
        } catch (err) {
            setDeleteError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <>
            <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                {/* Header */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">
                            All YouTube Videos
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage and view your uploaded video records.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchVideos}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search video title..."
                            className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="relative">
                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            value={classLevel}
                            onChange={(e) => handleClassChange(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All Classes</option>
                            <option value="8">Class 8</option>
                            <option value="9">Class 9</option>
                            <option value="10">Class 10</option>
                            <option value="11">Class 11</option>
                            <option value="12">Class 12</option>
                        </select>
                    </div>

                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                        placeholder="Filter by subject..."
                        maxLength={100}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* Total Count */}
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                        Total videos:{" "}
                        <span className="font-semibold text-slate-800">
                            {total}
                        </span>
                    </p>

                    <p className="text-xs text-slate-500">
                        Showing {videos.length} of {total}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <FiAlertCircle />
                        {error}
                    </div>
                )}

                {/* Loading / Empty / Video List */}
                {loading ? (
                    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-slate-500">
                        <FiLoader className="animate-spin text-2xl" />
                        <p className="text-sm">Loading videos...</p>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 text-center">
                        <FiYoutube className="text-4xl text-slate-300" />

                        <div>
                            <p className="font-medium text-slate-700">
                                No videos found
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Add a new video or change your filters.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 sm:flex-row"
                            >
                                {/* Thumbnail */}
                                <a
                                    href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.youtube_video_id)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative block aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-52"
                                >
                                    {video.thumbnail_url ? (
                                        <img
                                            src={video.thumbnail_url}
                                            alt={video.title}
                                            className="h-full w-full object-cover transition group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <FiYoutube className="text-4xl text-slate-400" />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                                        <FiPlayCircle className="text-4xl text-white" />
                                    </div>
                                </a>

                                {/* Video Details */}
                                <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                                        <h3 className="font-semibold text-slate-800">
                                            {video.title}
                                        </h3>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${video.is_published
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-amber-100 text-amber-700"
                                                }`}
                                        >
                                            {video.is_published ? "Published" : "Draft"}
                                        </span>
                                    </div>

                                    {video.description && (
                                        <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                                            {video.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <FiBookOpen />
                                            Class {video.class_level}
                                        </span>

                                        <span>Subject: {video.subject}</span>

                                        {video.chapter && (
                                            <span>Chapter: {video.chapter}</span>
                                        )}

                                        <span className="flex items-center gap-1">
                                            <FiCalendar />
                                            {formatDate(video.created_at)}
                                        </span>

                                        <span>Order: {video.display_order}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <a
                                            href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.youtube_video_id)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            <FiYoutube />
                                            Open on YouTube
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => setEditingVideo(video)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                                        >
                                            <FiEdit2 size={16} />
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDeleteError("");
                                                setDeletingVideo(video);
                                            }}
                                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            <FiTrash2 size={16} />
                                            Delete
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handlePublishToggle(video)}
                                            disabled={updatingVideoId === video.id}
                                            className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${video.is_published
                                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                                }`}
                                        >
                                            {updatingVideoId === video.id
                                                ? "Updating..."
                                                : video.is_published
                                                    ? "Unpublish"
                                                    : "Publish"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                        <p className="text-sm text-slate-500">
                            Page {page} of {totalPages}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((prev) => prev - 1)}
                                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronLeft />
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setPage((prev) => prev + 1)}
                                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <FiChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Edit Video Modal */}
            {editingVideo && (
                <EditVideoModal
                    video={editingVideo}
                    onClose={() => setEditingVideo(null)}
                    onUpdated={handleVideoUpdated}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingVideo && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-red-100 p-3 text-red-600">
                                <FiAlertTriangle size={22} />
                            </div>

                            <h2 className="text-lg font-semibold text-slate-800">
                                Delete YouTube Video?
                            </h2>
                        </div>

                        <p className="mb-2 text-sm text-slate-600">
                            Are you sure you want to permanently delete this video?
                        </p>

                        <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-800">
                            {deletingVideo.title}
                        </p>

                        <p className="mb-4 text-xs text-red-600">
                            This action cannot be undone. The video will only be
                            removed from your coaching website, not from YouTube.
                        </p>

                        {deleteError && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                <FiAlertCircle />
                                {deleteError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setDeletingVideo(null)}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDeleteVideo}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? (
                                    <>
                                        <FiLoader className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 />
                                        Delete Permanently
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
