
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    quizId: string;
  }>;
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    // 1. Verify logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Get quiz ID
    const { quizId } = await context.params;

    // 3. Validate UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(quizId)) {
      return NextResponse.json(
        { success: false, message: "Invalid quiz ID." },
        { status: 400 }
      );
    }

    // 4. Verify admin role
    const supabase = createAdminClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    // 5. Permanently delete quiz and all related records
    const { error: deleteError } = await supabase.rpc(
      "admin_delete_quiz",
      {
        p_quiz_id: quizId,
      }
    );

    if (deleteError) {
      console.error("Quiz deletion error:", deleteError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to delete quiz. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Quiz and all related data deleted permanently.",
    });
  } catch (error) {
    console.error("Delete Quiz API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while deleting the quiz.",
      },
      { status: 500 }
    );
  }
} 