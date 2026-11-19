
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ videoId: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { response, user } = await requireAdminApi();

    if (response || !user) return response;

    const { videoId } = await params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(videoId)) {
      return NextResponse.json(
        { success: false, message: "Invalid video ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isPublished } = body;

    if (typeof isPublished !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid publish status." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("youtube_videos")
      .update({
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", videoId)
      .select("id, is_published")
      .maybeSingle();

    if (error) {
      console.error("Update video publish status error:", error);

      return NextResponse.json(
        { success: false, message: "Failed to update video status." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isPublished
        ? "Video published successfully."
        : "Video unpublished successfully.",
      video: data,
    });
  } catch (error) {
    console.error("Publish video API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
