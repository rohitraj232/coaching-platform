
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/course";

export async function getCourses(): Promise<Course[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching courses:", error.message);
    return [];
  }

  return (data ?? []) as Course[];
}
