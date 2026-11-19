
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    quizId: string;
    attemptId: string;
  }>;
}

export async function POST(
  _request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { quizId, attemptId } = await context.params;
    const admin = createAdminClient();

    const { data, error } = await admin.rpc(
      "submit_quiz_attempt",
      {
        p_quiz_id: quizId,
        p_attempt_id: attemptId,
        p_student_id: user.id,
        p_reason: "manual_submission",
      }
    );

    if (error) {
      console.error("Quiz Submit RPC Error:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.code === "P0002" ? 404 : 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Quiz submitted successfully.",
      result: data,
    });
  } catch (error) {
    console.error("Submit Quiz Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit quiz.",
      },
      { status: 500 }
    );
  }
}
