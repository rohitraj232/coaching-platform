
"use client";

import { useEffect, useMemo, useState } from "react";
import {
    FiBookOpen,
    FiSearch,
    FiFileText,
    FiDownload,
    FiEye,
    FiLoader,
    FiAlertCircle,
    FiRefreshCw,
    FiX,
} from "react-icons/fi";

interface StudyMaterial {
    id: string;
    title: string;
    description: string | null;
    class_level: string;
    subject: string;
    chapter: string | null;
    file_name: string;
    file_size: number | null;
    mime_type: string;
    created_at: string;
}

interface Props {
    classLevel: string;
}

export default function StudentStudyMaterials({
    classLevel,
}: Props) {
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [activeMaterial, setActiveMaterial] = useState<string | null>(null);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/student/study-materials");
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to load study materials."
                );
            }

            setMaterials(result.materials || []);
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

    useEffect(() => {
        fetchMaterials();
    }, []);

    const subjects = useMemo(
        () => Array.from(new Set(materials.map((item) => item.subject))),
        [materials]
    );

    const filteredMaterials = useMemo(() => {
        const term = search.trim().toLowerCase();

        return materials.filter((item) => {
            const matchesSearch =
                !term ||
                item.title.toLowerCase().includes(term) ||
                item.subject.toLowerCase().includes(term) ||
                (item.chapter || "").toLowerCase().includes(term);

            const matchesSubject =
                subject === "all" || item.subject === subject;

            return matchesSearch && matchesSubject;
        });
    }, [materials, search, subject]);

    const getFileUrl = async (materialId: string) => {
        const response = await fetch(
            `/api/student/study-materials/${materialId}/download`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to access PDF.");
        }

        return result.material.url as string;
    };

    const handlePreview = async (material: StudyMaterial) => {
        try {
            setActiveMaterial(material.id);
            setError("");

            const url = await getFileUrl(material.id);

            setPreviewTitle(material.title);
            setPreviewUrl(url);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to preview PDF."
            );
        } finally {
            setActiveMaterial(null);
        }
    };

    const handleDownload = async (material: StudyMaterial) => {
        try {
            setActiveMaterial(material.id);
            setError("");

            const url = await getFileUrl(material.id);

            const link = document.createElement("a");
            link.href = url;
            link.download = material.file_name;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to download PDF."
            );
        } finally {
            setActiveMaterial(null);
        }
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return "PDF";

        return bytes < 1024 * 1024
            ? `${(bytes / 1024).toFixed(1)} KB`
            : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-600">
                            <FiBookOpen size={17} />
                            STUDY RESOURCES
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                            Study Materials
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Access your class {classLevel} notes and PDF study materials.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
                        <FiBookOpen className="text-orange-600" size={22} />
                        <div>
                            <p className="text-xs text-slate-500">Your Class</p>
                            <p className="font-bold text-slate-900">
                                Class {classLevel}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
                        <div className="relative">
                            <FiSearch
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={19}
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title, subject or chapter..."
                                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            />
                        </div>

                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                        >
                            <option value="all">All Subjects</option>
                            {subjects.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
                        <div className="flex-1">{error}</div>
                        <button
                            onClick={() => setError("")}
                            className="text-red-500 hover:text-red-700"
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex min-h-64 items-center justify-center">
                        <FiLoader className="animate-spin text-orange-500" size={32} />
                    </div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <FiFileText className="mx-auto mb-4 text-slate-300" size={48} />

                        <h3 className="text-lg font-semibold text-slate-800">
                            {materials.length === 0
                                ? "No Study Materials Available"
                                : "No Matching Materials Found"}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            {materials.length === 0
                                ? "Your teacher has not published any PDF materials for your class yet."
                                : "Try changing your search or subject filter."}
                        </p>

                        {materials.length === 0 && (
                            <button
                                onClick={fetchMaterials}
                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                            >
                                <FiRefreshCw size={15} />
                                Refresh
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Count */}
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-slate-800">
                                    {filteredMaterials.length}
                                </span>{" "}
                                PDF materials
                            </p>
                        </div>

                        {/* Materials */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filteredMaterials.map((material) => (
                                <div
                                    key={material.id}
                                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                            <FiFileText size={25} />
                                        </div>

                                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                            {material.subject}
                                        </span>
                                    </div>

                                    <h3 className="mt-5 line-clamp-2 text-lg font-bold text-slate-900">
                                        {material.title}
                                    </h3>

                                    {material.chapter && (
                                        <p className="mt-1 text-sm text-slate-500">
                                            Chapter: {material.chapter}
                                        </p>
                                    )}

                                    {material.description && (
                                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                                            {material.description}
                                        </p>
                                    )}

                                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                                        <span>
                                            {formatFileSize(material.file_size)}
                                        </span>
                                        <span>PDF Document</span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handlePreview(material)}
                                            disabled={activeMaterial !== null}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 px-3 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-50"
                                        >
                                            {activeMaterial === material.id ? (
                                                <FiLoader className="animate-spin" size={16} />
                                            ) : (
                                                <FiEye size={16} />
                                            )}
                                            Preview
                                        </button>

                                        <button
                                            onClick={() => handleDownload(material)}
                                            disabled={activeMaterial !== null}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                                        >
                                            <FiDownload size={16} />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* PDF Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-black/70 p-3 sm:p-6">
                    <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                            <div className="min-w-0">
                                <h3 className="truncate font-semibold text-slate-900">
                                    {previewTitle}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    PDF Preview
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setPreviewUrl("");
                                    setPreviewTitle("");
                                }}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                            >
                                <FiX size={19} />
                            </button>
                        </div>

                        <iframe
                            src={previewUrl}
                            title={previewTitle}
                            className="min-h-0 flex-1 bg-slate-100"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
