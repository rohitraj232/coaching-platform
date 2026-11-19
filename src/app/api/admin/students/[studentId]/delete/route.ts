
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    studentId: string;
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

    // 3. Validate student ID
    const { studentId } = await context.params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(studentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid student ID" },
        { status: 400 }
      );
    }

    // 4. Verify student exists
    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", studentId)
      .eq("role", "student")
      .maybeSingle();

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // 5. Delete student data from database
    const { data: deletionData, error: deletionError } =
      await supabase.rpc("admin_delete_student_data", {
        p_student_id: studentId,
      });

    if (deletionError || !deletionData?.success) {
      console.error("Student database deletion error:", deletionError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to delete student database records",
          error:
            process.env.NODE_ENV === "development"
              ? deletionError?.message || "Database deletion failed"
              : undefined,
        },
        { status: 500 }
      );
    }

    // 6. Delete Supabase Auth account
    const { error: authDeleteError } =
      await supabase.auth.admin.deleteUser(studentId);

    if (authDeleteError) {
      console.error("Student Auth deletion error:", authDeleteError);

      return NextResponse.json(
        {
          success: false,
          message:
            "Student database records were deleted, but the Auth account could not be deleted.",
          error:
            process.env.NODE_ENV === "development"
              ? authDeleteError.message
              : undefined,
          partialDeletion: true,
        },
        { status: 500 }
      );
    }

    // 7. Success
    return NextResponse.json({
      success: true,
      message: "Student permanently deleted successfully",
      student: {
        id: student.id,
        fullName: student.full_name,
      },
      deleted: {
        attempts: deletionData.attempts_deleted,
        profiles: deletionData.profiles_deleted,
        authAccount: true,
      },
    });
  } catch (error) {
    console.error("Student deletion API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
