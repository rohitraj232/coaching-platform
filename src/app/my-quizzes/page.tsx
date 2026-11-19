
import { requireStudent } from "@/lib/auth/require-student";
import StudentLayout from "@/components/student/StudentLayout";
import QuizHistoryClient from "@/components/quiz/QuizHistoryClient";

export default async function MyQuizzesPage() {
  const { profile } = await requireStudent();

  return (
    <StudentLayout
      studentName={profile.full_name || "Student"}
      classLevel={profile.class_level || "-"}
    >
      <main className="min-h-screen bg-slate-50">
        <QuizHistoryClient />
      </main>
    </StudentLayout>
  );
}
