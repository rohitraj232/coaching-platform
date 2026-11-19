
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
    // 1. Authenticate student
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { quizId, attemptId } = await context.params;
    const supabase = createAdminClient();

    // 2. Verify attempt ownership and submission status
    const { data: attempt, error: attemptError } =
      await supabase
        .from("quiz_attempts")
        .select(
          "id, quiz_id, student_id, selected_language, status, submitted_at"
        )
        .eq("id", attemptId)
        .eq("quiz_id", quizId)
        .eq("student_id", user.id)
        .maybeSingle();

    if (attemptError) {
      console.error("Review Attempt Error:", attemptError);

      return NextResponse.json(
        { success: false, message: "Unable to load attempt." },
        { status: 500 }
      );
    }

    if (!attempt) {
      return NextResponse.json(
        { success: false, message: "Attempt not found." },
        { status: 404 }
      );
    }

    // 3. Answer keys are available only after evaluation
    if (attempt.status !== "evaluated") {
      return NextResponse.json(
        {
          success: false,
          message: "Answer review is available after evaluation.",
        },
        { status: 403 }
      );
    }

    // 4. Fetch questions
    const { data: questions, error: questionsError } =
      await supabase
        .from("questions")
        .select(
          "id, question_code, question_order, marks, negative_marks"
        )
        .eq("quiz_id", quizId)
        .order("question_order", { ascending: true });

    if (questionsError) {
      console.error("Review Questions Error:", questionsError);

      return NextResponse.json(
        { success: false, message: "Unable to load questions." },
        { status: 500 }
      );
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, message: "No questions found." },
        { status: 404 }
      );
    }

    const questionIds = questions.map((question) => question.id);

    // 5. Fetch translations in the student's selected language
    const { data: translations, error: translationsError } =
      await supabase
        .from("question_translations")
        .select(
          "question_id, language, question_text, option_a, option_b, option_c, option_d"
        )
        .in("question_id", questionIds)
        .eq("language", attempt.selected_language);

    if (translationsError) {
      console.error("Review Translations Error:", translationsError);

      return NextResponse.json(
        { success: false, message: "Unable to load translations." },
        { status: 500 }
      );
    }

    // 6. Fetch student's saved answers
    const { data: answers, error: answersError } =
      await supabase
        .from("quiz_attempt_answers")
        .select("question_id, selected_option")
        .eq("attempt_id", attemptId);

    if (answersError) {
      console.error("Review Answers Error:", answersError);

      return NextResponse.json(
        { success: false, message: "Unable to load saved answers." },
        { status: 500 }
      );
    }

    // 7. Fetch correct answers (server-side only)
    const { data: answerKeys, error: answerKeysError } =
      await supabase
        .from("question_answer_keys")
        .select("question_id, correct_option")
        .in("question_id", questionIds);

    if (answerKeysError) {
      console.error("Review Answer Keys Error:", answerKeysError);

      return NextResponse.json(
        { success: false, message: "Unable to load answer keys." },
        { status: 500 }
      );
    }

    // 8. Create lookup maps
    const translationMap = new Map(
      (translations || []).map((item) => [
        item.question_id,
        item,
      ])
    );

    const answerMap = new Map(
      (answers || []).map((item) => [
        item.question_id,
        item.selected_option,
      ])
    );

    const answerKeyMap = new Map(
      (answerKeys || []).map((item) => [
        item.question_id,
        item.correct_option,
      ])
    );

    // 9. Build safe review response
    const reviewQuestions = questions.map((question) => {
      const translation = translationMap.get(question.id);
      const selectedOption = answerMap.get(question.id) || null;
      const correctOption =
        answerKeyMap.get(question.id) || null;

      const isCorrect =
        selectedOption !== null &&
        correctOption !== null &&
        selectedOption === correctOption;

      const isUnanswered = selectedOption === null;

      const marksAwarded = isCorrect
        ? Number(question.marks)
        : 0;

      const negativeMarksDeducted =
        !isCorrect && !isUnanswered
          ? Number(question.negative_marks)
          : 0;

      return {
        questionId: question.id,
        questionCode: question.question_code,
        questionOrder: question.question_order,

        questionText: translation?.question_text || "",

        options: {
          A: translation?.option_a || "",
          B: translation?.option_b || "",
          C: translation?.option_c || "",
          D: translation?.option_d || "",
        },

        selectedOption,
        correctOption,

        status: isUnanswered
          ? "unanswered"
          : isCorrect
            ? "correct"
            : "wrong",

        marks: Number(question.marks),
        negativeMarks: Number(question.negative_marks),
        marksAwarded,
        negativeMarksDeducted,
      };
    });

    return NextResponse.json({
      success: true,
      review: {
        attemptId: attempt.id,
        quizId: attempt.quiz_id,
        selectedLanguage: attempt.selected_language,
        submittedAt: attempt.submitted_at,
        totalQuestions: reviewQuestions.length,
        questions: reviewQuestions,
      },
    });
  } catch (error) {
    console.error("Quiz Review API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load answer review.",
      },
      { status: 500 }
    );
  }
}
