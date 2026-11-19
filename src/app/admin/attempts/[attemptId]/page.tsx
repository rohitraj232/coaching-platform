
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiMinusCircle,
  FiClock,
  FiAlertTriangle,
  FiUser,
  FiBookOpen,
} from "react-icons/fi";

interface PageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

type Attempt = {
  id: string;
  quiz_id: string;
  student_id: string;
  selected_language: "en" | "hi";
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  status: "in_progress" | "submitted" | "evaluated";
  score: number | null;
  total_marks: number;
  tab_switch_count: number;
  max_tab_switches: number;
  auto_submit_reason: string | null;
};

type Question = {
  id: string;
  question_code: string;
  question_order: number;
  marks: number;
  negative_marks: number;
};

type Translation = {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

type Answer = {
  question_id: string;
  selected_option: "A" | "B" | "C" | "D" | null;
};

type AnswerKey = {
  question_id: string;
  correct_option: "A" | "B" | "C" | "D";
};

const optionLabels = ["A", "B", "C", "D"] as const;

export default async function AdminAttemptDetailsPage({
  params,
}: PageProps) {
  await requireAdmin();

  const { attemptId } = await params;
  const supabase = createAdminClient();

  // 1. Fetch attempt
  const { data: attemptData, error: attemptError } = await supabase
    .from("quiz_attempts")
    .select(`
      id,
      quiz_id,
      student_id,
      selected_language,
      started_at,
      expires_at,
      submitted_at,
      status,
      score,
      total_marks,
      tab_switch_count,
      max_tab_switches,
      auto_submit_reason
    `)
    .eq("id", attemptId)
    .maybeSingle();

  if (attemptError) {
    throw new Error(attemptError.message);
  }

  if (!attemptData) {
    notFound();
  }

  const attempt = attemptData as Attempt;

  // 2. Fetch quiz details
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("id, title, duration_minutes, total_marks, passing_marks")
    .eq("id", attempt.quiz_id)
    .maybeSingle();

  if (quizError) {
    throw new Error(quizError.message);
  }

  // 3. Fetch student details
  const { data: student, error: studentError } = await supabase
    .from("profiles")
    .select("id, full_name, phone, class_level")
    .eq("id", attempt.student_id)
    .maybeSingle();

  if (studentError) {
    throw new Error(studentError.message);
  }

  // 4. Fetch questions
  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .select(`
      id,
      question_code,
      question_order,
      marks,
      negative_marks
    `)
    .eq("quiz_id", attempt.quiz_id)
    .order("question_order", { ascending: true });

  if (questionError) {
    throw new Error(questionError.message);
  }

  const questions = (questionData ?? []) as Question[];
  const questionIds = questions.map((question) => question.id);

  // 5. Fetch translations in the student's selected language
  const { data: translationData, error: translationError } =
    questionIds.length > 0
      ? await supabase
          .from("question_translations")
          .select(`
            question_id,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d
          `)
          .in("question_id", questionIds)
          .eq("language", attempt.selected_language)
      : { data: [], error: null };

  if (translationError) {
    throw new Error(translationError.message);
  }

  // 6. Fetch student's saved answers
  const { data: answerData, error: answerError } = await supabase
    .from("quiz_attempt_answers")
    .select("question_id, selected_option")
    .eq("attempt_id", attempt.id);

  if (answerError) {
    throw new Error(answerError.message);
  }

  // 7. Fetch correct answers
  const { data: answerKeyData, error: answerKeyError } =
    questionIds.length > 0
      ? await supabase
          .from("question_answer_keys")
          .select("question_id, correct_option")
          .in("question_id", questionIds)
      : { data: [], error: null };

  if (answerKeyError) {
    throw new Error(answerKeyError.message);
  }

  const translations = (translationData ?? []) as Translation[];
  const answers = (answerData ?? []) as Answer[];
  const answerKeys = (answerKeyData ?? []) as AnswerKey[];

  const translationMap = new Map(
    translations.map((item) => [item.question_id, item])
  );

  const answerMap = new Map(
    answers.map((item) => [item.question_id, item.selected_option])
  );

  const answerKeyMap = new Map(
    answerKeys.map((item) => [item.question_id, item.correct_option])
  );

  const answeredCount = questions.filter(
    (question) => answerMap.get(question.id) !== null &&
      answerMap.get(question.id) !== undefined
  ).length;

  const correctCount = questions.filter(
    (question) =>
      answerMap.get(question.id) !== null &&
      answerMap.get(question.id) !== undefined &&
      answerMap.get(question.id) === answerKeyMap.get(question.id)
  ).length;

  const wrongCount = questions.filter(
    (question) =>
      answerMap.get(question.id) !== null &&
      answerMap.get(question.id) !== undefined &&
      answerMap.get(question.id) !== answerKeyMap.get(question.id)
  ).length;

  const unansweredCount = questions.length - answeredCount;

  const percentage =
    attempt.score !== null && attempt.total_marks > 0
      ? (Number(attempt.score) / Number(attempt.total_marks)) * 100
      : 0;

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Not submitted";

  const statusStyles = {
    in_progress: "bg-blue-100 text-blue-700",
    submitted: "bg-amber-100 text-amber-700",
    evaluated: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/attempts"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
        >
          <FiArrowLeft />
          Back to Attempts
        </Link>

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Attempt Details
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review student information, answers and quiz performance.
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              statusStyles[attempt.status]
            }`}
          >
            {attempt.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Student and Quiz */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FiUser className="text-blue-600" />
            <h2 className="font-semibold text-slate-900">
              Student Information
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-500">Student Name</p>
              <p className="font-semibold text-slate-900">
                {student?.full_name || "Unnamed Student"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Student ID</p>
              <p className="break-all font-medium text-slate-700">
                {attempt.student_id}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Phone</p>
              <p className="font-medium text-slate-700">
                {student?.phone || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Class</p>
              <p className="font-medium text-slate-700">
                {student?.class_level || "Not available"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FiBookOpen className="text-blue-600" />
            <h2 className="font-semibold text-slate-900">
              Quiz Information
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-500">Quiz Title</p>
              <p className="font-semibold text-slate-900">
                {quiz?.title || "Quiz not found"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Duration</p>
              <p className="font-medium text-slate-700">
                {quiz?.duration_minutes ?? "-"} minutes
              </p>
            </div>

            <div>
              <p className="text-slate-500">Selected Language</p>
              <p className="font-medium text-slate-700">
                {attempt.selected_language === "hi" ? "Hindi" : "English"}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Total Marks</p>
              <p className="font-medium text-slate-700">
                {attempt.total_marks}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Score Summary */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-900">
          Performance Summary
        </h2>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Score</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {attempt.score ?? "-"} / {attempt.total_marks}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Percentage</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {attempt.score !== null ? `${percentage.toFixed(2)}%` : "-"}
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700">Correct</p>
            <p className="mt-1 text-2xl font-bold text-green-700">
              {correctCount}
            </p>
          </div>

          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-700">Wrong</p>
            <p className="mt-1 text-2xl font-bold text-red-700">
              {wrongCount}
            </p>
          </div>

          <div className="rounded-lg bg-amber-50 p-4">
            <p className="text-sm text-amber-700">Unanswered</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">
              {unansweredCount}
            </p>
          </div>
        </div>
      </section>

      {/* Attempt Timeline */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FiClock className="text-blue-600" />
          <h2 className="font-semibold text-slate-900">
            Attempt Timeline
          </h2>
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-slate-500">Started At</p>
            <p className="mt-1 font-medium text-slate-800">
              {formatDate(attempt.started_at)}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Expires At</p>
            <p className="mt-1 font-medium text-slate-800">
              {formatDate(attempt.expires_at)}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Submitted At</p>
            <p className="mt-1 font-medium text-slate-800">
              {formatDate(attempt.submitted_at)}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm">
            <FiAlertTriangle className="text-amber-600" />
            <span className="font-semibold text-slate-800">
              Tab Switches
            </span>
            <span className="ml-auto font-bold text-slate-900">
              {attempt.tab_switch_count} / {attempt.max_tab_switches}
            </span>
          </div>

          {attempt.auto_submit_reason && (
            <p className="mt-3 text-sm text-slate-600">
              Auto-submit reason:{" "}
              <span className="font-semibold">
                {attempt.auto_submit_reason.replaceAll("_", " ")}
              </span>
            </p>
          )}
        </div>
      </section>

      {/* Questions and Answers */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Student Answers
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Questions are displayed in the language selected by the student.
          </p>
        </div>

        {questions.map((question) => {
          const translation = translationMap.get(question.id);
          const selected = answerMap.get(question.id) ?? null;
          const correct = answerKeyMap.get(question.id) ?? null;

          const options = {
            A: translation?.option_a ?? "",
            B: translation?.option_b ?? "",
            C: translation?.option_c ?? "",
            D: translation?.option_d ?? "",
          };

          const isAnswered = selected !== null;
          const isCorrect = isAnswered && selected === correct;

          return (
            <article
              key={question.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-semibold text-blue-700">
                    Question {question.question_order}
                  </span>
                  <span className="ml-2 text-xs text-slate-400">
                    ({question.question_code})
                  </span>
                </div>

                <span className="text-xs font-medium text-slate-500">
                  {question.marks} marks
                  {question.negative_marks > 0 &&
                    ` · ${question.negative_marks} negative`}
                </span>
              </div>

              <p className="mb-4 font-medium leading-7 text-slate-900">
                {translation?.question_text || "Question translation unavailable"}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {optionLabels.map((option) => {
                  const isSelected = selected === option;
                  const isAnswer = correct === option;

                  let optionStyle =
                    "border-slate-200 bg-white text-slate-700";

                  if (isAnswer) {
                    optionStyle =
                      "border-green-300 bg-green-50 text-green-800";
                  } else if (isSelected) {
                    optionStyle =
                      "border-red-300 bg-red-50 text-red-800";
                  }

                  return (
                    <div
                      key={option}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${optionStyle}`}
                    >
                      <span className="font-bold">{option}.</span>
                      <span className="flex-1">{options[option]}</span>

                      {isAnswer && (
                        <FiCheckCircle className="mt-0.5 shrink-0 text-green-600" />
                      )}

                      {isSelected && !isAnswer && (
                        <FiXCircle className="mt-0.5 shrink-0 text-red-600" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-600">
                  Student Answer:{" "}
                  <strong>{selected || "Not answered"}</strong>
                </span>

                <span className="text-slate-600">
                  Correct Answer:{" "}
                  <strong>{correct || "Unavailable"}</strong>
                </span>

                <span
                  className={`ml-auto inline-flex items-center gap-1 font-semibold ${
                    !isAnswered
                      ? "text-amber-700"
                      : isCorrect
                        ? "text-green-700"
                        : "text-red-700"
                  }`}
                >
                  {!isAnswered ? (
                    <FiMinusCircle />
                  ) : isCorrect ? (
                    <FiCheckCircle />
                  ) : (
                    <FiXCircle />
                  )}

                  {!isAnswered
                    ? "Unanswered"
                    : isCorrect
                      ? "Correct"
                      : "Wrong"}
                </span>
              </div>
            </article>
          );
        })}

        {questions.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No questions found for this quiz.
          </div>
        )}
      </section>

      <Link
        href="/admin/attempts"
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        <FiArrowLeft />
        Back to All Attempts
      </Link>
    </div>
  );
}
