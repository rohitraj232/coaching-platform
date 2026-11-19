import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify login
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // 2. Verify admin role on the server
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "You are not authorized to create quizzes." },
        { status: 403 }
      );
    }

    // 3. Read and validate form data
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

    if (
      typeof courseId !== "string" ||
      typeof title !== "string" ||
      title.trim().length < 3 ||
      title.trim().length > 150
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid course and quiz title." },
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
      duration > 600 ||
      !Number.isFinite(total) ||
      total <= 0 ||
      !Number.isFinite(passing) ||
      passing < 0 ||
      passing > total ||
      typeof negativeMarking !== "boolean" ||
      !Number.isFinite(negative) ||
      negative < 0 ||
      (negativeMarking && negative <= 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Please check the duration and marks values." },
        { status: 400 }
      );
    }

    // 4. Validate optional dates
    const parsedStart = startAt ? new Date(startAt) : null;
    const parsedEnd = endAt ? new Date(endAt) : null;

    if (
      (parsedStart && Number.isNaN(parsedStart.getTime())) ||
      (parsedEnd && Number.isNaN(parsedEnd.getTime()))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid quiz availability date." },
        { status: 400 }
      );
    }

    if (parsedStart && parsedEnd && parsedEnd <= parsedStart) {
      return NextResponse.json(
        { success: false, message: "End date must be later than start date." },
        { status: 400 }
      );
    }

    // 5. Verify the selected course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .eq("is_active", true)
      .maybeSingle();

    if (courseError || !course) {
      return NextResponse.json(
        { success: false, message: "Selected course was not found or is inactive." },
        { status: 400 }
      );
    }

    // 6. Insert as an unpublished draft
    const { data: quiz, error: insertError } = await supabase
      .from("quizzes")
      .insert({
        course_id: courseId,
        title: title.trim(),
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
        duration_minutes: duration,
        total_marks: total,
        passing_marks: passing,
        negative_marking: negativeMarking,
        negative_marks: negativeMarking ? negative : 0,
        start_at: parsedStart?.toISOString() ?? null,
        end_at: parsedEnd?.toISOString() ?? null,
        is_published: false,
      })
      .select("id, title, is_published")
      .single();

    if (insertError) {
      console.error("Create quiz error:", insertError.message);

      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 500 }
      );
    }

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
      { success: false, message: "Something went wrong while creating the quiz." },
      { status: 500 }
    );
  }
}