
import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireAdminApi() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      profile: null,
      response: NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      ),
    };
  }

  const adminClient = createAdminClient();

  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== "admin") {
    return {
      user: null,
      profile: null,
      response: NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    profile,
    response: null,
  };
}
