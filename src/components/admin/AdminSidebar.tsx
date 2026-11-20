
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiGrid,
  FiBookOpen,
  FiUsers,
  FiClipboard,
  FiAward,
  FiYoutube,
  FiSettings,
  FiBook,
  FiLogOut,
  FiX,
  FiMenu,
} from "react-icons/fi";
import { useState } from "react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: FiGrid,
  },
  {
    label: "Quiz Management",
    href: "/admin/quizzes",
    icon: FiBookOpen,
  },
  {
    label: "Study Materials",
    href: "/admin/study-materials",
    icon: FiBook,
  },
  {
    label: "Students",
    href: "/admin/students",
    icon: FiUsers,
  },
  {
    label: "Quiz Attempts & Results",
    href: "/admin/attempts",
    icon: FiClipboard,
  },
  {
    label: "Leaderboard",
    href: "/admin/leaderboard",
    icon: FiAward,
  },
  {
    label: "Youtube Videos",
    href: "/admin/youtube-videos",
    icon: FiYoutube,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const sidebarContent = (
    <>
      <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
        <Link href="/admin" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt=""
            className=""
            width={40}
            loading="lazy"
          />
          <div>
            <p className="text-base font-extrabold tracking-tight text-slate-900">
              Accelerate<span className="text-orange-500"> Academy</span>
            </p>
            <p className="text-sm font-medium mt-[-5px]">Siwan, Bihar</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-[#0B5A93]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>

                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-[#0B5A93]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Other
        </p>
        <nav className="space-y-1">
          <Link
            href="/admin/settings"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <FiSettings size={19} />
            Settings
          </Link>
        </nav> */}
      </div>

      <div className="border-t border-slate-200 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          <FiLogOut size={19} />
          Back to Website
        </Link>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm lg:hidden"
        aria-label="Open admin menu"
      >
        <FiMenu size={21} />
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
