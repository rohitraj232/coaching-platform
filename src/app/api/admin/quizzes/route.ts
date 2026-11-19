
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    // 2. Create admin Supabase client
    const supabase = createAdminClient();

    // 3. Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    // 4. Read request body
    const body = await request.json();

    const {
      courseId,
      title,
      description,
      durationMinutes,
      totalMarks,
      passingMarks,
      negativeMarking,
      negativeMarks,
      startAt,
      endAt,
    } = body;

    // 5. Validate required fields
    if (!courseId || !title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Course and quiz title are required." },
        { status: 400 }
      );
    }

    if (title.trim().length < 3 || title.trim().length > 150) {
      return NextResponse.json(
        { success: false, message: "Quiz title must be between 3 and 150 characters." },
        { status: 400 }
      );
    }

    const duration = Number(durationMinutes);
    const total = Number(totalMarks);
    const passing = Number(passingMarks);
    const negative = Number(negativeMarks);

    if (
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 600
    ) {
      return NextResponse.json(
        { success: false, message: "Duration must be between 1 and 600 minutes." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(total) ||
      total <= 0 ||
      !Number.isFinite(passing) ||
      passing < 0 ||
      passing > total
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter valid total and passing marks." },
        { status: 400 }
      );
    }

    if (
      negativeMarking &&
      (!Number.isFinite(negative) || negative <= 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter valid negative marks." },
        { status: 400 }
      );
    }

    // 6. Validate dates
    const startDate = startAt ? new Date(startAt) : null;
    const endDate = endAt ? new Date(endAt) : null;

    if (
      (startDate && Number.isNaN(startDate.getTime())) ||
      (endDate && Number.isNaN(endDate.getTime()))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid quiz availability date." },
        { status: 400 }
      );
    }

    if (startDate && endDate && endDate <= startDate) {
      return NextResponse.json(
        { success: false, message: "End date must be later than start date." },
        { status: 400 }
      );
    }

    // 7. Verify course exists and is active
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .eq("is_active", true)
      .maybeSingle();

    if (courseError || !course) {
      return NextResponse.json(
        { success: false, message: "Selected course not found or inactive." },
        { status: 404 }
      );
    }

    // 8. Create quiz as unpublished draft
    const { data: quiz, error: insertError } = await supabase
      .from("quizzes")
      .insert({
        course_id: courseId,
        title: title.trim(),
        description: description?.trim() || null,
        duration_minutes: duration,
        total_marks: total,
        passing_marks: passing,
        negative_marking: Boolean(negativeMarking),
        negative_marks: negativeMarking ? negative : 0,
        start_at: startDate?.toISOString() ?? null,
        end_at: endDate?.toISOString() ?? null,
        is_published: false,
      })
      .select("id, title")
      .single();

    if (insertError) {
      console.error("Create quiz database error:", insertError);

      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 400 }
      );
    }

    // 9. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Quiz created successfully.",
        quiz,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create quiz API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create quiz.",
      },
      { status: 500 }
    );
  }
}
