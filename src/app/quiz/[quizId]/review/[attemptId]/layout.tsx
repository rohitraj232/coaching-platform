import type { ReactNode } from "react";
import { requireStudent } from "@/lib/auth/require-student";
import StudentLayout from "@/components/student/StudentLayout";

interface ReviewLayoutProps {
  children: ReactNode;
}

export default async function ReviewLayout({
  children,
}: ReviewLayoutProps) {
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