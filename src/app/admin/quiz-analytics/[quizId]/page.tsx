
import { requireAdmin } from "@/lib/auth/require-admin";
import QuizAnalyticsDetails from "@/components/admin/QuizAnalyticsDetails";

interface PageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export default async function QuizAnalyticsDetailsPage({
  params,
}: PageProps) {
  await requireAdmin();

  const { quizId } = await params;

  return (
    <div className="p-4 md:p-6">
      <QuizAnalyticsDetails quizId={quizId} />
    </div>
  );
}
