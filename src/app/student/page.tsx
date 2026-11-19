
import { requireStudent } from "@/lib/auth/require-student";
import StudentDashboard from "@/components/student/StudentDashboard";

export default async function StudentDashboardPage() {
  await requireStudent();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <StudentDashboard />
      </div>
    </main>
  );
}
