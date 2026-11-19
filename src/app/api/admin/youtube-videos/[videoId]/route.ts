
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";
import { getYouTubeVideoDetails } from "@/lib/youtube";

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

    const {
      title,
      description,
      youtubeUrl,
      classLevel,
      subject,
      chapter,
      displayOrder,
    } = body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 255
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid video title." },
        { status: 400 }
      );
    }

    if (
      typeof youtubeUrl !== "string" ||
      !youtubeUrl.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "YouTube URL is required." },
        { status: 400 }
      );
    }

    if (
      !["8", "9", "10", "11", "12"].includes(classLevel)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid class selected." },
        { status: 400 }
      );
    }

    if (
      typeof subject !== "string" ||
      !subject.trim() ||
      subject.trim().length > 100
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid subject." },
        { status: 400 }
      );
    }

    if (
      description !== undefined &&
      description !== null &&
      (typeof description !== "string" ||
        description.length > 5000)
    ) {
      return NextResponse.json(
        { success: false, message: "Description is too long." },
        { status: 400 }
      );
    }

    if (
      chapter !== undefined &&
      chapter !== null &&
      (typeof chapter !== "string" || chapter.length > 255)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid chapter." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid display order." },
        { status: 400 }
      );
    }

    const videoDetails = getYouTubeVideoDetails(youtubeUrl);

    if (!videoDetails) {
      return NextResponse.json(
        { success: false, message: "Invalid YouTube URL." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("youtube_videos")
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        youtube_url: youtubeUrl.trim(),
        youtube_video_id: videoDetails.videoId,
        thumbnail_url: videoDetails.thumbnailUrl,
        class_level: classLevel,
        subject: subject.trim(),
        chapter: chapter?.trim() || null,
        display_order: displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", videoId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Update YouTube video error:", error);

      return NextResponse.json(
        { success: false, message: "Failed to update video." },
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
      message: "Video updated successfully.",
      video: data,
    });
  } catch (error) {
    console.error("YouTube video update error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("youtube_videos")
      .delete()
      .eq("id", videoId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Delete YouTube video error:", error);

      return NextResponse.json(
        { success: false, message: "Failed to delete video." },
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
      message: "Video deleted successfully.",
    });
  } catch (error) {
    console.error("YouTube video deletion error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
