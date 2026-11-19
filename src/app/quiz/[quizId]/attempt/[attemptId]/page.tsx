
import { requireStudent } from "@/lib/auth/require-student";
import QuizAttemptClient from "@/components/quiz/QuizAttemptClient";

interface QuizAttemptPageProps {
  params: Promise<{
    quizId: string;
    attemptId: string;
  }>;
}

export default async function QuizAttemptPage({
  params,
}: QuizAttemptPageProps) {
  await requireStudent();

  const { quizId, attemptId } = await params;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <QuizAttemptClient
        quizId={quizId}
        attemptId={attemptId}
      />
    </main>
  );
}
