
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import StudentAnalyticsDetails from "@/components/admin/StudentAnalyticsDetails";

interface PageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function StudentAnalyticsDetailPage({
  params,
}: PageProps) {
  await requireAdmin();

  const { studentId } = await params;

  return (
    <div className="space-y-6">
      <StudentAnalyticsDetails studentId={studentId} />
    </div>
  );
}
