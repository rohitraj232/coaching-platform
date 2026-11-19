
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import EditStudyMaterial, {
    type StudyMaterial,
} from "@/components/admin/EditStudyMaterial";

import {
    FiSearch,
    FiRefreshCw,
    FiFileText,
    FiCalendar,
    FiFilter,
    FiLoader,
    FiAlertCircle,
    FiEye,
    FiEyeOff,
    FiEdit2,
    FiTrash2,
    FiAlertTriangle
} from "react-icons/fi";

const formatFileSize = (size: number | null) => {
    if (!size) return "N/A";

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

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

export default function StudyMaterialsList() {
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");

    const [editingMaterial, setEditingMaterial] =
        useState<StudyMaterial | null>(null);

    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<StudyMaterial | null>(null);
    const [deleteError, setDeleteError] = useState("");

    const handleDelete = async () => {
        if (!deleteTarget) return;

        const materialId = deleteTarget.id;

        try {
            setDeletingId(materialId);
            setDeleteError("");

            const response = await fetch(
                `/api/admin/study-materials/${materialId}`,
                { method: "DELETE" }
            );

            const result = await parseApiResponse(response);

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to delete study material.");
            }

            setMaterials((prev) =>
                prev.filter((material) => material.id !== materialId)
            );

            setDeleteTarget(null);
        } catch (error) {
            setDeleteError(
                error instanceof Error ? error.message : "Something went wrong."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // Fetch materials
    const fetchMaterials = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/admin/study-materials", {
                cache: "no-store",
            });

            const result = await parseApiResponse(response);

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to fetch materials."
                );
            }

            setMaterials(result.materials || []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while fetching materials."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    // Subjects for filter
    const subjects = useMemo(
        () =>
            [...new Set(materials.map((item) => item.subject))].sort(),
        [materials]
    );

    // Search and filters
    const filteredMaterials = useMemo(() => {
        return materials.filter((item) => {
            const searchText = search.toLowerCase();

            const matchesSearch =
                !searchText ||
                item.title.toLowerCase().includes(searchText) ||
                item.subject.toLowerCase().includes(searchText) ||
                (item.chapter || "").toLowerCase().includes(searchText);

            const matchesClass =
                !classFilter || item.class_level === classFilter;

            const matchesSubject =
                !subjectFilter || item.subject === subjectFilter;

            return matchesSearch && matchesClass && matchesSubject;
        });
    }, [materials, search, classFilter, subjectFilter]);

    // Publish / Unpublish
    const handlePublishToggle = async (material: StudyMaterial) => {
        const nextStatus = !material.is_published;

        try {
            setUpdatingId(material.id);

            const response = await fetch(
                `/api/admin/study-materials/${material.id}/publish`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isPublished: nextStatus,
                    }),
                }
            );

            const result = await parseApiResponse(response);

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to update status."
                );
            }

            setMaterials((previous) =>
                previous.map((item) =>
                    item.id === material.id
                        ? { ...item, is_published: nextStatus }
                        : item
                )
            );
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // Update material after editing
    const handleMaterialUpdated = (updatedMaterial: StudyMaterial) => {
        setMaterials((previous) =>
            previous.map((item) =>
                item.id === updatedMaterial.id
                    ? { ...item, ...updatedMaterial }
                    : item
            )
        );

        setEditingMaterial(null);
    };

    return (
        <>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Uploaded Study Materials
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage your PDF notes and study resources.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchMaterials}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        <FiRefreshCw
                            className={loading ? "animate-spin" : ""}
                            size={16}
                        />
                        Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-5 md:grid-cols-3">
                    <div className="relative">
                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={17}
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search materials..."
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <div className="relative">
                        <FiFilter
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={16}
                        />

                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-500"
                        >
                            <option value="">All Classes</option>

                            {["8", "9", "10", "11", "12"].map((item) => (
                                <option key={item} value={item}>
                                    Class {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500"
                    >
                        <option value="">All Subjects</option>

                        {subjects.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Results Count */}
                <div className="px-5 pt-4">
                    <p className="text-sm text-gray-500">
                        Showing{" "}
                        <span className="font-semibold text-gray-800">
                            {filteredMaterials.length}
                        </span>{" "}
                        of {materials.length} materials
                    </p>
                </div>

                {/* Content */}
                <div className="p-5">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
                            <FiLoader className="animate-spin" size={20} />
                            Loading study materials...
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center py-10 text-center">
                            <FiAlertCircle
                                className="mb-3 text-red-500"
                                size={28}
                            />

                            <p className="text-sm text-red-600">{error}</p>

                            <button
                                type="button"
                                onClick={fetchMaterials}
                                className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredMaterials.length === 0 ? (
                        <div className="py-12 text-center">
                            <FiFileText
                                className="mx-auto mb-3 text-gray-300"
                                size={38}
                            />

                            <h3 className="font-semibold text-gray-800">
                                {materials.length === 0
                                    ? "No study materials uploaded yet"
                                    : "No matching materials found"}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                {materials.length === 0
                                    ? "Upload your first PDF using the form above."
                                    : "Try changing your search or filters."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredMaterials.map((material) => (
                                <div
                                    key={material.id}
                                    className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-orange-200 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    {/* Material Details */}
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                            <FiFileText size={22} />
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="truncate font-semibold text-gray-900">
                                                {material.title}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {material.subject}
                                                {material.chapter && ` • ${material.chapter}`}
                                            </p>

                                            <p className="mt-1 truncate text-xs text-gray-400">
                                                {material.file_name} •{" "}
                                                {formatFileSize(material.file_size)}
                                            </p>

                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                    Class {material.class_level}
                                                </span>

                                                <span
                                                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${material.is_published
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-amber-50 text-amber-700"
                                                        }`}
                                                >
                                                    {material.is_published
                                                        ? "Published"
                                                        : "Draft"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date and Actions */}
                                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 sm:mr-2">
                                            <FiCalendar size={15} />

                                            {new Date(
                                                material.created_at
                                            ).toLocaleDateString("en-IN")}
                                        </div>

                                        {/* Edit */}
                                        <button
                                            type="button"
                                            onClick={() => setEditingMaterial(material)}
                                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                                        >
                                            <FiEdit2 size={15} />
                                            Edit
                                        </button>

                                        {/* Publish / Unpublish */}
                                        <button
                                            type="button"
                                            disabled={updatingId === material.id}
                                            onClick={() => handlePublishToggle(material)}
                                            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${material.is_published
                                                    ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                    : "bg-green-600 text-white hover:bg-green-700"
                                                }`}
                                        >
                                            {updatingId === material.id ? (
                                                <FiLoader className="animate-spin" size={15} />
                                            ) : material.is_published ? (
                                                <>
                                                    <FiEyeOff size={15} />
                                                    Unpublish
                                                </>
                                            ) : (
                                                <>
                                                    <FiEye size={15} />
                                                    Publish
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDeleteError("");
                                                setDeleteTarget(material);
                                            }}
                                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            <FiTrash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingMaterial && (
                <EditStudyMaterial
                    material={editingMaterial}
                    onClose={() => setEditingMaterial(null)}
                    onUpdated={handleMaterialUpdated}
                />
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <FiAlertTriangle size={24} />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900">
                            Delete Study Material?
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Are you sure you want to permanently delete{" "}
                            <span className="font-semibold text-gray-900">
                                {deleteTarget.title}
                            </span>
                            ? The PDF file and its database record will be deleted. This action
                            cannot be undone.
                        </p>

                        {deleteError && (
                            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {deleteError}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={deletingId !== null}
                                onClick={() => {
                                    setDeleteTarget(null);
                                    setDeleteError("");
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deletingId !== null}
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deletingId === deleteTarget.id ? (
                                    <>
                                        <FiLoader className="animate-spin" size={16} />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 size={16} />
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
