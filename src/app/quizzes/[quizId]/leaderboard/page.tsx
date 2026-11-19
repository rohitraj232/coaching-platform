
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth/require-student";
import { createAdminClient } from "@/lib/supabase/admin";
import LeaderboardClient from "@/components/quiz/LeaderboardClient";

interface LeaderboardPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export default async function LeaderboardPage({
  params,
}: LeaderboardPageProps) {
  await requireStudent();

  const { quizId } = await params;
  const supabase = createAdminClient();

  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select("id")
    .eq("id", quizId)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !quiz) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <LeaderboardClient quizId={quizId} />
    </main>
  );
}
