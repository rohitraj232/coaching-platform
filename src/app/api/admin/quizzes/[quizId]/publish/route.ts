
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const { quizId } = await params;
    const supabase = createAdminClient();

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    // Load quiz
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("id, total_marks, is_published")
      .eq("id", quizId)
      .maybeSingle();

    if (quizError) throw quizError;

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: "Quiz not found." },
        { status: 404 }
      );
    }

    if (quiz.is_published) {
      return NextResponse.json(
        { success: false, message: "Quiz is already published." },
        { status: 400 }
      );
    }

    // Load questions
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("id, marks")
      .eq("quiz_id", quizId);

    if (questionsError) throw questionsError;

    const questionList = questions || [];

    if (questionList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Upload at least one question before publishing.",
        },
        { status: 400 }
      );
    }

    const questionIds = questionList.map((q) => q.id);

    // Load translations and answer keys
    const [
      { data: translations, error: translationsError },
      { data: answerKeys, error: answerKeysError },
    ] = await Promise.all([
      supabase
        .from("question_translations")
        .select(
          "question_id, language, question_text, option_a, option_b, option_c, option_d"
        )
        .in("question_id", questionIds),

      supabase
        .from("question_answer_keys")
        .select("question_id, correct_option")
        .in("question_id", questionIds),
    ]);

    if (translationsError) throw translationsError;
    if (answerKeysError) throw answerKeysError;

    const validationErrors: string[] = [];

    for (const question of questionList) {
      const questionTranslations = (translations || []).filter(
        (item) => item.question_id === question.id
      );

      const english = questionTranslations.find(
        (item) => item.language === "en"
      );

      const hindi = questionTranslations.find(
        (item) => item.language === "hi"
      );

      const answerKey = (answerKeys || []).find(
        (item) => item.question_id === question.id
      );

      const label = `Question ${question.id}`;

      for (const [language, translation] of [
        ["English", english],
        ["Hindi", hindi],
      ] as const) {
        if (!translation) {
          validationErrors.push(`${label}: ${language} translation is missing.`);
          continue;
        }

        const fields = [
          translation.question_text,
          translation.option_a,
          translation.option_b,
          translation.option_c,
          translation.option_d,
        ];

        if (fields.some((value) => !value?.trim())) {
          validationErrors.push(
            `${label}: ${language} question or options are incomplete.`
          );
        }
      }

      if (
        !answerKey ||
        !["A", "B", "C", "D"].includes(answerKey.correct_option)
      ) {
        validationErrors.push(`${label}: Correct answer is missing or invalid.`);
      }

      if (Number(question.marks) <= 0) {
        validationErrors.push(`${label}: Marks must be greater than zero.`);
      }
    }

    // Check total marks
    const calculatedMarks = questionList.reduce(
      (total, question) => total + Number(question.marks),
      0
    );

    if (Math.abs(calculatedMarks - Number(quiz.total_marks)) > 0.001) {
      validationErrors.push(
        `Question marks total ${calculatedMarks}, but quiz total marks are ${quiz.total_marks}.`
      );
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quiz validation failed.",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Publish quiz
    const { data: updatedQuiz, error: updateError } = await supabase
      .from("quizzes")
      .update({ is_published: true })
      .eq("id", quizId)
      .eq("is_published", false)
      .select("id, title, is_published")
      .maybeSingle();

    if (updateError) throw updateError;

    if (!updatedQuiz) {
      return NextResponse.json(
        {
          success: false,
          message: "Quiz could not be published. Please refresh and try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Quiz published successfully.",
      quiz: updatedQuiz,
      totalQuestions: questionList.length,
      totalMarks: calculatedMarks,
    });
  } catch (error: unknown) {
    console.error("Publish quiz API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
