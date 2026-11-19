
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Verify logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Verify admin role
    const { data: admin, error: adminError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (adminError || admin?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Fetch quizzes
    const { data: quizzes, error: quizError } = await supabase
      .from("quizzes")
      .select("id, title, total_marks, passing_marks, is_published, created_at")
      .order("created_at", { ascending: false });

    if (quizError) {
      throw quizError;
    }

    // Fetch submitted attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("id, quiz_id, student_id, score, total_marks, submitted_at")
      .not("submitted_at", "is", null);

    if (attemptsError) {
      throw attemptsError;
    }

    const analytics = (quizzes || []).map((quiz) => {
      const quizAttempts = (attempts || []).filter(
        (attempt) =>
          attempt.quiz_id === quiz.id &&
          attempt.score !== null &&
          Number(attempt.total_marks) > 0
      );

      const totalAttempts = quizAttempts.length;

      const scores = quizAttempts.map((attempt) =>
        (Number(attempt.score) / Number(attempt.total_marks)) * 100
      );

      const averageScore =
        totalAttempts > 0
          ? Number(
              (
                scores.reduce((sum, score) => sum + score, 0) /
                totalAttempts
              ).toFixed(2)
            )
          : 0;

      const passedAttempts = quizAttempts.filter(
        (attempt) =>
          Number(attempt.score) >= Number(quiz.passing_marks)
      ).length;

      const failedAttempts = totalAttempts - passedAttempts;

      const passPercentage =
        totalAttempts > 0
          ? Number(((passedAttempts / totalAttempts) * 100).toFixed(2))
          : 0;

      return {
        quizId: quiz.id,
        title: quiz.title,
        totalMarks: Number(quiz.total_marks),
        passingMarks: Number(quiz.passing_marks),
        isPublished: quiz.is_published,
        totalAttempts,
        averageScore,
        passedAttempts,
        failedAttempts,
        passPercentage,
        highestScore:
          scores.length > 0 ? Number(Math.max(...scores).toFixed(2)) : 0,
        lowestScore:
          scores.length > 0 ? Number(Math.min(...scores).toFixed(2)) : 0,
      };
    });

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Quiz analytics API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch quiz analytics",
      },
      { status: 500 }
    );
  }
}
