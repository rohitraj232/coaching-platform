
import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireStudentApi() {
  const supabase = await createClient();

  // 1. Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      profile: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      ),
    };
  }

  // 2. Fetch student profile using admin client
  const adminClient = createAdminClient();

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("id, full_name, role, class_level, is_active")
    .eq("id", user.id)
    .maybeSingle();

  // 3. Verify student role
  if (profileError || !profile || profile.role !== "student") {
    return {
      user: null,
      profile: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Access denied. Student account required.",
        },
        { status: 403 }
      ),
    };
  }

  // 4. Verify active account
  if (!profile.is_active) {
    await supabase.auth.signOut();

    return {
      user: null,
      profile: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Your account has been deactivated.",
        },
        { status: 403 }
      ),
    };
  }

  // 5. Return authenticated student
  return {
    user,
    profile,
    response: null,
  };
}
