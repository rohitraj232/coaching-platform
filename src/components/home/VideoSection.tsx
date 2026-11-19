
import { ArrowRight, Play } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 60;

interface YouTubeVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_video_id: string;
  thumbnail_url: string | null;
  class_level: string;
  subject: string;
  chapter: string | null;
  created_at: string;
}

export default async function VideoSection() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("youtube_videos")
    .select(
      "id, title, description, youtube_url, youtube_video_id, thumbnail_url, class_level, subject, chapter, created_at"
    )
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Homepage YouTube videos error:", error);
  }

  const videos: YouTubeVideo[] = data ?? [];

  return (
    <section id="lectures" className="scroll-mt-24 bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-semibold text-orange-500">
              LEARN FROM OUR LECTURES
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">
              Learn visually.
              <span className="block text-blue-900">
                Practice confidently.
              </span>
            </h2>
          </div>

          <a
            href="https://www.youtube.com/@AccelerateAcademy2.0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold text-blue-900"
          >
            Visit YouTube channel <ArrowRight size={18} />
          </a>
        </div>

        {videos.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <a
                  href={video.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Watch ${video.title} on YouTube`}
                  className="group relative block aspect-video bg-slate-200"
                >
                  <img
                    src={
                      video.thumbnail_url ||
                      `https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`
                    }
                    alt={video.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />

                  <span className="absolute inset-0 flex items-center justify-center bg-slate-950/20 transition group-hover:bg-slate-950/40">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg">
                      <Play size={24} fill="currentColor" />
                    </span>
                  </span>
                </a>

                <div className="p-5">
                  {/* Class and Subject */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                      Class {video.class_level}
                    </span>

                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                      {video.subject}
                    </span>
                  </div>

                  {/* Video Title */}
                  <h3 className="mt-3 text-lg font-bold text-slate-900">
                    {video.title}
                  </h3>

                  {/* Chapter */}
                  {video.chapter && (
                    <p className="mt-2 text-sm text-slate-500">
                      Chapter: {video.chapter}
                    </p>
                  )}

                  {/* Description */}
                  {video.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {video.description}
                    </p>
                  )}

                  {/* Upload Date */}
                  <p className="mt-3 text-xs text-slate-400">
                    Uploaded on{" "}
                    {new Date(video.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  {/* YouTube Link */}
                  <a
                    href={video.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-900 hover:text-orange-600"
                  >
                    Watch lecture <ArrowRight size={16} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-800">
              No lectures available yet.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              New video lectures will appear here soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
