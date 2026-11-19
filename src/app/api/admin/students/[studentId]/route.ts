
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
        { success: false, message: "Forbidden: Admin access required" },
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

    // 4. Read request body
    const body = await request.json();

    const fullName =
      typeof body.full_name === "string"
        ? body.full_name.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const classLevel = String(body.class_level ?? "");

    // 5. Validate fields
    if (!fullName) {
      return NextResponse.json(
        { success: false, message: "Student name is required" },
        { status: 400 }
      );
    }

    if (fullName.length > 100) {
      return NextResponse.json(
        { success: false, message: "Student name is too long" },
        { status: 400 }
      );
    }

    if (phone && !/^\+?[0-9\s-]{7,15}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid phone number" },
        { status: 400 }
      );
    }

    if (!/^(1[0-2]|[1-9])$/.test(classLevel)) {
      return NextResponse.json(
        { success: false, message: "Class must be between 1 and 12" },
        { status: 400 }
      );
    }

    // 6. Verify student exists
    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", studentId)
      .maybeSingle();

    if (studentError || !student || student.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // 7. Update student
    const { data: updatedStudent, error: updateError } =
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone || null,
          class_level: classLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", studentId)
        .eq("role", "student")
        .select(
          "id, full_name, phone, class_level, is_active, updated_at"
        )
        .single();

    if (updateError) {
      console.error("Student update error:", updateError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to update student details",
          error: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Student details updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Update student API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
