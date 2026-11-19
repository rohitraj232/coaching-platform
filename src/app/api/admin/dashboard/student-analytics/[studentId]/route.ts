
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    studentId: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Verify admin access
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

    const { studentId } = await params;

    // Validate student ID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(studentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid student ID" },
        { status: 400 }
      );
    }

    // Fetch student profile
    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select(
        "id, full_name, phone, class_level, is_active, created_at"
      )
      .eq("id", studentId)
      .eq("role", "student")
      .maybeSingle();

    if (studentError) {
      throw studentError;
    }

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Fetch submitted quiz attempts
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
      .eq("student_id", studentId)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false });

    if (attemptsError) {
      throw attemptsError;
    }

    const quizAttempts = (attempts || [])
      .filter(
        (attempt) =>
          attempt.score !== null &&
          Number(attempt.total_marks) > 0
      )
      .map((attempt) => {
        const quiz = Array.isArray(attempt.quizzes)
          ? attempt.quizzes[0]
          : attempt.quizzes;

        const score = Number(attempt.score);
        const totalMarks = Number(attempt.total_marks);
        const passingMarks = Number(quiz?.passing_marks ?? 0);

        const percentage = Number(
          ((score / totalMarks) * 100).toFixed(2)
        );

        return {
          attemptId: attempt.id,
          quizId: attempt.quiz_id,
          quizTitle: quiz?.title || "Deleted Quiz",
          score,
          totalMarks,
          percentage,
          passingMarks,
          result: score >= passingMarks ? "passed" : "failed",
          status: attempt.status,
          startedAt: attempt.started_at,
          submittedAt: attempt.submitted_at,
        };
      });

    const totalAttempts = quizAttempts.length;

    const passedAttempts = quizAttempts.filter(
      (attempt) => attempt.result === "passed"
    ).length;

    const failedAttempts = totalAttempts - passedAttempts;

    const averageScore =
      totalAttempts > 0
        ? Number(
            (
              quizAttempts.reduce(
                (sum, attempt) => sum + attempt.percentage,
                0
              ) / totalAttempts
            ).toFixed(2)
          )
        : 0;

    const highestScore =
      totalAttempts > 0
        ? Math.max(...quizAttempts.map((attempt) => attempt.percentage))
        : 0;

    const lowestScore =
      totalAttempts > 0
        ? Math.min(...quizAttempts.map((attempt) => attempt.percentage))
        : 0;

    return NextResponse.json({
      success: true,
      student,
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
        highestScore,
        lowestScore,
      },
      attempts: quizAttempts,
    });
  } catch (error) {
    console.error("Student analytics detail error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch student performance details",
      },
      { status: 500 }
    );
  }
}
