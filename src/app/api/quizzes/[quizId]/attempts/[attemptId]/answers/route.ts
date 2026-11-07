
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
  request: Request,
  context: RouteContext
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

    // 2. Get route parameters
    const { quizId, attemptId } = await context.params;

    // 3. Read request body
    let body: {
      questionId?: string;
      selectedOption?: string | null;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const { questionId, selectedOption } = body;

    if (!questionId || typeof questionId !== "string") {
      return NextResponse.json(
        { success: false, message: "Question ID is required." },
        { status: 400 }
      );
    }

    const validOptions = ["A", "B", "C", "D"];

    if (
      selectedOption !== null &&
      !validOptions.includes(selectedOption as string)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid answer option." },
        { status: 400 }
      );
    }

    // 4. Create trusted server-side Supabase client
    const supabase = createAdminClient();

    // 5. Verify attempt ownership and status
    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .select(
        "id, quiz_id, student_id, selected_language, expires_at, status"
      )
      .eq("id", attemptId)
      .eq("quiz_id", quizId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (attemptError) {
      console.error("Attempt lookup error:", attemptError.message);

      return NextResponse.json(
        { success: false, message: "Unable to verify quiz attempt." },
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
        { success: false, message: "This quiz attempt is no longer active." },
        { status: 409 }
      );
    }

    // 6. Enforce deadline using server time
    if (new Date(attempt.expires_at).getTime() <= Date.now()) {
      return NextResponse.json(
        {
          success: false,
          expired: true,
          message: "Quiz time has expired. Your attempt must be submitted.",
        },
        { status: 409 }
      );
    }

    // 7. Verify that the question belongs to this quiz
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id")
      .eq("id", questionId)
      .eq("quiz_id", quizId)
      .maybeSingle();

    if (questionError) {
      console.error("Question lookup error:", questionError.message);

      return NextResponse.json(
        { success: false, message: "Unable to verify question." },
        { status: 500 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question does not belong to this quiz." },
        { status: 400 }
      );
    }

    // 8. Verify translation exists for the selected language
    const { data: translation, error: translationError } = await supabase
      .from("question_translations")
      .select("id")
      .eq("question_id", questionId)
      .eq("language", attempt.selected_language)
      .maybeSingle();

    if (translationError) {
      console.error("Translation lookup error:", translationError.message);

      return NextResponse.json(
        { success: false, message: "Unable to verify question language." },
        { status: 500 }
      );
    }

    if (!translation) {
      return NextResponse.json(
        {
          success: false,
          message: "Question is unavailable in your selected language.",
        },
        { status: 400 }
      );
    }

    // 9. Save or update the student's answer
    const { data: savedAnswer, error: saveError } = await supabase
      .from("quiz_attempt_answers")
      .upsert(
        {
          attempt_id: attemptId,
          question_id: questionId,
          selected_option: selectedOption,
          answered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "attempt_id,question_id",
        }
      )
      .select("id, question_id, selected_option, updated_at")
      .single();

    if (saveError) {
      console.error("Save answer error:", saveError.message);

      return NextResponse.json(
        { success: false, message: "Unable to save your answer." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Answer saved successfully.",
      answer: savedAnswer,
    });
  } catch (error) {
    console.error("Save answer API error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}
