
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiEdit,
  FiSave,
  FiX,
  FiUser,
  FiPhone,
  FiBookOpen,
} from "react-icons/fi";

interface Student {
  id: string;
  full_name: string | null;
  phone: string | null;
  class_level: string | null;
}

interface EditStudentFormProps {
  student: Student;
}

export default function EditStudentForm({
  student,
}: EditStudentFormProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: student.full_name ?? "",
    phone: student.phone ?? "",
    class_level: student.class_level ?? "",
  });

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      full_name: student.full_name ?? "",
      phone: student.phone ?? "",
      class_level: student.class_level ?? "",
    });

    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.full_name.trim()) {
      setError("Student name is required.");
      return;
    }

    if (!formData.class_level) {
      setError("Please select a class.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/admin/students/${student.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update student details."
        );
      }

      setSuccess("Student details updated successfully.");
      setIsEditing(false);

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Student Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage the student's personal details.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
          >
            <FiEdit />
            Edit Details
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>

            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={formData.full_name}
                disabled={!isEditing || isSaving}
                onChange={(e) =>
                  handleChange("full_name", e.target.value)
                }
                maxLength={100}
                required
                placeholder="Enter student name"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-400 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Phone Number
            </label>

            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="tel"
                value={formData.phone}
                disabled={!isEditing || isSaving}
                onChange={(e) =>
                  handleChange("phone", e.target.value)
                }
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-400 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
          </div>

          {/* Class */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Class
            </label>

            <div className="relative">
              <FiBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <select
                value={formData.class_level}
                disabled={!isEditing || isSaving}
                onChange={(e) =>
                  handleChange("class_level", e.target.value)
                }
                required
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-400 disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Select Class</option>

                {Array.from({ length: 12 }, (_, index) => (
                  <option
                    key={index + 1}
                    value={String(index + 1)}
                  >
                    Class {index + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <FiX />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSave />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
