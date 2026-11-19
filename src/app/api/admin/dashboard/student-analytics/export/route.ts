
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";
import * as XLSX from "xlsx";

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

    // Verify admin
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

    // Fetch all students in batches
    const students: any[] = [];
    let studentOffset = 0;

    while (true) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, class_level, is_active, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: false })
        .range(studentOffset, studentOffset + 999);

      if (error) throw error;
      if (!data || data.length === 0) break;

      students.push(...data);

      if (data.length < 1000) break;
      studentOffset += 1000;
    }

    // Fetch all quizzes in batches
    const quizzes: any[] = [];
    let quizOffset = 0;

    while (true) {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title, passing_marks")
        .range(quizOffset, quizOffset + 999);

      if (error) throw error;
      if (!data || data.length === 0) break;

      quizzes.push(...data);

      if (data.length < 1000) break;
      quizOffset += 1000;
    }

    const quizMap = new Map(
      quizzes.map((quiz) => [quiz.id, quiz])
    );

    // Fetch submitted attempts in batches
    const attempts: any[] = [];
    let attemptOffset = 0;

    while (true) {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select(
          "id, student_id, quiz_id, score, total_marks, status, started_at, submitted_at"
        )
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })
        .range(attemptOffset, attemptOffset + 999);

      if (error) throw error;
      if (!data || data.length === 0) break;

      attempts.push(...data);

      if (data.length < 1000) break;
      attemptOffset += 1000;
    }

    // Group valid attempts by student
    const attemptsByStudent = new Map<string, any[]>();

    attempts.forEach((attempt) => {
      const score = Number(attempt.score);
      const totalMarks = Number(attempt.total_marks);

      if (
        attempt.score === null ||
        !Number.isFinite(score) ||
        !Number.isFinite(totalMarks) ||
        totalMarks <= 0
      ) {
        return;
      }

      const studentAttempts =
        attemptsByStudent.get(attempt.student_id) || [];

      studentAttempts.push(attempt);
      attemptsByStudent.set(attempt.student_id, studentAttempts);
    });

    // Prepare Student Summary sheet
    const summaryRows = students.map((student) => {
      const studentAttempts =
        attemptsByStudent.get(student.id) || [];

      const validAttempts = studentAttempts.map((attempt) => {
        const quiz = quizMap.get(attempt.quiz_id);
        const score = Number(attempt.score);
        const totalMarks = Number(attempt.total_marks);

        const percentage = Number(
          ((score / totalMarks) * 100).toFixed(2)
        );

        const passingMarks = Number(quiz?.passing_marks ?? 0);

        return {
          percentage,
          result: score >= passingMarks ? "Passed" : "Failed",
        };
      });

      const totalAttempts = validAttempts.length;

      const passedAttempts = validAttempts.filter(
        (attempt) => attempt.result === "Passed"
      ).length;

      const failedAttempts = totalAttempts - passedAttempts;

      const averageScore =
        totalAttempts > 0
          ? Number(
              (
                validAttempts.reduce(
                  (sum, attempt) => sum + attempt.percentage,
                  0
                ) / totalAttempts
              ).toFixed(2)
            )
          : 0;

      const percentages = validAttempts.map(
        (attempt) => attempt.percentage
      );

      return {
        "Student Name": student.full_name || "",
        "Phone": student.phone || "",
        "Class": student.class_level || "",
        "Account Status": student.is_active ? "Active" : "Inactive",
        "Registration Date": student.created_at
          ? new Date(student.created_at).toLocaleDateString("en-IN")
          : "",
        "Total Attempts": totalAttempts,
        "Passed Attempts": passedAttempts,
        "Failed Attempts": failedAttempts,
        "Average Score (%)": averageScore,
        "Pass Percentage (%)":
          totalAttempts > 0
            ? Number(
                ((passedAttempts / totalAttempts) * 100).toFixed(2)
              )
            : 0,
        "Highest Score (%)":
          percentages.length > 0 ? Math.max(...percentages) : 0,
        "Lowest Score (%)":
          percentages.length > 0 ? Math.min(...percentages) : 0,
      };
    });

    // Prepare Student Attempts sheet
    const studentMap = new Map(
      students.map((student) => [student.id, student])
    );

    const attemptRows = attempts
      .filter(
        (attempt) =>
          attempt.score !== null &&
          Number.isFinite(Number(attempt.score)) &&
          Number.isFinite(Number(attempt.total_marks)) &&
          Number(attempt.total_marks) > 0
      )
      .map((attempt) => {
        const student = studentMap.get(attempt.student_id);
        const quiz = quizMap.get(attempt.quiz_id);

        const score = Number(attempt.score);
        const totalMarks = Number(attempt.total_marks);

        const percentage = Number(
          ((score / totalMarks) * 100).toFixed(2)
        );

        const passingMarks = Number(quiz?.passing_marks ?? 0);

        return {
          "Student Name": student?.full_name || "",
          "Phone": student?.phone || "",
          "Class": student?.class_level || "",
          "Quiz Title": quiz?.title || "Deleted Quiz",
          "Score": score,
          "Total Marks": totalMarks,
          "Percentage (%)": percentage,
          "Result": score >= passingMarks ? "Passed" : "Failed",
          "Attempt Status": attempt.status || "",
          "Started At": attempt.started_at
            ? new Date(attempt.started_at).toLocaleString("en-IN")
            : "",
          "Submitted At": attempt.submitted_at
            ? new Date(attempt.submitted_at).toLocaleString("en-IN")
            : "",
        };
      });

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    summarySheet["!cols"] = [
      { wch: 24 },
      { wch: 16 },
      { wch: 10 },
      { wch: 16 },
      { wch: 18 },
      { wch: 15 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Student Summary"
    );

    const attemptsSheet = XLSX.utils.json_to_sheet(attemptRows);
    attemptsSheet["!cols"] = [
      { wch: 24 },
      { wch: 16 },
      { wch: 10 },
      { wch: 30 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 12 },
      { wch: 16 },
      { wch: 24 },
      { wch: 24 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      attemptsSheet,
      "Student Attempts"
    );

    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="student-performance-analytics.xlsx"',
      },
    });
  } catch (error) {
    console.error("Student analytics export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to export student analytics",
      },
      { status: 500 }
    );
  }
}
