import CreateQuizForm from "@/components/admin/CreateQuizForm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function CreateQuizPage() {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, class_level")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Unable to load courses: ${error.message}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Create New Quiz
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter the quiz details. You can upload questions and publish it in
            the next steps.
          </p>
        </div>

        <CreateQuizForm courses={courses ?? []} />
      </div>
    </main>
  );
}