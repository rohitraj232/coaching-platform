
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth/require-student";
import QuizResultClient from "@/components/quiz/QuizResultClient";

interface QuizResultPageProps {
  params: Promise<{
    quizId: string;
    attemptId: string;
  }>;
}

export default async function QuizResultPage({
  params,
}: QuizResultPageProps) {
  await requireStudent();

  const { quizId, attemptId } = await params;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <QuizResultClient
        quizId={quizId}
        attemptId={attemptId}
      />
    </main>
  );
}
