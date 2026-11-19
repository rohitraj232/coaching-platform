
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    studentId: string;
  }>;
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    // 1. Verify logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // 2. Verify admin role
    const { data: admin, error: adminError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (adminError || admin?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // 3. Get student ID
    const { studentId } = await context.params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(studentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid student ID" },
        { status: 400 }
      );
    }

    // 4. Validate request body
    const body = await request.json();

    if (typeof body.is_active !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "is_active must be true or false",
        },
        { status: 400 }
      );
    }

    // 5. Verify target student
    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select("id, full_name, role, is_active")
      .eq("id", studentId)
      .eq("role", "student")
      .maybeSingle();

    if (studentError || !student) {
      console.error("Student lookup error:", studentError);

      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // 6. Update account status
    const { data: updatedStudent, error: updateError } =
      await supabase
        .from("profiles")
        .update({
          is_active: body.is_active,
        })
        .eq("id", studentId)
        .eq("role", "student")
        .select("id, full_name, is_active")
        .single();

    if (updateError) {
      console.error("SUPABASE STATUS UPDATE ERROR:", {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Unable to update student status",
          error:
            process.env.NODE_ENV === "development"
              ? {
                  message: updateError.message,
                  details: updateError.details,
                  hint: updateError.hint,
                  code: updateError.code,
                }
              : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: body.is_active
        ? "Student activated successfully"
        : "Student deactivated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Student status API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
