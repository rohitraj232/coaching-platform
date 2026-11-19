
import { requireStudent } from "@/lib/auth/require-student";
import { createAdminClient } from "@/lib/supabase/admin";
import EditStudentProfile from "@/components/student/EditStudentProfile";

import {
  FiUser,
  FiPhone,
  FiBookOpen,
  FiCalendar,
  FiShield,
  FiCheckCircle,
  FiMail,
} from "react-icons/fi";
import type { ReactNode } from "react";

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#003B64]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-gray-800">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

export default async function StudentProfilePage() {
  const { user } = await requireStudent();

  const supabase = createAdminClient();

  const { data: student, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, class_level, role, is_active, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !student) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        Unable to load your profile. Please try again later.
      </div>
    );
  }

  const initials = (student.full_name || "Student")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word: string) => word[0].toUpperCase())
    .join("");

  const registeredDate = student.created_at
    ? new Date(student.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  return (
    <div className="mx-auto space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="h-32 bg-gradient-to-r from-[#003B64] to-[#0B5A93]" />

        <div className="px-6 pb-6 pt-4">
          <div className="-mt-12 mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-50 text-3xl font-bold text-[#003B64] shadow-sm">
                {initials || <FiUser />}
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {student.full_name || "Student"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Student Account · Class {student.class_level || "-"}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
                student.is_active
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <FiCheckCircle size={15} />
              {student.is_active ? "Active Account" : "Inactive Account"}
            </span>

            
          </div>

          <EditStudentProfile
  fullName={student.full_name || ""}
  phone={student.phone || ""}
  email={user.email || ""}
  classLevel={student.class_level || "-"}
/>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-bold text-gray-900">
          Personal Information
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Your registered personal details.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ProfileField
            icon={<FiUser />}
            label="Full Name"
            value={student.full_name}
          />
          <ProfileField
            icon={<FiPhone />}
            label="Phone Number"
            value={student.phone}
          />
          <ProfileField
            icon={<FiBookOpen />}
            label="Class"
            value={student.class_level ? `Class ${student.class_level}` : null}
          />
          <ProfileField
            icon={<FiMail />}
            label="Email Address"
            value={user.email}
          />
          <ProfileField
            icon={<FiShield />}
            label="Account Role"
            value="Student"
          />
          <ProfileField
            icon={<FiCalendar />}
            label="Registration Date"
            value={registeredDate}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-bold text-gray-900">
          Account Information
        </h3>

        <div className="mt-5 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Account Status
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Your account access status.
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                student.is_active
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {student.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-800">Student ID</p>
            <p className="mt-1 break-all text-sm text-gray-500">
              {student.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
