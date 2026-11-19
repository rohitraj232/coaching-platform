
import StudentStudyMaterials from "@/components/student/StudentStudyMaterials";
import { requireStudent } from "@/lib/auth/require-student";

export const dynamic = "force-dynamic";

export default async function StudyMaterialsPage() {
    const { profile } = await requireStudent();

    return (
        <StudentStudyMaterials
            classLevel={profile.class_level}
        />
    );
}
