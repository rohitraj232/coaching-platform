
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: Count students in a selected class
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Verify admin
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

    // Validate class
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("classLevel") || "";

    if (!/^(?:[1-9]|1[0-2])$/.test(classLevel)) {
      return NextResponse.json(
        { success: false, message: "Invalid class selected" },
        { status: 400 }
      );
    }

    // Count students
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student")
      .eq("class_level", classLevel);

    if (error) {
      console.error("Student count error:", error);

      return NextResponse.json(
        { success: false, message: "Unable to count students" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      classLevel,
      studentCount: count ?? 0,
    });
  } catch (error) {
    console.error("Bulk student count API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Permanently delete all students from a selected class
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Verify admin
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

    // Validate request
    const body = await request.json();
    const classLevel = String(body.classLevel ?? "");

    if (!/^(?:[1-9]|1[0-2])$/.test(classLevel)) {
      return NextResponse.json(
        { success: false, message: "Invalid class selected" },
        { status: 400 }
      );
    }

    if (body.confirmation !== "DELETE") {
      return NextResponse.json(
        { success: false, message: 'Type "DELETE" to confirm' },
        { status: 400 }
      );
    }

    // Fetch students from selected class
    const { data: students, error: studentsError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "student")
      .eq("class_level", classLevel);

    if (studentsError) {
      console.error("Bulk student lookup error:", studentsError);

      return NextResponse.json(
        { success: false, message: "Unable to fetch class students" },
        { status: 500 }
      );
    }

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No students found in Class ${classLevel}`,
        totalStudents: 0,
        deletedCount: 0,
        failedCount: 0,
      });
    }

    // Process students individually
    const deletedStudents: string[] = [];

    const failedStudents: {
      id: string;
      name: string;
      stage: string;
      error: string;
    }[] = [];

    for (const student of students) {
      // Delete database records
      const { data: deletionData, error: deletionError } =
        await supabase.rpc("admin_delete_student_data", {
          p_student_id: student.id,
        });

      if (deletionError || !deletionData?.success) {
        console.error(
          "Student database deletion failed:",
          student.id,
          deletionError
        );

        failedStudents.push({
          id: student.id,
          name: student.full_name || "Unknown",
          stage: "database",
          error: deletionError?.message || "Database deletion failed",
        });

        continue;
      }

      // Delete Supabase Auth account
      const { error: authError } =
        await supabase.auth.admin.deleteUser(student.id);

      if (authError) {
        console.error(
          "Student Auth deletion failed:",
          student.id,
          authError
        );

        failedStudents.push({
          id: student.id,
          name: student.full_name || "Unknown",
          stage: "auth",
          error: authError.message,
        });

        continue;
      }

      deletedStudents.push(student.id);
    }

    // Prepare summary
    const deletedCount = deletedStudents.length;
    const failedCount = failedStudents.length;

    return NextResponse.json(
      {
        success: failedCount === 0,
        message:
          failedCount === 0
            ? `Successfully deleted ${deletedCount} students from Class ${classLevel}`
            : `Deleted ${deletedCount} students. ${failedCount} students require attention.`,
        classLevel,
        totalStudents: students.length,
        deletedCount,
        failedCount,
        deletedStudentIds: deletedStudents,
        failedStudents,
      },
      { status: failedCount > 0 ? 207 : 200 }
    );
  } catch (error) {
    console.error("Bulk student deletion API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
