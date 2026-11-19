
import StudyMaterialUpload from "@/components/admin/StudyMaterialUpload";
import StudyMaterialsList from "@/components/admin/StudyMaterialsList";

export default function StudyMaterialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Study Materials
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload and manage PDF study materials for students.
        </p>
      </div>

      <StudyMaterialUpload />

      <StudyMaterialsList />
    </div>
  );
}
