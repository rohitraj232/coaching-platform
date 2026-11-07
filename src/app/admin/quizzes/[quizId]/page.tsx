import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import QuizExcelUpload from "@/components/admin/QuizExcelUpload";
import QuizQuestionPreview from "@/components/admin/QuizQuestionPreview";
import PublishQuizButton from "@/components/admin/PublishQuizButton";

export default async function ManageQuizPage({
    params,
}: {
    params: Promise<{ quizId: string }>;
}) {
    await requireAdmin();

    const { quizId } = await params;
    const supabase = createAdminClient();

    const { data: quiz, error } = await supabase
        .from("quizzes")
        .select("id, title, description, duration_minutes, total_marks, is_published")
        .eq("id", quizId)
        .maybeSingle();

    if (error || !quiz) {
        notFound();
    }

    const { count } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", quizId);

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-4xl">
                <Link
                    href="/admin/quizzes"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
                >
                    <FiArrowLeft />
                    Back to Quizzes
                </Link>

                <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {quiz.title}
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                {quiz.description || "No description provided."}
                            </p>
                        </div>

                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            {quiz.is_published ? "Published" : "Draft"}
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Duration</p>
                            <p className="mt-1 font-bold text-slate-800">
                                {quiz.duration_minutes} minutes
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Total Marks</p>
                            <p className="mt-1 font-bold text-slate-800">
                                {quiz.total_marks}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Questions Uploaded</p>
                            <p className="mt-1 font-bold text-slate-800">
                                {count ?? 0}
                            </p>
                        </div>
                    </div>
                </div>

                {!quiz.is_published && (
                    <>
                        <QuizExcelUpload quizId={quiz.id} />

                        <QuizQuestionPreview quizId={quiz.id} />

                        <PublishQuizButton quizId={quiz.id} />
                    </>
                )}

                {quiz.is_published && (
                    <>
                        <QuizQuestionPreview quizId={quiz.id} />

                        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                            This quiz is published and available to students according to its schedule.
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}