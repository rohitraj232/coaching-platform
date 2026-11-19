
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_CLASSES = ["8", "9", "10", "11", "12"];

// ============================================
// POST: Upload PDF Study Material
// ============================================

export async function POST(request: NextRequest) {
  let uploadedFilePath: string | null = null;

  try {
    const { user, response } = await requireAdminApi();

    if (response) return response;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    const formData = await request.formData();

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const classLevel = String(formData.get("classLevel") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const chapter = String(formData.get("chapter") || "").trim();

    const file = formData.get("file");

    // Validate required fields
    if (!title || !classLevel || !subject || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, class, subject and PDF file are required.",
        },
        { status: 400 }
      );
    }

    // Validate text lengths
    if (
      title.length > 255 ||
      subject.length > 100 ||
      chapter.length > 255 ||
      description.length > 5000
    ) {
      return NextResponse.json(
        { success: false, message: "One or more fields exceed the allowed length." },
        { status: 400 }
      );
    }

    // Validate class
    if (!ALLOWED_CLASSES.includes(classLevel)) {
      return NextResponse.json(
        { success: false, message: "Invalid class selected." },
        { status: 400 }
      );
    }

    // Validate PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "PDF must be between 1 byte and 10 MB." },
        { status: 400 }
      );
    }

    // Validate actual PDF signature
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    const signature = new TextDecoder().decode(fileBytes.slice(0, 5));

    if (signature !== "%PDF-") {
      return NextResponse.json(
        { success: false, message: "Invalid PDF file." },
        { status: 400 }
      );
    }

    // Generate unique storage path
    const filePath = `${classLevel}/${crypto.randomUUID()}.pdf`;

    uploadedFilePath = filePath;

    // Upload PDF to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("study-materials")
      .upload(filePath, fileBytes, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("PDF upload error:", uploadError);

      return NextResponse.json(
        { success: false, message: "Failed to upload PDF." },
        { status: 500 }
      );
    }

    // Save PDF details in database
    const { data: material, error: insertError } = await supabase
      .from("study_materials")
      .insert({
        title,
        description: description || null,
        class_level: classLevel,
        subject,
        chapter: chapter || null,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: "application/pdf",
        is_published: false,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Study material insert error:", insertError);

      // Remove uploaded file if database insert fails
      await supabase.storage
        .from("study-materials")
        .remove([filePath]);

      uploadedFilePath = null;

      return NextResponse.json(
        { success: false, message: "Failed to save study material details." },
        { status: 500 }
      );
    }

    uploadedFilePath = null;

    return NextResponse.json(
      {
        success: true,
        message: "Study material uploaded successfully.",
        material,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Study material upload error:", error);

    // Cleanup uploaded file if an unexpected error occurs
    if (uploadedFilePath) {
      try {
        const supabase = createAdminClient();

        await supabase.storage
          .from("study-materials")
          .remove([uploadedFilePath]);
      } catch (cleanupError) {
        console.error("PDF cleanup error:", cleanupError);
      }
    }

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

// ============================================
// GET: Fetch Study Materials
// ============================================


export async function GET(request: NextRequest) {
  console.log("GET study materials API called");

  try {
    console.log("Checking admin authentication...");

    const { response } = await requireAdminApi();

    if (response) {
      console.log("Admin authentication failed:", response.status);
      return response;
    }

    console.log("Admin authentication successful");

    const supabase = createAdminClient();

    console.log("Supabase admin client created");

    const { searchParams } = new URL(request.url);

    const classLevel = searchParams.get("classLevel");
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");

    let query = supabase
      .from("study_materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (classLevel) {
      query = query.eq("class_level", classLevel);
    }

    if (subject) {
      query = query.eq("subject", subject);
    }

    if (search) {
      const safeSearch = search.replace(/[,%()]/g, "").trim();

      if (safeSearch) {
        query = query.or(
          `title.ilike.%${safeSearch}%,subject.ilike.%${safeSearch}%,chapter.ilike.%${safeSearch}%`
        );
      }
    }

    console.log("Executing study materials query...");

    const { data, error } = await query;

    if (error) {
      console.error("SUPABASE DATABASE ERROR:", JSON.stringify(error, null, 2));

      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch study materials.",
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log("Study materials fetched:", data?.length || 0);

    return NextResponse.json({
      success: true,
      total: data?.length || 0,
      materials: data || [],
    });
  } catch (error) {
    console.error("GET STUDY MATERIALS EXCEPTION:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

