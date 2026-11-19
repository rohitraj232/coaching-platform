
import { requireStudent } from "@/lib/auth/require-student";
import QuizReviewClient from "@/components/quiz/QuizReviewClient";

interface QuizReviewPageProps {
  params: Promise<{
    quizId: string;
    attemptId: string;
  }>;
}

export default async function QuizReviewPage({
  params,
}: QuizReviewPageProps) {
  await requireStudent();

  const { quizId, attemptId } = await params;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <QuizReviewClient
        quizId={quizId}
        attemptId={attemptId}
      />
    </main>
  );
}
