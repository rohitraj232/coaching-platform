
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
    // 1. Verify student authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    const { quizId, attemptId } = await params;
    const supabase = createAdminClient();

    // 2. Fetch the student's attempt
    const { data: attempt, error } = await supabase
      .from("quiz_attempts")
      .select(
        "id, status, expires_at, tab_switch_count, max_tab_switches"
      )
      .eq("id", attemptId)
      .eq("quiz_id", quizId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (error || !attempt) {
      return NextResponse.json(
        { success: false, message: "Quiz attempt not found." },
        { status: 404 }
      );
    }

    if (attempt.status !== "in_progress") {
      return NextResponse.json(
        { success: false, message: "This quiz is no longer active." },
        { status: 409 }
      );
    }

    // 3. Check quiz deadline
    if (Date.now() >= new Date(attempt.expires_at).getTime()) {
      return NextResponse.json(
        {
          success: false,
          message: "Quiz time has expired. Submit your quiz.",
          expired: true,
          shouldSubmit: true,
        },
        { status: 409 }
      );
    }

    // 4. Check if the limit has already been reached
    if (attempt.tab_switch_count >= attempt.max_tab_switches) {
      return NextResponse.json({
        success: true,
        tabSwitchCount: attempt.tab_switch_count,
        maxTabSwitches: attempt.max_tab_switches,
        shouldSubmit: true,
        message: "Tab switch limit reached.",
      });
    }

    // 5. Increment the count using the previous count as a condition.
    // This prevents two simultaneous requests from overwriting each other.
    const newCount = attempt.tab_switch_count + 1;

    const { data: updatedAttempt, error: updateError } = await supabase
      .from("quiz_attempts")
      .update({
        tab_switch_count: newCount,
      })
      .eq("id", attemptId)
      .eq("student_id", user.id)
      .eq("status", "in_progress")
      .eq("tab_switch_count", attempt.tab_switch_count)
      .select("tab_switch_count, max_tab_switches")
      .maybeSingle();

    if (updateError) {
      console.error("Tab switch update error:", updateError.message);

      return NextResponse.json(
        { success: false, message: "Unable to record tab switch." },
        { status: 500 }
      );
    }

    if (!updatedAttempt) {
      return NextResponse.json(
        {
          success: false,
          message: "Tab switch could not be recorded. Please retry.",
        },
        { status: 409 }
      );
    }

    const shouldSubmit =
      updatedAttempt.tab_switch_count >=
      updatedAttempt.max_tab_switches;

    return NextResponse.json({
      success: true,
      tabSwitchCount: updatedAttempt.tab_switch_count,
      maxTabSwitches: updatedAttempt.max_tab_switches,
      shouldSubmit,
      message: shouldSubmit
        ? "Tab switch limit reached. Submit the quiz."
        : "Tab switch recorded.",
    });
  } catch (error) {
    console.error("Tab switch API error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}
