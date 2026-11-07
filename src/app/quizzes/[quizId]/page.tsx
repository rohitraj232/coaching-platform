
import { notFound } from "next/navigation";
import {
  FiBookOpen,
  FiClock,
  FiAward,
  FiAlertCircle,
  FiCalendar,
} from "react-icons/fi";

import StartQuizButton from "@/components/quiz/StartQuizButton";
import { requireStudent } from "@/lib/auth/require-student";
import { createAdminClient } from "@/lib/supabase/admin";

interface QuizPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizId: quizId } = await params;

  const { user } = await requireStudent();
  const supabase = createAdminClient();

  // 1. Fetch quiz details
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select(`
      id,
      course_id,
      title,
      description,
      duration_minutes,
      total_marks,
      passing_marks,
      negative_marking,
      negative_marks,
      start_at,
      end_at,
      is_published
    `)
    .eq("id", quizId)
    .eq("is_published", true)
    .maybeSingle();

 if (quizError) {
  console.error("Quiz Details Error:", quizError);

  throw new Error(
    `Unable to load quiz details: ${quizError.message}`
  );
}

  if (!quiz) {
    notFound();
  }

  // 2. Fetch course details
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("title, class_level")
    .eq("id", quiz.course_id)
    .maybeSingle();

  if (courseError) {
    throw new Error("Unable to load course details.");
  }

  // 3. Fetch total question count
  const { count: questionCount, error: questionError } =
    await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("quiz_id", quizId);

  if (questionError) {
    throw new Error("Unable to load question count.");
  }

  // 4. Check student's previous attempt
  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .select("id, status, expires_at, submitted_at")
    .eq("quiz_id", quizId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (attemptError) {
    throw new Error("Unable to check previous quiz attempt.");
  }

  // 5. Check quiz availability
  const now = new Date();

  const upcoming = quiz.start_at
    ? new Date(quiz.start_at) > now
    : false;

  const ended = quiz.end_at
    ? new Date(quiz.end_at) < now
    : false;

  const alreadySubmitted =
    attempt?.status === "submitted" ||
    attempt?.status === "evaluated";

  const canStart =
    !upcoming &&
    !ended &&
    !alreadySubmitted;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">

        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Student Portal / Quiz Details
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {quiz.title}
          </h1>

          <p className="mt-2 text-slate-600">
            {quiz.description || "Test your knowledge and check your preparation."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              Class {course?.class_level ?? "N/A"}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {course?.title ?? "Course"}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                upcoming
                  ? "bg-amber-50 text-amber-700"
                  : ended
                    ? "bg-slate-100 text-slate-600"
                    : "bg-green-50 text-green-700"
              }`}
            >
              {upcoming
                ? "Upcoming"
                : ended
                  ? "Ended"
                  : "Available"}
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <FiClock className="text-2xl text-blue-700" />
              <div>
                <p className="text-sm text-slate-500">Duration</p>
                <p className="font-semibold text-slate-900">
                  {quiz.duration_minutes} minutes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <FiBookOpen className="text-2xl text-blue-700" />
              <div>
                <p className="text-sm text-slate-500">Total Questions</p>
                <p className="font-semibold text-slate-900">
                  {questionCount ?? 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <FiAward className="text-2xl text-blue-700" />
              <div>
                <p className="text-sm text-slate-500">Total Marks</p>
                <p className="font-semibold text-slate-900">
                  {quiz.total_marks}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <FiAward className="text-2xl text-green-700" />
              <div>
                <p className="text-sm text-slate-500">Passing Marks</p>
                <p className="font-semibold text-slate-900">
                  {quiz.passing_marks}
                </p>
              </div>
            </div>

          </div>

          <div className="mt-6 rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-900">
              Quiz Instructions
            </h2>

            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Only one attempt is allowed.</li>
              <li>• The timer starts when you start the quiz.</li>
              <li>• Your answers are saved as you progress.</li>
              <li>• The quiz will be submitted automatically when time expires.</li>
              <li>
                • Negative marking:{" "}
                {quiz.negative_marking
                  ? `${quiz.negative_marks} marks per incorrect answer`
                  : "Not applicable"}
              </li>
            </ul>
          </div>

          {(quiz.start_at || quiz.end_at) && (
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
              <FiCalendar className="mt-0.5 shrink-0 text-lg" />

              <div>
                {quiz.start_at && (
                  <p>
                    Starts: {new Date(quiz.start_at).toLocaleString("en-IN")}
                  </p>
                )}

                {quiz.end_at && (
                  <p className="mt-1">
                    Ends: {new Date(quiz.end_at).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-slate-100 pt-6">

            {alreadySubmitted ? (
              <div className="rounded-xl bg-green-50 p-4 text-green-800">
                <p className="font-semibold">
                  You have already attempted this quiz.
                </p>
                <p className="mt-1 text-sm">
                  Only one attempt is allowed for this quiz.
                </p>
              </div>
            ) : upcoming ? (
              <div className="rounded-xl bg-amber-50 p-4 text-amber-800">
                This quiz has not started yet.
              </div>
            ) : ended ? (
              <div className="rounded-xl bg-slate-100 p-4 text-slate-700">
                The availability period for this quiz has ended.
              </div>
            ) : (
              <div>
                {attempt?.status === "in_progress" && (
                  <p className="mb-3 text-sm font-semibold text-green-700">
                    You already have an attempt. You can resume it.
                  </p>
                )}

                <StartQuizButton quizId={quizId} />
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
