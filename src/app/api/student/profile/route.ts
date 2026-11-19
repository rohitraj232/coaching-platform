
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Verify student account
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (
      profileError ||
      !profile ||
      profile.role !== "student" ||
      !profile.is_active
    ) {
      return NextResponse.json(
        { success: false, message: "Student account not found or inactive" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";

    // Validate full name
    if (!fullName || fullName.length < 2 || fullName.length > 80) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must be between 2 and 80 characters.",
        },
        { status: 400 }
      );
    }

    // Validate phone number
    if (!/^\+?[0-9\s()-]{7,20}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid phone number.",
        },
        { status: 400 }
      );
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("id, full_name, phone, class_level, updated_at")
      .single();

    if (updateError) {
      console.error("Student profile update error:", updateError);

      return NextResponse.json(
        { success: false, message: "Unable to update profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Student profile API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}