
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
      "register_quiz_tab_switch",
      {
        p_quiz_id: quizId,
        p_attempt_id: attemptId,
        p_student_id: user.id,
      }
    );

    if (error) {
      console.error("Tab Switch RPC Error:", error);

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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Tab Switch API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to record tab switch.",
      },
      { status: 500 }
    );
  }
}
