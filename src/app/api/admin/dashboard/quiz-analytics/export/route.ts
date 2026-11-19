
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
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

    // Fetch all quizzes in batches
    const quizzes: any[] = [];
    let quizOffset = 0;
    const batchSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title, total_marks, passing_marks, is_published")
        .order("created_at", { ascending: false })
        .range(quizOffset, quizOffset + batchSize - 1);

      if (error) throw error;

      quizzes.push(...(data || []));

      if (!data || data.length < batchSize) break;
      quizOffset += batchSize;
    }

    // Fetch all submitted attempts in batches
    const attempts: any[] = [];
    let attemptOffset = 0;

    while (true) {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select(`
          id,
          quiz_id,
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
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })
        .range(attemptOffset, attemptOffset + batchSize - 1);

      if (error) throw error;

      attempts.push(...(data || []));

      if (!data || data.length < batchSize) break;
      attemptOffset += batchSize;
    }

    const quizMap = new Map(
      quizzes.map((quiz) => [quiz.id, quiz])
    );

    // Prepare student attempt worksheet
    const studentRows = attempts
      .filter(
        (attempt) =>
          attempt.score !== null &&
          Number(attempt.total_marks) > 0
      )
      .map((attempt) => {
        const quiz = quizMap.get(attempt.quiz_id);

        const profile = Array.isArray(attempt.profiles)
          ? attempt.profiles[0]
          : attempt.profiles;

        const score = Number(attempt.score);
        const totalMarks = Number(attempt.total_marks);
        const percentage = (score / totalMarks) * 100;
        const passed =
          score >= Number(quiz?.passing_marks ?? 0);

        return {
          "Student Name": profile?.full_name || "N/A",
          "Phone": profile?.phone || "N/A",
          "Class": profile?.class_level || "N/A",
          "Quiz Title": quiz?.title || "Unknown Quiz",
          "Score": score,
          "Total Marks": totalMarks,
          "Percentage": `${percentage.toFixed(2)}%`,
          "Result": passed ? "Passed" : "Failed",
          "Attempt Status": attempt.status || "N/A",
          "Started At": attempt.started_at
            ? new Date(attempt.started_at).toLocaleString("en-IN")
            : "N/A",
          "Submitted At": attempt.submitted_at
            ? new Date(attempt.submitted_at).toLocaleString("en-IN")
            : "N/A",
        };
      });

    // Prepare quiz summary worksheet
    const summaryRows = quizzes.map((quiz) => {
      const quizAttempts = attempts.filter(
        (attempt) =>
          attempt.quiz_id === quiz.id &&
          attempt.score !== null &&
          Number(attempt.total_marks) > 0
      );

      const percentages = quizAttempts.map(
        (attempt) =>
          (Number(attempt.score) /
            Number(attempt.total_marks)) *
          100
      );

      const passedAttempts = quizAttempts.filter(
        (attempt) =>
          Number(attempt.score) >= Number(quiz.passing_marks)
      ).length;

      const failedAttempts =
        quizAttempts.length - passedAttempts;

      const averageScore =
        percentages.length > 0
          ? percentages.reduce((sum, value) => sum + value, 0) /
            percentages.length
          : 0;

      return {
        "Quiz Title": quiz.title,
        "Publication Status": quiz.is_published
          ? "Published"
          : "Draft",
        "Total Marks": quiz.total_marks,
        "Passing Marks": quiz.passing_marks,
        "Total Attempts": quizAttempts.length,
        "Average Score": `${averageScore.toFixed(2)}%`,
        "Passed Attempts": passedAttempts,
        "Failed Attempts": failedAttempts,
        "Pass Percentage":
          quizAttempts.length > 0
            ? `${((passedAttempts / quizAttempts.length) * 100).toFixed(2)}%`
            : "0%",
        "Highest Score":
          percentages.length > 0
            ? `${Math.max(...percentages).toFixed(2)}%`
            : "N/A",
        "Lowest Score":
          percentages.length > 0
            ? `${Math.min(...percentages).toFixed(2)}%`
            : "N/A",
      };
    });

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    const studentSheet = XLSX.utils.json_to_sheet(studentRows);

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Quiz Summary"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      studentSheet,
      "Student Attempts"
    );

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const filename = `quiz-analytics-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Quiz Analytics Export Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to export quiz analytics",
      },
      { status: 500 }
    );
  }
}
