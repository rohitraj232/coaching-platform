
import type { ReactNode } from "react";
import { requireStudent } from "@/lib/auth/require-student";
import StudentLayout from "@/components/student/StudentLayout";

interface QuizLayoutProps {
  children: ReactNode;
}

export default async function QuizLayout({
  children,
}: QuizLayoutProps) {
  const { profile } = await requireStudent();

  return (
    <StudentLayout
      studentName={profile.full_name}
      classLevel={profile.class_level}
    >
      {children}
    </StudentLayout>
  );
}
