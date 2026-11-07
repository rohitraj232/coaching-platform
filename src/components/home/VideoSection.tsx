
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { videos } from "@/data/home";

export default function VideoSection() {
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
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-semibold text-blue-900"
          >
            Visit YouTube channel <ArrowRight size={18} />
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {videos.map((video) => (
            <article
              key={video.videoId}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Watch ${video.title} on YouTube`}
                className="group relative block aspect-video bg-slate-200"
              >
                {/* Replace placeholder IDs with real YouTube video IDs. */}
                <img
                  src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                  alt=""
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
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  {video.subject}
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  {video.title}
                </h3>
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-900"
                >
                  Watch lecture <ArrowRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
