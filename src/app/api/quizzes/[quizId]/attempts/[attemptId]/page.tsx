import { requireStudent } from "@/lib/auth/require-student";
import QuizAttemptClient from "@/components/quiz/QuizAttemptClient";

type PageProps = {
  params: Promise<{
    quizId: string;
    attemptId: string;
  }>;
};

export default async function QuizAttemptPage({
  params,
}: PageProps) {
  await requireStudent();

  const { quizId, attemptId } = await params;

  return (
    <QuizAttemptClient
      quizId={quizId}
      attemptId={attemptId}
    />
  );
}