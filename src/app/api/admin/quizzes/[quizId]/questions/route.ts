
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ quizId: string }>;
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    // 1. Verify logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    const { quizId } = await params;
    const supabase = createAdminClient();

    // 2. Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    // 3. Get quiz details
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("id, title, total_marks, is_published")
      .eq("id", quizId)
      .maybeSingle();

    if (quizError) throw quizError;

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: "Quiz not found." },
        { status: 404 }
      );
    }

    // 4. Get questions
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select(
        "id, question_code, question_order, marks, negative_marks"
      )
      .eq("quiz_id", quizId)
      .order("question_order", { ascending: true });

    if (questionsError) throw questionsError;

    const questionIds = (questions ?? []).map((question) => question.id);

    if (questionIds.length === 0) {
      return NextResponse.json({
        success: true,
        quiz,
        questions: [],
        message: "No questions have been uploaded yet.",
      });
    }

    // 5. Get English and Hindi translations
    const { data: translations, error: translationsError } =
      await supabase
        .from("question_translations")
        .select(
          "question_id, language, question_text, option_a, option_b, option_c, option_d"
        )
        .in("question_id", questionIds)
        .in("language", ["en", "hi"]);

    if (translationsError) throw translationsError;

    // 6. Get answer keys (admin-only endpoint)
    const { data: answerKeys, error: answerKeysError } =
      await supabase
        .from("question_answer_keys")
        .select("question_id, correct_option")
        .in("question_id", questionIds);

    if (answerKeysError) throw answerKeysError;

    // 7. Combine all question data
    const formattedQuestions = (questions ?? []).map((question) => {
      const questionTranslations = (translations ?? []).filter(
        (translation) => translation.question_id === question.id
      );

      const english = questionTranslations.find(
        (translation) => translation.language === "en"
      );

      const hindi = questionTranslations.find(
        (translation) => translation.language === "hi"
      );

      const answer = (answerKeys ?? []).find(
        (item) => item.question_id === question.id
      );

      return {
        ...question,
        en: english ?? null,
        hi: hindi ?? null,
        correct_option: answer?.correct_option ?? null,
        is_valid:
          Boolean(english?.question_text) &&
          Boolean(hindi?.question_text) &&
          Boolean(answer?.correct_option),
      };
    });

    return NextResponse.json({
      success: true,
      quiz,
      questions: formattedQuestions,
      totalQuestions: formattedQuestions.length,
      validQuestions: formattedQuestions.filter(
        (question) => question.is_valid
      ).length,
    });
  } catch (error: unknown) {
  console.error("Admin questions API error:", error);

  const errorDetails =
    error && typeof error === "object"
      ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      : String(error);

  console.error("Error details:", errorDetails);

  return NextResponse.json(
    {
      success: false,
      message: errorDetails,
    },
    { status: 500 }
  );
}
}
