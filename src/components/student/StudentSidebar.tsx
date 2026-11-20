
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiGrid,
  FiBookOpen,
  FiClipboard,
  FiUser,
  FiHome,
  FiChevronRight,
  FiFileText,
  FiYoutube,
} from "react-icons/fi";

const navigation = [
  { title: "Dashboard", href: "/student", icon: FiGrid },
  { title: "Available Quizzes", href: "/quizzes", icon: FiBookOpen },
  { title: "My Quiz History", href: "/my-quizzes", icon: FiClipboard },
  { title: "My Profile", href: "/student/profile", icon: FiUser },
  {
    title: "Study Materials",
    href: "/student/study-materials",
    icon: FiFileText,
  },
  {
    title: "YouTube Videos",
    href: "/student/youtube-videos",
    icon: FiYoutube,
  },
];

interface StudentSidebarProps {
  onNavigate?: () => void;
}

export default function StudentSidebar({
  onNavigate,
}: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-screen w-full shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 -translate-x-full">
      <div className="flex h-20 shrink-0 items-center border-b border-gray-100 px-6">
        <Link
          href="/student"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <img
            src="/logo.png"
            alt=""
            className=""
            width={40}
            loading="lazy"
          />
          <div>
            <p className="text-[15px] font-extrabold tracking-tight text-slate-900">
              Accelerate<span className="text-orange-500"> Academy</span>
            </p>
            <p className="text-sm font-medium mt-[-3px]">Siwan, Bihar</p>
          </div>
        
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Main Menu
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/student"
                ? pathname === "/student"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#003B64] text-white shadow-sm"
                    : "text-gray-600 hover:bg-blue-50 hover:text-[#003B64]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={19} />
                  {item.title}
                </span>

                {isActive && <FiChevronRight size={17} />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 border-t border-gray-100 p-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-[#003B64]"
        >
          <FiHome size={19} />
          Back to Website
        </Link>

        <div className="mt-4 rounded-xl bg-blue-50 p-4">
          <p className="text-sm font-semibold text-[#003B64]">
            Keep Learning!
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Practice regularly and improve your performance.
          </p>
        </div>
      </div>
    </aside>
  );
}
