
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import DeleteStudentButton from "@/components/admin/DeleteStudentButton";
import EditStudentForm from "@/components/admin/EditStudentForm";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiBookOpen,
  FiCalendar,
  FiClipboard,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiEye,
} from "react-icons/fi";

interface StudentDetailsPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function StudentDetailsPage({
  params,
}: StudentDetailsPageProps) {
  await requireAdmin();

  const { studentId } = await params;
  const supabase = createAdminClient();

  // 1. Fetch student profile
  const { data: student, error: studentError } = await supabase
    .from("profiles")
    .select("id, full_name, phone, class_level, role, created_at")
    .eq("id", studentId)
    .eq("role", "student")
    .maybeSingle();

  if (studentError) {
    console.error("Student details error:", studentError);
    throw new Error("Unable to load student details.");
  }

  if (!student) {
    notFound();
  }

  // 2. Fetch student's quiz attempts
  const { data: attemptsData, error: attemptsError } =
    await supabase
      .from("quiz_attempts")
      .select(`
        id,
        quiz_id,
        selected_language,
        started_at,
        submitted_at,
        expires_at,
        status,
        score,
        total_marks,
        tab_switch_count,
        auto_submit_reason,
        quiz:quizzes (
          title,
          passing_marks
        )
      `)
      .eq("student_id", studentId)
      .order("started_at", { ascending: false })
      .limit(1000);

  if (attemptsError) {
    console.error("Student attempts error:", attemptsError);
    throw new Error("Unable to load student quiz attempts.");
  }

  const attempts = attemptsData || [];

  // 3. Calculate statistics
  const evaluatedAttempts = attempts.filter(
    (attempt) => attempt.status === "evaluated"
  );

  const inProgressAttempts = attempts.filter(
    (attempt) => attempt.status === "in_progress"
  );

  const submittedAttempts = attempts.filter(
    (attempt) => attempt.status === "submitted"
  );

  const passedAttempts = evaluatedAttempts.filter((attempt) => {
    const quiz = Array.isArray(attempt.quiz)
      ? attempt.quiz[0]
      : attempt.quiz;

    return Number(attempt.score || 0) >=
      Number(quiz?.passing_marks || 0);
  });

  const failedAttempts = evaluatedAttempts.length - passedAttempts.length;

  const totalScore = evaluatedAttempts.reduce(
    (sum, attempt) => sum + Number(attempt.score || 0),
    0
  );

  const totalMarks = evaluatedAttempts.reduce(
    (sum, attempt) => sum + Number(attempt.total_marks || 0),
    0
  );

  const averagePercentage =
    totalMarks > 0
      ? Math.round((totalScore / totalMarks) * 100)
      : 0;

  // 4. Date formatter
  function formatDate(date: string | null) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(date: string | null) {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      {/* Back Button */}
      <Link
        href="/admin/students"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
      >
        <FiArrowLeft />
        Back to Students
      </Link>

      {/* Student Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
            {student.full_name?.charAt(0).toUpperCase() || "S"}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">
              {student.full_name || "Unnamed Student"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Student ID: {student.id}
            </p>

            <div className="mt-3 mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Class {student.class_level || "—"}
              </span>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Active Student
              </span>
            </div>

            <EditStudentForm
              student={{
                id: student.id,
                full_name: student.full_name,
                phone: student.phone,
                class_level: student.class_level,
              }}
            />

            <div className="mb-3"></div>

            <DeleteStudentButton
              studentId={student.id}
              studentName={student.full_name || "this student"}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3">
              <FiUser className="text-blue-600" />
            </div>

            <div>
              <p className="text-xs text-slate-400">Full Name</p>
              <p className="text-sm font-medium text-slate-700">
                {student.full_name || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3">
              <FiPhone className="text-green-600" />
            </div>

            <div>
              <p className="text-xs text-slate-400">Phone Number</p>
              <p className="text-sm font-medium text-slate-700">
                {student.phone || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-3">
              <FiCalendar className="text-orange-600" />
            </div>

            <div>
              <p className="text-xs text-slate-400">Registered On</p>
              <p className="text-sm font-medium text-slate-700">
                {formatDate(student.created_at)}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {/* Total Attempts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Attempts</p>
            <FiClipboard className="text-xl text-blue-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-800">
            {attempts.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            All quiz attempts
          </p>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Completed</p>
            <FiCheckCircle className="text-xl text-green-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-800">
            {evaluatedAttempts.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Evaluated quizzes
          </p>
        </div>

        {/* In Progress */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">In Progress</p>
            <FiClock className="text-xl text-orange-500" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-800">
            {inProgressAttempts.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Currently ongoing
          </p>
        </div>

        {/* Passed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Passed</p>
            <FiCheckCircle className="text-xl text-green-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-green-600">
            {passedAttempts.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Successful quizzes
          </p>
        </div>

        {/* Failed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Failed</p>
            <FiXCircle className="text-xl text-red-500" />
          </div>

          <p className="mt-3 text-3xl font-bold text-red-600">
            {failedAttempts}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Quizzes not passed
          </p>
        </div>

        {/* Average Percentage */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Average Percentage</p>
            <FiTrendingUp className="text-xl text-purple-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-800">
            {averagePercentage}%
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Based on evaluated quizzes
          </p>
        </div>

      </div>

      {/* Quiz Attempts */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              Quiz Attempt History
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Complete quiz activity of this student
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {attempts.length} Attempts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Quiz</th>
                <th className="px-5 py-4 font-semibold">Language</th>
                <th className="px-5 py-4 font-semibold">Score</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Started At</th>
                <th className="px-5 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {attempts.length > 0 ? (
                attempts.map((attempt) => {
                  const quiz = Array.isArray(attempt.quiz)
                    ? attempt.quiz[0]
                    : attempt.quiz;

                  const percentage =
                    Number(attempt.total_marks || 0) > 0
                      ? Math.round(
                        (Number(attempt.score || 0) /
                          Number(attempt.total_marks)) *
                        100
                      )
                      : 0;

                  const statusStyle =
                    attempt.status === "evaluated"
                      ? "bg-green-50 text-green-700"
                      : attempt.status === "in_progress"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-blue-50 text-blue-700";

                  return (
                    <tr
                      key={attempt.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {quiz?.title || "Deleted Quiz"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ID: {attempt.id.slice(0, 8)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase text-slate-600">
                          {attempt.selected_language}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {attempt.status === "evaluated" ? (
                          <div>
                            <p className="font-semibold text-slate-800">
                              {attempt.score} / {attempt.total_marks}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {percentage}%
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle}`}
                        >
                          {attempt.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDateTime(attempt.started_at)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/attempts/${attempt.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <FiEye />
                          View Attempt
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <FiBookOpen className="mx-auto mb-3 text-3xl text-slate-300" />

                    <p className="font-medium text-slate-600">
                      No quiz attempts found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      This student has not attempted any quizzes yet.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      <div className="text-xs text-slate-400">
        Note: Student statistics are calculated from the latest 1,000 quiz attempts.
      </div>

    </div>
  );
}
