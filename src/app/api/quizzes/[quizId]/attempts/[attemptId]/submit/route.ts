
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/get-current-user";

type RouteContext = {
  params: Promise<{
    quizId: string;
    attemptId: string;
  }>;
};

export async function POST(
  _request: Request,
  { params }: RouteContext
) {
  try {
    // 1. Verify logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { quizId, attemptId } = await params;
    const supabase = createAdminClient();

    // 2. Get this student's attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .select(`
        id,
        quiz_id,
        student_id,
        status,
        expires_at,
        tab_switch_count,
        max_tab_switches
      `)
      .eq("id", attemptId)
      .eq("quiz_id", quizId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { success: false, message: "Quiz attempt not found." },
        { status: 404 }
      );
    }

    // 3. Prevent duplicate submission
    if (attempt.status !== "in_progress") {
      return NextResponse.json(
        {
          success: true,
          message: "This quiz has already been submitted.",
          alreadySubmitted: true,
        },
        { status: 200 }
      );
    }

    // 4. Get quiz marking settings
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("negative_marking, negative_marks")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json(
        { success: false, message: "Quiz details not found." },
        { status: 404 }
      );
    }

    // 5. Get questions
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("id, marks, negative_marks")
      .eq("quiz_id", quizId);

    if (questionsError || !questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, message: "No questions found for this quiz." },
        { status: 400 }
      );
    }

    const questionIds = questions.map((question) => question.id);

    // 6. Get correct answers (server only)
    const { data: answerKeys, error: keysError } = await supabase
      .from("question_answer_keys")
      .select("question_id, correct_option")
      .in("question_id", questionIds);

    if (keysError || !answerKeys || answerKeys.length !== questions.length) {
      return NextResponse.json(
        { success: false, message: "Some answer keys are missing." },
        { status: 500 }
      );
    }

    // 7. Get student's saved answers
    const { data: studentAnswers, error: answersError } = await supabase
      .from("quiz_attempt_answers")
      .select("question_id, selected_option")
      .eq("attempt_id", attemptId);

    if (answersError) {
      return NextResponse.json(
        { success: false, message: "Unable to fetch saved answers." },
        { status: 500 }
      );
    }

    const answerKeyMap = new Map(
      answerKeys.map((item) => [item.question_id, item.correct_option])
    );

    const studentAnswerMap = new Map(
      (studentAnswers ?? []).map((item) => [
        item.question_id,
        item.selected_option,
      ])
    );

    // 8. Calculate score on the server
    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    for (const question of questions) {
      const marks = Number(question.marks);
      totalMarks += marks;

      const selectedOption = studentAnswerMap.get(question.id);
      const correctOption = answerKeyMap.get(question.id);

      if (!selectedOption) {
        unansweredCount++;
        continue;
      }

      if (selectedOption === correctOption) {
        score += marks;
        correctCount++;
      } else {
        wrongCount++;

        if (quiz.negative_marking) {
          const deduction =
            Number(question.negative_marks) > 0
              ? Number(question.negative_marks)
              : Number(quiz.negative_marks);

          score -= deduction;
        }
      }
    }

    // Scores cannot be negative in the current database schema.
    score = Math.max(0, Number(score.toFixed(2)));
    totalMarks = Number(totalMarks.toFixed(2));

    // 9. Determine submission reason using server-side data
    const now = new Date();
    const expired = now >= new Date(attempt.expires_at);
    const tabLimitReached =
      attempt.tab_switch_count >= attempt.max_tab_switches;

    let reason:
      | "time_expired"
      | "tab_switch_limit"
      | "manual_submission";

    if (expired) {
      reason = "time_expired";
    } else if (tabLimitReached) {
      reason = "tab_switch_limit";
    } else {
      reason = "manual_submission";
    }

    // 10. Save final result
    const { data: updatedAttempt, error: updateError } = await supabase
      .from("quiz_attempts")
      .update({
        status: "evaluated",
        submitted_at: now.toISOString(),
        score,
        total_marks: totalMarks,
        auto_submit_reason: reason,
      })
      .eq("id", attemptId)
      .eq("student_id", user.id)
      .eq("status", "in_progress")
      .select("id, score, total_marks, status, submitted_at")
      .maybeSingle();

    if (updateError) {
      console.error("Submit quiz error:", updateError.message);

      return NextResponse.json(
        { success: false, message: "Unable to submit quiz." },
        { status: 500 }
      );
    }

    if (!updatedAttempt) {
      return NextResponse.json(
        {
          success: false,
          message: "This attempt has already been submitted.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Quiz submitted successfully.",
      result: {
        attemptId: updatedAttempt.id,
        score: updatedAttempt.score,
        totalMarks: updatedAttempt.total_marks,
        correctCount,
        wrongCount,
        unansweredCount,
        status: updatedAttempt.status,
        submittedAt: updatedAttempt.submitted_at,
        submissionReason: reason,
      },
    });
  } catch (error) {
    console.error("Submit quiz API error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}
