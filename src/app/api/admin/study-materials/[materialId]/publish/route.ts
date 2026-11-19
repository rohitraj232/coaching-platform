
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    materialId: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { response } = await requireAdminApi();

    if (response) return response;

    const { materialId } = await context.params;

    const { isPublished } = await request.json();

    if (
      typeof isPublished !== "boolean" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        materialId
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid request." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("study_materials")
      .update({
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", materialId)
      .select("id, is_published")
      .maybeSingle();

    if (error) {
      console.error("Publish status update error:", error);

      return NextResponse.json(
        { success: false, message: "Failed to update publish status." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Study material not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isPublished
        ? "Study material published successfully."
        : "Study material unpublished successfully.",
      material: data,
    });
  } catch (error) {
    console.error("Publish API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
