import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { FiPlus, FiEdit, FiBookOpen } from "react-icons/fi";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  total_marks: number;
  is_published: boolean;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  course: {
    title: string;
    class_level: string;
  } | null;
};

export default async function AdminQuizzesPage() {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      id,
      title,
      description,
      duration_minutes,
      total_marks,
      is_published,
      start_at,
      end_at,
      created_at,
      course:courses (
        title,
        class_level
      )
    `)
    .order("created_at", { ascending: false });

  const quizzes = (data ?? []) as unknown as Quiz[];

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Quiz Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, manage, and publish your quizzes.
            </p>
          </div>

          <Link
            href="/admin/quizzes/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FiPlus size={18} />
            Create Quiz
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load quizzes: {error.message}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-semibold text-slate-900">All Quizzes</h2>
              <p className="mt-1 text-sm text-slate-500">
                {quizzes.length} quiz{quizzes.length === 1 ? "" : "zes"} found
              </p>
            </div>
            <FiBookOpen className="text-slate-400" size={22} />
          </div>

          {quizzes.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <FiBookOpen className="mx-auto text-slate-300" size={42} />
              <h3 className="mt-4 font-semibold text-slate-800">
                No quizzes created yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Create your first quiz to get started.
              </p>
              <Link
                href="/admin/quizzes/create"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <FiPlus size={16} />
                Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Quiz</th>
                    <th className="px-5 py-4">Course</th>
                    <th className="px-5 py-4">Duration</th>
                    <th className="px-5 py-4">Total Marks</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {quiz.title}
                        </p>
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {quiz.description || "No description"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {quiz.course?.title || "Unknown course"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Class {quiz.course?.class_level || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {quiz.duration_minutes} minutes
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {quiz.total_marks}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            quiz.is_published
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {quiz.is_published ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/quizzes/${quiz.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <FiEdit size={14} />
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}