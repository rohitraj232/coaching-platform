import { requireAdmin } from "@/lib/auth/require-admin";
import Link from "next/link";
import { FiClipboard } from "react-icons/fi";

export default async function AdminDashboardPage() {
    const { profile } = await requireAdmin();

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl">
                <h1 className="text-3xl font-bold text-slate-900">
                    Admin Dashboard
                </h1>

                <p className="mt-2 text-slate-600">
                    Welcome, {profile.full_name || "Admin"}
                </p>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/admin/quizzes"
                        className="block rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <FiClipboard size={25} className="text-blue-600" />

                        <h2 className="mt-4 font-semibold text-slate-900">
                            Quiz Management
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Create, view, and manage quizzes.
                        </p>
                    </Link>

                    <div className="rounded-2xl border bg-white p-6">
                        <h2 className="font-semibold">Question Bank</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Manage questions and answer keys.
                        </p>
                    </div>

                    <div className="rounded-2xl border bg-white p-6">
                        <h2 className="font-semibold">Student Results</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            View quiz attempts and rankings.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}