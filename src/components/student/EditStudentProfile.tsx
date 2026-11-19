
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiBookOpen,
  FiSave,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit2,
  FiX,
} from "react-icons/fi";

interface EditStudentProfileProps {
  fullName: string;
  phone: string;
  email: string;
  classLevel: string;
}

export default function EditStudentProfile({
  fullName,
  phone,
  email,
  classLevel,
}: EditStudentProfileProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(fullName);
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCancel = () => {
    setName(fullName);
    setPhoneNumber(phone);
    setError("");
    setMessage("");
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
          phone: phoneNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update profile.");
      }

      setName(result.profile.full_name);
      setPhoneNumber(result.profile.phone);
      setMessage("Profile updated successfully.");
      setIsEditing(false);

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Edit Profile
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Update your personal contact information.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setError("");
              setIsEditing(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003B64] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#002B4A]"
          >
            <FiEdit2 size={17} />
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <FiCheckCircle size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <FiAlertCircle size={18} />
          {error}
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Full Name
            </label>

            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                maxLength={80}
                required
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#003B64] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Phone Number
            </label>

            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                maxLength={20}
                required
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#003B64] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email Address
            </label>

            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="email"
                value={email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-500 outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Email cannot be changed here.
            </p>
          </div>

          {/* Class */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Class
            </label>

            <div className="relative">
              <FiBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={`Class ${classLevel}`}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-500 outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Contact your administrator to change your class.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              <FiX />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#003B64] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#002B4A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
