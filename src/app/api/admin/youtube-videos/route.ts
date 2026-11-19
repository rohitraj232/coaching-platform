
import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";
import { getYouTubeVideoDetails } from "@/lib/youtube";

export const runtime = "nodejs";

const ALLOWED_CLASSES = ["8", "9", "10", "11", "12"];

export async function POST(request: NextRequest) {
  try {
    // 1. Check admin authentication
    const { user, response } = await requireAdminApi();

    if (response || !user) {
      return response;
    }

    // 2. Read request body
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

    // 3. Validate required fields
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof youtubeUrl !== "string" ||
      !youtubeUrl.trim() ||
      typeof classLevel !== "string" ||
      typeof subject !== "string" ||
      !subject.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, YouTube URL, class and subject are required.",
        },
        { status: 400 }
      );
    }

    // 4. Validate field lengths
    if (title.trim().length > 255) {
      return NextResponse.json(
        { success: false, message: "Title cannot exceed 255 characters." },
        { status: 400 }
      );
    }

    if (subject.trim().length > 100) {
      return NextResponse.json(
        { success: false, message: "Subject cannot exceed 100 characters." },
        { status: 400 }
      );
    }

    if (
      description !== undefined &&
      description !== null &&
      (typeof description !== "string" || description.length > 5000)
    ) {
      return NextResponse.json(
        { success: false, message: "Description cannot exceed 5000 characters." },
        { status: 400 }
      );
    }

    if (
      chapter !== undefined &&
      chapter !== null &&
      (typeof chapter !== "string" || chapter.length > 255)
    ) {
      return NextResponse.json(
        { success: false, message: "Chapter cannot exceed 255 characters." },
        { status: 400 }
      );
    }

    // 5. Validate class
    if (!ALLOWED_CLASSES.includes(classLevel)) {
      return NextResponse.json(
        { success: false, message: "Invalid class selected." },
        { status: 400 }
      );
    }

    // 6. Validate display order
    const order = displayOrder ?? 0;

    if (!Number.isInteger(order) || order < 0) {
      return NextResponse.json(
        { success: false, message: "Display order must be a non-negative integer." },
        { status: 400 }
      );
    }

    // 7. Extract YouTube video ID and thumbnail
    const videoDetails = getYouTubeVideoDetails(youtubeUrl);

    if (!videoDetails) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid YouTube URL. Please enter a valid YouTube video link.",
        },
        { status: 400 }
      );
    }

    // 8. Insert video into Supabase
    const supabase = createAdminClient();

    const { data: video, error } = await supabase
      .from("youtube_videos")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        youtube_url: youtubeUrl.trim(),
        youtube_video_id: videoDetails.videoId,
        thumbnail_url: videoDetails.thumbnailUrl,
        class_level: classLevel,
        subject: subject.trim(),
        chapter: chapter?.trim() || null,
        display_order: order,
        is_published: false,
        created_by: user.id,
      })
      .select(
        "id, title, description, youtube_url, youtube_video_id, thumbnail_url, class_level, subject, chapter, is_published, display_order, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("Add YouTube video error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to add YouTube video.",
        },
        { status: 500 }
      );
    }

    // 9. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "YouTube video added successfully.",
        video,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("YouTube video API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while adding the video.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Check admin authentication
    const { user, response } = await requireAdminApi();

    if (response || !user) {
      return response;
    }

    // 2. Read query parameters
    const { searchParams } = new URL(request.url);

    const classLevel = searchParams.get("classLevel");
    const subject = searchParams.get("subject");
    const search = searchParams.get("search")?.trim() || "";

    const page = Math.max(
      1,
      Number(searchParams.get("page")) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 50)
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 3. Validate filters
    const allowedClasses = ["8", "9", "10", "11", "12"];

    if (classLevel && !allowedClasses.includes(classLevel)) {
      return NextResponse.json(
        { success: false, message: "Invalid class selected." },
        { status: 400 }
      );
    }

    if (subject && subject.length > 100) {
      return NextResponse.json(
        { success: false, message: "Invalid subject filter." },
        { status: 400 }
      );
    }

    if (search.length > 100) {
      return NextResponse.json(
        { success: false, message: "Search cannot exceed 100 characters." },
        { status: 400 }
      );
    }

    // 4. Create Supabase admin client
    const supabase = createAdminClient();

    // 5. Build videos query
    let query = supabase
      .from("youtube_videos")
      .select(
        `
          id,
          title,
          description,
          youtube_url,
          youtube_video_id,
          thumbnail_url,
          class_level,
          subject,
          chapter,
          is_published,
          display_order,
          created_by,
          created_at,
          updated_at
        `,
        { count: "exact" }
      );

    if (classLevel) {
      query = query.eq("class_level", classLevel);
    }

    if (subject) {
      query = query.ilike("subject", `%${subject}%`);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    // 6. Fetch videos
    const {
      data: videos,
      error,
      count,
    } = await query
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Fetch YouTube videos error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch YouTube videos.",
        },
        { status: 500 }
      );
    }

    // 7. Return videos
    return NextResponse.json({
      success: true,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      videos: videos || [],
    });
  } catch (error) {
    console.error("YouTube video list API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching videos.",
      },
      { status: 500 }
    );
  }
}
