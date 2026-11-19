
export interface YouTubeVideoDetails {
  videoId: string;
  thumbnailUrl: string;
}

export function extractYouTubeVideoId(
  url: string
): string | null {
  try {
    const parsedUrl = new URL(url.trim());

    const hostname = parsedUrl.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    let videoId: string | null = null;

    // Standard YouTube URL
    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com"
    ) {
      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v");
      } else {
        const match = parsedUrl.pathname.match(
          /^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})\/?$/
        );

        videoId = match?.[1] ?? null;
      }
    }

    // Shortened YouTube URL
    else if (hostname === "youtu.be") {
      const match = parsedUrl.pathname.match(
        /^\/([a-zA-Z0-9_-]{11})\/?$/
      );

      videoId = match?.[1] ?? null;
    }

    // Validate final video ID
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return null;
    }

    return videoId;
  } catch {
    return null;
  }
}

export function getYouTubeThumbnail(
  videoId: string
): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeVideoDetails(
  url: string
): YouTubeVideoDetails | null {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return {
    videoId,
    thumbnailUrl: getYouTubeThumbnail(videoId),
  };
}