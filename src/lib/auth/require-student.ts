
import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireStudent() {
  const supabase = await createClient();

  // 1. Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch student profile and account status
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, class_level, is_active")
    .eq("id", user.id)
    .maybeSingle();

  // 3. Verify student role
  if (profileError || !profile || profile.role !== "student") {
    redirect("/");
  }

  // 4. Block deactivated students
  if (!profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=account_deactivated");
  }

  // 5. Return authenticated student
  return {
    user,
    profile,
  };
}
