
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Verify student profile and account status
    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, class_level, is_active, created_at, role")
      .eq("id", user.id)
      .maybeSingle();

    if (studentError) throw studentError;

    if (!student || student.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Student account not found" },
        { status: 403 }
      );
    }

    if (!student.is_active) {
      return NextResponse.json(
        { success: false, message: "Your account is deactivated" },
        { status: 403 }
      );
    }

    // Fetch published quizzes
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("id, title, duration_minutes, total_marks, start_at, end_at")
      .eq("is_published", true);

    if (quizzesError) throw quizzesError;

    // Fetch all student attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select(`
        id,
        quiz_id,
        score,
        total_marks,
        status,
        started_at,
        submitted_at,
        quizzes (
          title,
          passing_marks
        )
      `)
      .eq("student_id", user.id)
      .order("started_at", { ascending: false });

    if (attemptsError) throw attemptsError;

    const publishedQuizzes = quizzes || [];
    const studentAttempts = attempts || [];

    const now = new Date();

    const availableQuizzes = publishedQuizzes.filter((quiz) => {
      const started = !quiz.start_at || new Date(quiz.start_at) <= now;
      const notEnded = !quiz.end_at || new Date(quiz.end_at) >= now;

      return started && notEnded;
    });

    const submittedAttempts = studentAttempts.filter(
      (attempt) =>
        attempt.submitted_at !== null &&
        attempt.score !== null &&
        Number(attempt.total_marks) > 0
    );

    const completedQuizIds = new Set(
      studentAttempts
        .filter((attempt) => attempt.submitted_at !== null)
        .map((attempt) => attempt.quiz_id)
    );

    const averageScore =
      submittedAttempts.length > 0
        ? Number(
            (
              submittedAttempts.reduce((sum, attempt) => {
                return (
                  sum +
                  (Number(attempt.score) /
                    Number(attempt.total_marks)) *
                    100
                );
              }, 0) / submittedAttempts.length
            ).toFixed(2)
          )
        : 0;

    const recentActivity = studentAttempts.slice(0, 5).map((attempt) => {
      const quiz = Array.isArray(attempt.quizzes)
        ? attempt.quizzes[0]
        : attempt.quizzes;

      const score = Number(attempt.score || 0);
      const totalMarks = Number(attempt.total_marks || 0);
      const passingMarks = Number(quiz?.passing_marks || 0);

      return {
        attemptId: attempt.id,
        quizId: attempt.quiz_id,
        quizTitle: quiz?.title || "Quiz",
        score,
        totalMarks,
        percentage:
          totalMarks > 0
            ? Number(((score / totalMarks) * 100).toFixed(2))
            : 0,
        result:
          attempt.submitted_at && attempt.score !== null
            ? score >= passingMarks
              ? "passed"
              : "failed"
            : "in_progress",
        status: attempt.status,
        startedAt: attempt.started_at,
        submittedAt: attempt.submitted_at,
      };
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        fullName: student.full_name,
        phone: student.phone,
        classLevel: student.class_level,
        isActive: student.is_active,
        registeredAt: student.created_at,
      },
      stats: {
        totalAvailableQuizzes: availableQuizzes.length,
        completedQuizzes: completedQuizIds.size,
        totalAttempts: studentAttempts.length,
        averageScore,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Student dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch student dashboard",
      },
      { status: 500 }
    );
  }
}
