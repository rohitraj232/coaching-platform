
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    quizId: string;
    attemptId: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    // 1. Verify logged-in student
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { quizId, attemptId } = await context.params;
    const supabase = createAdminClient();

    // 2. Fetch student's attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .select(`
        id,
        quiz_id,
        student_id,
        status,
        score,
        total_marks,
        selected_language,
        started_at,
        submitted_at,
        auto_submit_reason
      `)
      .eq("id", attemptId)
      .eq("quiz_id", quizId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (attemptError) {
      console.error("Result Attempt Error:", attemptError);

      return NextResponse.json(
        { success: false, message: "Unable to load result." },
        { status: 500 }
      );
    }

    if (!attempt) {
      return NextResponse.json(
        { success: false, message: "Quiz attempt not found." },
        { status: 404 }
      );
    }

    // 3. Result is available only after evaluation
    if (attempt.status !== "evaluated") {
      return NextResponse.json(
        {
          success: false,
          message: "Your quiz result is not available yet.",
        },
        { status: 409 }
      );
    }

    // 4. Fetch quiz details
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("id, title, passing_marks, negative_marking")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      console.error("Result Quiz Error:", quizError);

      return NextResponse.json(
        { success: false, message: "Unable to load quiz details." },
        { status: 500 }
      );
    }

    // 5. Fetch questions
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("id, marks, negative_marks")
      .eq("quiz_id", quizId);

    if (questionsError) {
      console.error("Result Questions Error:", questionsError);

      return NextResponse.json(
        { success: false, message: "Unable to load questions." },
        { status: 500 }
      );
    }

    const questionList = questions ?? [];
    const questionIds = questionList.map((question) => question.id);

    // 6. Fetch saved answers
    const { data: answers, error: answersError } = await supabase
      .from("quiz_attempt_answers")
      .select("question_id, selected_option")
      .eq("attempt_id", attemptId);

    if (answersError) {
      console.error("Result Answers Error:", answersError);

      return NextResponse.json(
        { success: false, message: "Unable to load submitted answers." },
        { status: 500 }
      );
    }

    // 7. Fetch answer keys on the server only
    const { data: answerKeys, error: keysError } = await supabase
      .from("question_answer_keys")
      .select("question_id, correct_option")
      .in("question_id", questionIds);

    if (keysError) {
      console.error("Result Answer Keys Error:", keysError);

      return NextResponse.json(
        { success: false, message: "Unable to evaluate result details." },
        { status: 500 }
      );
    }

    const answerMap = new Map(
      (answers ?? []).map((answer) => [
        answer.question_id,
        answer.selected_option,
      ])
    );

    const keyMap = new Map(
      (answerKeys ?? []).map((key) => [
        key.question_id,
        key.correct_option,
      ])
    );

    // 8. Calculate question statistics on the server
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let correctMarks = 0;
    let negativeMarksDeducted = 0;

    for (const question of questionList) {
      const selectedOption = answerMap.get(question.id);
      const correctOption = keyMap.get(question.id);

      if (!selectedOption) {
        unanswered++;
        continue;
      }

      if (selectedOption === correctOption) {
        correct++;
        correctMarks += Number(question.marks);
      } else {
        wrong++;

        if (quiz.negative_marking) {
          negativeMarksDeducted += Number(question.negative_marks);
        }
      }
    }

    // Score itself comes from the database evaluation RPC.
    const score = Number(attempt.score ?? 0);
    const totalMarks = Number(attempt.total_marks ?? 0);
    const passingMarks = Number(quiz.passing_marks ?? 0);

    const percentage =
      totalMarks > 0
        ? Number(((score / totalMarks) * 100).toFixed(2))
        : 0;

    // 9. Return safe result data
    return NextResponse.json({
      success: true,
      result: {
        attemptId: attempt.id,
        quizId: attempt.quiz_id,
        quizTitle: quiz.title,
        status: attempt.status,

        score,
        totalMarks,
        passingMarks,
        percentage,
        isPassed: score >= passingMarks,

        totalQuestions: questionList.length,
        correct,
        wrong,
        unanswered,

        correctMarks: Number(correctMarks.toFixed(2)),
        negativeMarksDeducted: Number(
          negativeMarksDeducted.toFixed(2)
        ),

        selectedLanguage: attempt.selected_language,
        startedAt: attempt.started_at,
        submittedAt: attempt.submitted_at,
        autoSubmitReason: attempt.auto_submit_reason,
      },
    });
  } catch (error) {
    console.error("Quiz Result API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load quiz result.",
      },
      { status: 500 }
    );
  }
}
