
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/get-current-user";

type RouteContext = {
  params: Promise<{
    quizId: string;
    attemptId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    // 1. Verify logged-in student
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    // 2. Get route parameters
    const { quizId, attemptId } = await context.params;

    const supabase = createAdminClient();

    // 3. Verify attempt ownership
    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .select(
        "id, quiz_id, student_id, selected_language, started_at, expires_at, status, total_marks, tab_switch_count, max_tab_switches"
      )
      .eq("id", attemptId)
      .eq("quiz_id", quizId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (attemptError) {
      console.error("Attempt lookup error:", attemptError.message);

      return NextResponse.json(
        { success: false, message: "Unable to load quiz attempt." },
        { status: 500 }
      );
    }

    if (!attempt) {
      return NextResponse.json(
        { success: false, message: "Quiz attempt not found." },
        { status: 404 }
      );
    }

    if (attempt.status !== "in_progress") {
      return NextResponse.json(
        {
          success: false,
          message: "This quiz attempt is no longer active.",
          status: attempt.status,
        },
        { status: 409 }
      );
    }

    // 4. Calculate remaining time using server time
    const expiresAt = new Date(attempt.expires_at).getTime();
    const remainingSeconds = Math.max(
      0,
      Math.floor((expiresAt - Date.now()) / 1000)
    );

    if (remainingSeconds <= 0) {
      return NextResponse.json(
        {
          success: false,
          expired: true,
          message: "Quiz time has expired. Please submit your attempt.",
          expiresAt: attempt.expires_at,
          remainingSeconds: 0,
        },
        { status: 409 }
      );
    }

    // 5. Fetch questions belonging to this quiz
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("id, question_code, question_order, marks, negative_marks")
      .eq("quiz_id", quizId)
      .order("question_order", { ascending: true });

    if (questionsError) {
      console.error("Questions lookup error:", questionsError.message);

      return NextResponse.json(
        { success: false, message: "Unable to load questions." },
        { status: 500 }
      );
    }

    const questionList = questions ?? [];
    const questionIds = questionList.map((question) => question.id);

    // 6. Fetch translations in the selected language
    let translations: {
      question_id: string;
      language: string;
      question_text: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
    }[] = [];

    if (questionIds.length > 0) {
      const { data, error: translationError } = await supabase
        .from("question_translations")
        .select(
          "question_id, language, question_text, option_a, option_b, option_c, option_d"
        )
        .in("question_id", questionIds)
        .eq("language", attempt.selected_language);

      if (translationError) {
        console.error(
          "Translation lookup error:",
          translationError.message
        );

        return NextResponse.json(
          { success: false, message: "Unable to load question translations." },
          { status: 500 }
        );
      }

      translations = data ?? [];
    }

    // 7. Fetch previously saved answers
    let savedAnswers: {
      question_id: string;
      selected_option: string | null;
    }[] = [];

    const { data: answers, error: answersError } = await supabase
      .from("quiz_attempt_answers")
      .select("question_id, selected_option")
      .eq("attempt_id", attemptId);

    if (answersError) {
      console.error("Saved answers lookup error:", answersError.message);

      return NextResponse.json(
        { success: false, message: "Unable to restore saved answers." },
        { status: 500 }
      );
    }

    savedAnswers = answers ?? [];

    // 8. Create lookup maps
    const translationMap = new Map(
      translations.map((item) => [item.question_id, item])
    );

    const answerMap = new Map(
      savedAnswers.map((item) => [
        item.question_id,
        item.selected_option,
      ])
    );

    // 9. Prepare safe response
    const formattedQuestions = questionList.map((question) => {
      const translation = translationMap.get(question.id);

      return {
        id: question.id,
        questionCode: question.question_code,
        questionOrder: question.question_order,
        marks: question.marks,
        negativeMarks: question.negative_marks,
        questionText: translation?.question_text ?? null,
        options: {
          A: translation?.option_a ?? null,
          B: translation?.option_b ?? null,
          C: translation?.option_c ?? null,
          D: translation?.option_d ?? null,
        },
        selectedOption: answerMap.get(question.id) ?? null,
      };
    });

    // 10. Prevent incomplete language data from silently appearing
    const missingTranslations = formattedQuestions.some(
      (question) =>
        !question.questionText ||
        !question.options.A ||
        !question.options.B ||
        !question.options.C ||
        !question.options.D
    );

    if (missingTranslations) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Some questions are missing translations in your selected language. Please contact the administrator.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Quiz questions loaded successfully.",
        attempt: {
          id: attempt.id,
          quizId: attempt.quiz_id,
          language: attempt.selected_language,
          startedAt: attempt.started_at,
          expiresAt: attempt.expires_at,
          remainingSeconds,
          totalMarks: attempt.total_marks,
          tabSwitchCount: attempt.tab_switch_count,
          maxTabSwitches: attempt.max_tab_switches,
        },
        questions: formattedQuestions,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Get quiz questions error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}
