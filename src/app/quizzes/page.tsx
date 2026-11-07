
import Link from "next/link";
// import { redirect } from "next/navigation";
import { FiClock, FiBookOpen, FiArrowRight } from "react-icons/fi";

import { requireStudent } from "@/lib/auth/require-student";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function QuizzesPage() {
  const { user, profile } = await requireStudent();
    const supabase = createAdminClient();

//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("class_level")
//     .eq("id", user.id)
//     .single();

  if (!profile?.class_level) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800">
            Class information missing
          </h1>
          <p className="mt-2 text-slate-500">
            Please update your profile with your class to view quizzes.
          </p>
        </div>
      </main>
    );
  }

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id")
    .eq("class_level", profile.class_level)
    .eq("is_active", true);

  if (error) {
    throw new Error("Unable to load courses.");
  }

  const courseIds = courses?.map((course) => course.id) ?? [];

  const { data: quizzes, error: quizError } = courseIds.length
    ? await supabase
        .from("quizzes")
        .select(`
          id,
          title,
          description,
          duration_minutes,
          total_marks,
          passing_marks,
          start_at,
          end_at,
          course_id,
          courses (
            title,
            class_level
          )
        `)
        .in("course_id", courseIds)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (quizError) {
    throw new Error("Unable to load quizzes.");
  }

  const now = new Date();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-700">
            STUDENT PORTAL
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Available Quizzes
          </h1>
          <p className="mt-2 text-slate-600">
            Practice, test your knowledge, and track your performance.
          </p>
        </div>

        {!quizzes || quizzes.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <FiBookOpen className="mx-auto text-4xl text-slate-400" />
            <h2 className="mt-4 text-xl font-semibold text-slate-800">
              No quizzes available
            </h2>
            <p className="mt-2 text-slate-500">
              There are no published quizzes for your class right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => {
              const upcoming =
                quiz.start_at && new Date(quiz.start_at) > now;
              const ended =
                quiz.end_at && new Date(quiz.end_at) < now;

              const course = Array.isArray(quiz.courses)
                ? quiz.courses[0]
                : quiz.courses;

              return (
                <div
                  key={quiz.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Class {course?.class_level ?? profile.class_level}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        upcoming
                          ? "bg-amber-50 text-amber-700"
                          : ended
                            ? "bg-slate-100 text-slate-600"
                            : "bg-green-50 text-green-700"
                      }`}
                    >
                      {upcoming ? "Upcoming" : ended ? "Ended" : "Available"}
                    </span>
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-slate-900">
                    {quiz.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">
                    {quiz.description || "Test your knowledge with this quiz."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <FiClock className="text-blue-600" />
                      {quiz.duration_minutes} minutes
                    </span>
                    <span>
                      {quiz.total_marks} marks
                    </span>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <Link
                      href={`/quizzes/${quiz.id}`}
                      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                        upcoming || ended
                          ? "bg-slate-100 text-slate-500"
                          : "bg-blue-700 text-white hover:bg-blue-800"
                      }`}
                    >
                      {upcoming
                        ? "View Details"
                        : ended
                          ? "View Details"
                          : "View Quiz"}
                      <FiArrowRight />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
