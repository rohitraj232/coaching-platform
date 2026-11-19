
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiMenu,
  FiChevronDown,
  FiUser,
  FiBookOpen,
} from "react-icons/fi";
import LogoutButton from "@/components/auth/LogoutButton";

interface StudentHeaderProps {
  studentName: string;
  classLevel: string;
  onMenuClick: () => void;
}

export default function StudentHeader({
  studentName,
  classLevel,
  onMenuClick,
}: StudentHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  const pageTitles: Record<string, string> = {
    "/student": "Student Dashboard",
    "/quizzes": "Available Quizzes",
    "/my-quizzes": "My Quiz History",
    "/student/profile": "My Profile",
    "/leaderboard": "Leaderboard",
  };

  const pageTitle =
    pageTitles[pathname] ||
    (pathname.startsWith("/quiz/") ? "Quiz Details" : "Student Portal");

  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
          aria-label="Toggle sidebar"
        >
          <FiMenu size={23} />
        </button>

        <div>
          <h1 className="text-lg font-bold text-gray-800 sm:text-xl">
            {pageTitle}
          </h1>
          <p className="hidden text-xs text-gray-500 sm:block">
            Welcome to your learning portal
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          aria-expanded={profileOpen}
          className="flex items-center gap-2 rounded-xl p-2 transition hover:bg-gray-50 sm:gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003B64] text-sm font-bold text-white">
            {initials || <FiUser />}
          </div>

          <div className="hidden text-left sm:block">
            <p className="max-w-[150px] truncate text-sm font-semibold text-gray-800">
              {studentName}
            </p>
            <p className="text-xs text-gray-500">Class {classLevel}</p>
          </div>

          <FiChevronDown
            className={`hidden text-gray-500 transition sm:block ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {profileOpen && (
          <>
            <button
              type="button"
              aria-label="Close profile menu"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setProfileOpen(false)}
            />

            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-[#003B64]">
                  <FiUser size={21} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {studentName}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <FiBookOpen />
                    Class {classLevel}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <Link
                  href="/student/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-[#003B64]"
                >
                  <FiUser size={17} />
                  My Profile
                </Link>

                <LogoutButton
                  variant="dropdown"
                  onLogout={() => setProfileOpen(false)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
