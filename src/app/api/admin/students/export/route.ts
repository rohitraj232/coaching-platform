
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("q")?.trim().toLowerCase() || "";
    const classLevel = searchParams.get("classLevel") || "";

    const validClasses = Array.from(
      { length: 12 },
      (_, index) => String(index + 1)
    );

    // Fetch all students in batches
    const students: {
      id: string;
      full_name: string | null;
      phone: string | null;
      class_level: string | null;
      created_at: string | null;
    }[] = [];

    const batchSize = 1000;

    for (let from = 0; ; from += batchSize) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, class_level, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: false })
        .range(from, from + batchSize - 1);

      if (error) {
        console.error("Export fetch error:", error);

        return NextResponse.json(
          { success: false, message: "Unable to fetch students." },
          { status: 500 }
        );
      }

      students.push(...(data || []));

      if (!data || data.length < batchSize) {
        break;
      }
    }

    // Apply class filter
    let filteredStudents = students;

    if (validClasses.includes(classLevel)) {
      filteredStudents = filteredStudents.filter(
        (student) => String(student.class_level) === classLevel
      );
    }

    // Apply search
    if (search) {
      filteredStudents = filteredStudents.filter((student) => {
        return (
          student.full_name?.toLowerCase().includes(search) ||
          student.phone?.toLowerCase().includes(search) ||
          student.id.toLowerCase().includes(search)
        );
      });
    }

    // Prepare Excel data
    const excelData = filteredStudents.map((student, index) => ({
      "S.No.": index + 1,
      "Student Name": student.full_name || "",
      "Student ID": student.id,
      "Phone Number": student.phone || "",
      Class: student.class_level
        ? `Class ${student.class_level}`
        : "",
      "Registration Date": student.created_at
        ? new Date(student.created_at).toLocaleDateString("en-IN")
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 28 },
      { wch: 40 },
      { wch: 18 },
      { wch: 15 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Students"
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const filename =
      classLevel && validClasses.includes(classLevel)
        ? `students-class-${classLevel}.xlsx`
        : "all-students.xlsx";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Student export error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}
