
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    quizId: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
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

    const { quizId } = await params;

    // Validate quiz ID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(quizId)) {
      return NextResponse.json(
        { success: false, message: "Invalid quiz ID" },
        { status: 400 }
      );
    }

    // Fetch quiz details
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select(
        "id, title, description, total_marks, passing_marks, duration_minutes, is_published, created_at"
      )
      .eq("id", quizId)
      .maybeSingle();

    if (quizError) {
      throw quizError;
    }

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: "Quiz not found" },
        { status: 404 }
      );
    }

    // Fetch submitted attempts with student details
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select(`
        id,
        student_id,
        score,
        total_marks,
        status,
        started_at,
        submitted_at,
        profiles!quiz_attempts_student_id_fkey (
          full_name,
          phone,
          class_level
        )
      `)
      .eq("quiz_id", quizId)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false });

    if (attemptsError) {
      throw attemptsError;
    }

    const validAttempts = (attempts || []).filter(
      (attempt) =>
        attempt.score !== null &&
        Number(attempt.total_marks) > 0
    );

    const studentAttempts = validAttempts.map((attempt) => {
      const student = Array.isArray(attempt.profiles)
        ? attempt.profiles[0]
        : attempt.profiles;

      const score = Number(attempt.score);
      const totalMarks = Number(attempt.total_marks);

      const percentage =
        (score / totalMarks) * 100;

      const passed = score >= Number(quiz.passing_marks);

      return {
        attemptId: attempt.id,
        studentId: attempt.student_id,
        studentName: student?.full_name || "Unknown Student",
        phone: student?.phone || "",
        classLevel: student?.class_level || "",
        score,
        totalMarks,
        percentage: Number(percentage.toFixed(2)),
        passed,
        status: attempt.status,
        startedAt: attempt.started_at,
        submittedAt: attempt.submitted_at,
      };
    });

    const totalAttempts = studentAttempts.length;

    const passedAttempts = studentAttempts.filter(
      (attempt) => attempt.passed
    ).length;

    const failedAttempts = totalAttempts - passedAttempts;

    const averageScore =
      totalAttempts > 0
        ? Number(
            (
              studentAttempts.reduce(
                (sum, attempt) => sum + attempt.percentage,
                0
              ) / totalAttempts
            ).toFixed(2)
          )
        : 0;

    return NextResponse.json({
      success: true,
      quiz,
      stats: {
        totalAttempts,
        passedAttempts,
        failedAttempts,
        averageScore,
        passPercentage:
          totalAttempts > 0
            ? Number(
                ((passedAttempts / totalAttempts) * 100).toFixed(2)
              )
            : 0,
      },
      attempts: studentAttempts,
    });
  } catch (error) {
    console.error("Quiz details analytics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch quiz details",
      },
      { status: 500 }
    );
  }
}
