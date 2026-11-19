
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const BATCH_SIZE = 1000;

type HistoryStatus = "all" | "passed" | "failed" | "in_progress";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Verify student account
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, is_active")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      profile.role !== "student" ||
      !profile.is_active
    ) {
      return NextResponse.json(
        { success: false, message: "Student account is not active." },
        { status: 403 }
      );
    }

    // Read query parameters
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const requestedLimit = Number.parseInt(
      searchParams.get("limit") || String(DEFAULT_LIMIT),
      10
    );

    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, requestedLimit || DEFAULT_LIMIT)
    );

    const search = (searchParams.get("search") || "")
      .trim()
      .toLowerCase();

    const requestedStatus = searchParams.get("status") || "all";

    const allowedStatuses: HistoryStatus[] = [
      "all",
      "passed",
      "failed",
      "in_progress",
    ];

    const status: HistoryStatus = allowedStatuses.includes(
      requestedStatus as HistoryStatus
    )
      ? (requestedStatus as HistoryStatus)
      : "all";

    // Fetch all student attempts in batches
    type AttemptRow = {
      id: string;
      quiz_id: string;
      status: string;
      score: number | null;
      total_marks: number | null;
      started_at: string | null;
      expires_at: string | null;
      submitted_at: string | null;
      selected_language: string | null;
      auto_submit_reason: string | null;
    };

    const attempts: AttemptRow[] = [];

    let offset = 0;

    while (true) {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select(
          `
          id,
          quiz_id,
          status,
          score,
          total_marks,
          started_at,
          expires_at,
          submitted_at,
          selected_language,
          auto_submit_reason
        `
        )
        .eq("student_id", user.id)
        .order("started_at", { ascending: false })
        .range(offset, offset + BATCH_SIZE - 1);

      if (error) {
        throw error;
      }

      const batch = (data || []) as AttemptRow[];

      attempts.push(...batch);

      if (batch.length < BATCH_SIZE) {
        break;
      }

      offset += BATCH_SIZE;
    }

    // Fetch associated quizzes in batches
    const quizIds = [
      ...new Set(attempts.map((attempt) => attempt.quiz_id)),
    ];

    const quizMap = new Map<
      string,
      {
        id: string;
        title: string;
        passing_marks: number;
        course_id: string | null;
      }
    >();

    for (let i = 0; i < quizIds.length; i += 500) {
      const batchIds = quizIds.slice(i, i + 500);

      const { data: quizzes, error: quizError } = await supabase
        .from("quizzes")
        .select("id, title, passing_marks, course_id")
        .in("id", batchIds);

      if (quizError) {
        throw quizError;
      }

      (quizzes || []).forEach((quiz) => {
        quizMap.set(quiz.id, {
          id: quiz.id,
          title: quiz.title,
          passing_marks: Number(quiz.passing_marks ?? 0),
          course_id: quiz.course_id,
        });
      });
    }

    // Build history records
    const allHistory = attempts
      .map((attempt) => {
        const quiz = quizMap.get(attempt.quiz_id);

        if (!quiz) {
          return null;
        }

        const score = Number(attempt.score ?? 0);
        const totalMarks = Number(attempt.total_marks ?? 0);

        const percentage =
          totalMarks > 0
            ? Number(((score / totalMarks) * 100).toFixed(2))
            : 0;

        const isPassed = score >= quiz.passing_marks;

        return {
          attemptId: attempt.id,
          quizId: attempt.quiz_id,
          quizTitle: quiz.title,
          courseId: quiz.course_id,
          courseTitle: "",
          selectedLanguage: attempt.selected_language || "English",
          status: attempt.status,
          score,
          totalMarks,
          percentage,
          passingMarks: quiz.passing_marks,
          isPassed,
          startedAt: attempt.started_at,
          expiresAt: attempt.expires_at,
          submittedAt: attempt.submitted_at,
          autoSubmitReason: attempt.auto_submit_reason,
        };
      })
      .filter(
        (item): item is NonNullable<typeof item> => item !== null
      );

    // Apply quiz title search
    let filteredHistory = allHistory;

    if (search) {
      filteredHistory = filteredHistory.filter((item) =>
        item.quizTitle.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (status === "passed") {
      filteredHistory = filteredHistory.filter(
        (item) => item.status === "evaluated" && item.isPassed
      );
    } else if (status === "failed") {
      filteredHistory = filteredHistory.filter(
        (item) => item.status === "evaluated" && !item.isPassed
      );
    } else if (status === "in_progress") {
      filteredHistory = filteredHistory.filter(
        (item) => item.status === "in_progress"
      );
    }

    // Pagination after filtering
    const total = filteredHistory.length;
    const totalPages = Math.ceil(total / limit);
    const from = (page - 1) * limit;

    const paginatedHistory = filteredHistory.slice(
      from,
      from + limit
    );

    // Fetch course titles for current page
    const courseIds = [
      ...new Set(
        paginatedHistory
          .map((item) => item.courseId)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const courseMap = new Map<string, string>();

    if (courseIds.length > 0) {
      const { data: courses, error: courseError } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds);

      if (courseError) {
        throw courseError;
      }

      (courses || []).forEach((course) => {
        courseMap.set(course.id, course.title);
      });
    }

    const history = paginatedHistory.map((item) => ({
      ...item,
      courseTitle: item.courseId
        ? courseMap.get(item.courseId) || ""
        : "",
    }));

    return NextResponse.json({
      success: true,
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Student quiz history error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch quiz history.",
      },
      { status: 500 }
    );
  }
}
