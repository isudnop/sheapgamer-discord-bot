import Parser from "rss-parser";

export type FeedEntry = {
  [key: string]: unknown;
  media?: { content?: { url?: string; type?: string }[] };
  enclosure?: { url?: string; type?: string };
  summary?: string;
  content?: string;
};

const parser = new Parser();

export function getImageFromEntry(entry: FeedEntry): string | null {
  // Try to get image from media.content
  const mediaImage = entry.media?.content?.find(
    (media) =>
      media.url &&
      media.type?.startsWith("image/") &&
      media.url.startsWith("http")
  )?.url;
  if (mediaImage) return mediaImage;

  // Try to get image from enclosure
  if (
    entry.enclosure?.url &&
    entry.enclosure?.type?.startsWith("image/") &&
    entry.enclosure.url.startsWith("http")
  ) {
    return entry.enclosure.url;
  }

  // Try to get image from HTML content
  if (entry.summary || entry.content) {
    const htmlContent = (entry.content || entry.summary) as string;
    const imgMatch = htmlContent.match(/<img[^>]+src="([^"]+)"/i);
    if (imgMatch && imgMatch[1] && imgMatch[1].startsWith("http")) {
      return imgMatch[1];
    }
  }

  return null;
}

export async function parseFeed(url: string) {
  return parser.parseURL(url);
}

