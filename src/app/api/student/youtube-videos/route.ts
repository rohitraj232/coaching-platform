
import { NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/require-student-api";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { response, profile } = await requireStudentApi();

    if (response || !profile) {
      return response;
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("youtube_videos")
      .select(
        "id, title, description, youtube_url, youtube_video_id, thumbnail_url, class_level, subject, chapter, created_at"
      )
      .eq("class_level", profile.class_level)
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Student YouTube videos error:", error);

      return NextResponse.json(
        { success: false, message: "Failed to fetch videos." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      classLevel: profile.class_level,
      total: data?.length ?? 0,
      videos: data ?? [],
    });
  } catch (error) {
    console.error("Student YouTube videos API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
