
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/get-current-user";

type RouteContext = {
  params: Promise<{
    quizId: string;
  }>;
};

type QuizAttempt = {
  id: string;
  quiz_id: string;
  student_id: string;
  selected_language: "en" | "hi";
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  status: "in_progress" | "submitted" | "evaluated";
  tab_switch_count: number;
  max_tab_switches: number;
};

const ATTEMPT_FIELDS =
  "id, quiz_id, student_id, selected_language, started_at, expires_at, submitted_at, status, tab_switch_count, max_tab_switches";

// Return an existing attempt if it is still active.
function handleExistingAttempt(attempt: QuizAttempt) {
  const now = Date.now();
  const expiresAt = new Date(attempt.expires_at).getTime();

  if (attempt.status !== "in_progress") {
    return NextResponse.json(
      {
        success: false,
        message: "You have already submitted this quiz. A second attempt is not allowed.",
      },
      { status: 409 }
    );
  }

  if (expiresAt <= now) {
    return NextResponse.json(
      {
        success: false,
        message: "Your quiz time has expired. Your attempt needs to be submitted.",
        attemptId: attempt.id,
        expired: true,
      },
      { status: 409 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Existing quiz attempt found. Resuming your quiz.",
    attempt,
    resumed: true,
  });
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Get authenticated student.
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to start the quiz.",
        },
        { status: 401 }
      );
    }

    // 2. Get quiz ID from dynamic route.
    const { quizId } = await context.params;

    if (!quizId) {
      return NextResponse.json(
        {
          success: false,
          message: "Quiz ID is required.",
        },
        { status: 400 }
      );
    }

    // 3. Read selected language.
    let body: { language?: string };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const language = body.language;

    if (language !== "en" && language !== "hi") {
      return NextResponse.json(
        {
          success: false,
          message: "Please select Hindi or English.",
        },
        { status: 400 }
      );
    }

    // 4. Create trusted server-side Supabase client.
    const supabase = createAdminClient();

    // 5. Verify student profile and role.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup error:", profileError.message);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to verify your profile.",
        },
        { status: 500 }
      );
    }

    if (!profile || profile.role !== "student") {
      return NextResponse.json(
        {
          success: false,
          message: "Only students can start this quiz.",
        },
        { status: 403 }
      );
    }

    // 6. Fetch quiz details.
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select(
        "id, title, duration_minutes, is_published, start_at, end_at"
      )
      .eq("id", quizId)
      .maybeSingle();

    if (quizError) {
      console.error("Quiz lookup error:", quizError.message);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to retrieve quiz details.",
        },
        { status: 500 }
      );
    }

    if (!quiz) {
      return NextResponse.json(
        {
          success: false,
          message: "Quiz not found.",
        },
        { status: 404 }
      );
    }

    if (!quiz.is_published) {
      return NextResponse.json(
        {
          success: false,
          message: "This quiz is not currently available.",
        },
        { status: 403 }
      );
    }

    // 7. Check whether this student already has an attempt.
    const { data: existingAttempt, error: existingError } =
      await supabase
        .from("quiz_attempts")
        .select(ATTEMPT_FIELDS)
        .eq("quiz_id", quizId)
        .eq("student_id", user.id)
        .maybeSingle();

    if (existingError) {
      console.error(
        "Existing attempt lookup error:",
        existingError.message
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to check your previous attempt.",
        },
        { status: 500 }
      );
    }

    // If an attempt exists, resume it instead of creating another.
    if (existingAttempt) {
      return handleExistingAttempt(existingAttempt as QuizAttempt);
    }

    // 8. Check quiz schedule for a new attempt.
    const now = new Date();

    if (quiz.start_at && now.getTime() < new Date(quiz.start_at).getTime()) {
      return NextResponse.json(
        {
          success: false,
          message: "This quiz has not started yet.",
          startAt: quiz.start_at,
        },
        { status: 403 }
      );
    }

    if (quiz.end_at && now.getTime() >= new Date(quiz.end_at).getTime()) {
      return NextResponse.json(
        {
          success: false,
          message: "This quiz has already closed.",
        },
        { status: 403 }
      );
    }

    // 9. Calculate server-controlled start and expiry times.
    const startedAt = new Date();

    const expiresAt = new Date(
      startedAt.getTime() + quiz.duration_minutes * 60 * 1000
    );

    // 10. SAFEGUARD A:
    // Ensure the student has enough time to complete the full quiz.
    if (
      quiz.end_at &&
      expiresAt.getTime() > new Date(quiz.end_at).getTime()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Not enough time remains to complete this quiz.",
        },
        { status: 400 }
      );
    }

    // 11. Create the attempt.
    const { data: attempt, error: insertError } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        student_id: user.id,
        selected_language: language,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: "in_progress",
      })
      .select(ATTEMPT_FIELDS)
      .single();

    // 12. SAFEGUARD B:
    // Handle simultaneous Start Quiz requests.
    // PostgreSQL error 23505 means a unique constraint was violated.
    if (insertError) {
      if (insertError.code === "23505") {
        const { data: concurrentAttempt, error: fetchError } =
          await supabase
            .from("quiz_attempts")
            .select(ATTEMPT_FIELDS)
            .eq("quiz_id", quizId)
            .eq("student_id", user.id)
            .maybeSingle();

        if (fetchError || !concurrentAttempt) {
          console.error(
            "Concurrent attempt lookup error:",
            fetchError?.message
          );

          return NextResponse.json(
            {
              success: false,
              message: "Unable to retrieve your existing attempt.",
            },
            { status: 500 }
          );
        }

        return handleExistingAttempt(
          concurrentAttempt as QuizAttempt
        );
      }

      console.error("Attempt creation error:", insertError.message);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to start quiz.",
        },
        { status: 500 }
      );
    }

    if (!attempt) {
      return NextResponse.json(
        {
          success: false,
          message: "Quiz attempt could not be created.",
        },
        { status: 500 }
      );
    }

    // 13. Return newly created attempt.
    return NextResponse.json(
      {
        success: true,
        message: "Quiz started successfully.",
        attempt,
        resumed: false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Start quiz API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while starting the quiz.",
      },
      { status: 500 }
    );
  }
}
