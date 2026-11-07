import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireStudent() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, class_level")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "student") {
    redirect("/");
  }

  return {
    user,
    profile,
  };
}