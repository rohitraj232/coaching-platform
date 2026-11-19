
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    redirect("/login");
  }

  // Admin redirect
  if (profile.role === "admin") {
    redirect("/admin");
  }

  // Student redirect
  if (profile.role === "student") {
    if (!profile.is_active) {
      await supabase.auth.signOut();
      redirect("/login?error=account_deactivated");
    }

    redirect("/student");
  }

  redirect("/login");
}
