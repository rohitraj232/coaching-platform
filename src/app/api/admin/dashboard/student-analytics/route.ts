
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

    const batchSize = 1000;

    // Fetch all students
    const students: any[] = [];
    let studentOffset = 0;

    while (true) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, class_level, is_active, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: false })
        .range(studentOffset, studentOffset + batchSize - 1);

      if (error) throw error;

      students.push(...(data || []));

      if (!data || data.length < batchSize) break;
      studentOffset += batchSize;
    }

    // Fetch quizzes and their passing marks
    const quizzes: any[] = [];
    let quizOffset = 0;

    while (true) {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, passing_marks")
        .range(quizOffset, quizOffset + batchSize - 1);

      if (error) throw error;

      quizzes.push(...(data || []));

      if (!data || data.length < batchSize) break;
      quizOffset += batchSize;
    }

    const quizMap = new Map(
      quizzes.map((quiz) => [quiz.id, Number(quiz.passing_marks ?? 0)])
    );

    // Fetch submitted attempts
    const attempts: any[] = [];
    let attemptOffset = 0;

    while (true) {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("id, student_id, quiz_id, score, total_marks, submitted_at")
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })
        .range(attemptOffset, attemptOffset + batchSize - 1);

      if (error) throw error;

      attempts.push(...(data || []));

      if (!data || data.length < batchSize) break;
      attemptOffset += batchSize;
    }

    // Group valid attempts by student
    const studentAttempts = new Map<string, any[]>();

    for (const attempt of attempts) {
      const score = Number(attempt.score);
      const totalMarks = Number(attempt.total_marks);

      if (
        attempt.score === null ||
        !Number.isFinite(score) ||
        !Number.isFinite(totalMarks) ||
        totalMarks <= 0
      ) {
        continue;
      }

      if (!studentAttempts.has(attempt.student_id)) {
        studentAttempts.set(attempt.student_id, []);
      }

      studentAttempts.get(attempt.student_id)!.push(attempt);
    }

    // Calculate student-wise analytics
    const studentAnalytics = students.map((student) => {
      const validAttempts = studentAttempts.get(student.id) || [];

      const percentages = validAttempts.map((attempt) => {
        return (
          (Number(attempt.score) / Number(attempt.total_marks)) * 100
        );
      });

      const passedAttempts = validAttempts.filter((attempt) => {
        const passingMarks = quizMap.get(attempt.quiz_id);

        return (
          passingMarks !== undefined &&
          Number(attempt.score) >= passingMarks
        );
      }).length;

      const failedAttempts = validAttempts.length - passedAttempts;

      const averageScore =
        percentages.length > 0
          ? percentages.reduce((sum, value) => sum + value, 0) /
            percentages.length
          : 0;

      const passPercentage =
        validAttempts.length > 0
          ? (passedAttempts / validAttempts.length) * 100
          : 0;

      return {
        studentId: student.id,
        fullName: student.full_name,
        phone: student.phone,
        classLevel: student.class_level,
        isActive: student.is_active,
        registeredAt: student.created_at,
        totalAttempts: validAttempts.length,
        passedAttempts,
        failedAttempts,
        averageScore: Number(averageScore.toFixed(2)),
        passPercentage: Number(passPercentage.toFixed(2)),
        highestScore:
          percentages.length > 0
            ? Number(Math.max(...percentages).toFixed(2))
            : 0,
        lowestScore:
          percentages.length > 0
            ? Number(Math.min(...percentages).toFixed(2))
            : 0,
      };
    });

    // Overall analytics
    const totalAttempts = studentAnalytics.reduce(
      (sum, student) => sum + student.totalAttempts,
      0
    );

    const totalPassed = studentAnalytics.reduce(
      (sum, student) => sum + student.passedAttempts,
      0
    );

    const totalFailed = studentAnalytics.reduce(
      (sum, student) => sum + student.failedAttempts,
      0
    );

    const studentsWithAttempts = studentAnalytics.filter(
      (student) => student.totalAttempts > 0
    );

    const overallAverageScore =
      studentsWithAttempts.length > 0
        ? studentsWithAttempts.reduce(
            (sum, student) => sum + student.averageScore,
            0
          ) / studentsWithAttempts.length
        : 0;

    const overallPassPercentage =
      totalAttempts > 0
        ? (totalPassed / totalAttempts) * 100
        : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: students.length,
        studentsWithAttempts: studentsWithAttempts.length,
        studentsWithoutAttempts:
          students.length - studentsWithAttempts.length,
        totalAttempts,
        passedAttempts: totalPassed,
        failedAttempts: totalFailed,
        averageScore: Number(overallAverageScore.toFixed(2)),
        passPercentage: Number(overallPassPercentage.toFixed(2)),
      },
      students: studentAnalytics,
    });
  } catch (error) {
    console.error("Student Analytics API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch student analytics",
      },
      { status: 500 }
    );
  }
}
