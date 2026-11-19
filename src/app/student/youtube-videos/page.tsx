
import StudentYouTubeVideos from "@/components/student/StudentYouTubeVideos";
import { requireStudent } from "@/lib/auth/require-student";

export default async function StudentYouTubeVideosPage() {
  const { profile } = await requireStudent();

  return (
    <StudentYouTubeVideos
      classLevel={profile.class_level}
    />
  );
}
