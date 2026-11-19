
"use client";

import { useState } from "react";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentHeader from "@/components/student/StudentHeader";
import { FiX } from "react-icons/fi";

interface StudentLayoutProps {
    children: React.ReactNode;
    studentName: string;
    classLevel: string;
}

export default function StudentLayout({
    children,
    studentName,
    classLevel,
}: StudentLayoutProps) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex min-h-screen">

                {/* Desktop Sidebar */}
                <div className="hidden w-[270px] shrink-0 md:block fixed inset-y-0 left-0 z-50">
                    <StudentSidebar />
                </div>

                {/* Main Content */}
                <div className="min-w-0 flex-1 min-h-screen lg:pl-[270px]">
                    <StudentHeader
                        studentName={studentName}
                        classLevel={classLevel}
                        onMenuClick={() => setMobileSidebarOpen(true)}
                    />

                    <main className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>

            {/* Mobile Sidebar Drawer */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">

                    {/* Overlay */}
                    <button
                        type="button"
                        aria-label="Close sidebar"
                        onClick={() => setMobileSidebarOpen(false)}
                        className="absolute inset-0 h-full w-full bg-black/50"
                    />

                    {/* Drawer */}
                    <div className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-white shadow-2xl">

                        {/* Drawer Header */}
                        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-5">
                            <span className="font-bold text-gray-800">
                                Student Menu
                            </span>

                            <button
                                type="button"
                                onClick={() => setMobileSidebarOpen(false)}
                                aria-label="Close menu"
                                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                            >
                                <FiX size={22} />
                            </button>
                        </div>

                        {/* Sidebar Content */}
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <StudentSidebar onNavigate={() => setMobileSidebarOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
