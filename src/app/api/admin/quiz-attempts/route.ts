
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_STATUSES = [
  "in_progress",
  "submitted",
  "evaluated",
] as const;

export async function GET(request: NextRequest) {
  try {
    // 1. Verify logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // 2. Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    // 3. Read filters and pagination
    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(
      1,
      Number(searchParams.get("page")) || 1
    );

    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 10)
    );

    const quizId = searchParams.get("quizId");
    const status = searchParams.get("status");

    if (
      status &&
      !ALLOWED_STATUSES.includes(
        status as (typeof ALLOWED_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid attempt status." },
        { status: 400 }
      );
    }

    // 4. Fetch quiz attempts
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let attemptsQuery = supabase
      .from("quiz_attempts")
      .select(
        `
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
          auto_submit_reason
        `,
        { count: "exact" }
      )
      .order("started_at", { ascending: false });

    if (quizId) {
      attemptsQuery = attemptsQuery.eq("quiz_id", quizId);
    }

    if (status) {
      attemptsQuery = attemptsQuery.eq("status", status);
    }

    const {
      data: attempts,
      error: attemptsError,
      count,
    } = await attemptsQuery.range(from, to);

    if (attemptsError) {
      console.error("Admin attempts fetch error:", attemptsError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load quiz attempts.",
        },
        { status: 500 }
      );
    }

    // 5. Return an empty paginated response when no attempts exist
    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        success: true,
        attempts: [],
        pagination: {
          page,
          limit,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      });
    }

    // 6. Collect related IDs
    const quizIds = [
      ...new Set(attempts.map((attempt) => attempt.quiz_id)),
    ];

    const studentIds = [
      ...new Set(attempts.map((attempt) => attempt.student_id)),
    ];

    // 7. Fetch quiz information
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("id, title, total_marks, passing_marks")
      .in("id", quizIds);

    if (quizzesError) {
      console.error("Admin quizzes fetch error:", quizzesError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load quiz information.",
        },
        { status: 500 }
      );
    }

    // 8. Fetch student information
    const { data: students, error: studentsError } = await supabase
      .from("profiles")
      .select("id, full_name, class_level")
      .in("id", studentIds);

    if (studentsError) {
      console.error("Admin students fetch error:", studentsError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load student information.",
        },
        { status: 500 }
      );
    }

    // 9. Create lookup maps
    const quizMap = new Map(
      (quizzes ?? []).map((quiz) => [quiz.id, quiz])
    );

    const studentMap = new Map(
      (students ?? []).map((student) => [student.id, student])
    );

    // 10. Combine attempt and related information
    const formattedAttempts = attempts.map((attempt) => {
      const quiz = quizMap.get(attempt.quiz_id);
      const student = studentMap.get(attempt.student_id);

      const score = attempt.score;
      const totalMarks = attempt.total_marks;

      const percentage =
        score !== null && totalMarks && totalMarks > 0
          ? Number(((score / totalMarks) * 100).toFixed(2))
          : null;

      return {
        attemptId: attempt.id,
        quizId: attempt.quiz_id,
        quizTitle: quiz?.title ?? "Unknown Quiz",

        studentId: attempt.student_id,
        studentName: student?.full_name ?? "Unknown Student",
        classLevel: student?.class_level ?? null,

        selectedLanguage: attempt.selected_language,
        status: attempt.status,

        score,
        totalMarks,
        percentage,

        passingMarks: quiz?.passing_marks ?? null,
        isPassed:
          score !== null && quiz?.passing_marks !== undefined
            ? score >= quiz.passing_marks
            : null,

        startedAt: attempt.started_at,
        expiresAt: attempt.expires_at,
        submittedAt: attempt.submitted_at,

        tabSwitchCount: attempt.tab_switch_count,
        autoSubmitReason: attempt.auto_submit_reason,
      };
    });

    // 11. Return response
    return NextResponse.json({
      success: true,
      attempts: formattedAttempts,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error("Admin quiz attempts API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
