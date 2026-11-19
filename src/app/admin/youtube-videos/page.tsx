
import { requireAdmin } from "@/lib/auth/require-admin";

import YouTubeVideoUpload from "@/components/admin/YouTubeVideoUpload";
import YouTubeVideosList from "@/components/admin/YouTubeVideosList";

export const dynamic = "force-dynamic";

export default async function YouTubeVideosPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            YouTube Video Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Add, view and manage YouTube lectures for your students.
          </p>
        </div>

        {/* Add Video Form */}
        <YouTubeVideoUpload />

        {/* Video List */}
        <YouTubeVideosList />

      </div>
    </main>
  );
}
