
import { requireStudent } from "@/lib/auth/require-student";
import StudentLayout from "@/components/student/StudentLayout";

interface StudentPortalLayoutProps {
  children: React.ReactNode;
}

export default async function StudentPortalLayout({
  children,
}: StudentPortalLayoutProps) {
  const { profile } = await requireStudent();

  return (
    <StudentLayout
      studentName={profile.full_name || "Student"}
      classLevel={profile.class_level || "-"}
    >
      {children}
    </StudentLayout>
  );
}
