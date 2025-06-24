import Parser from "rss-parser";

/**
 * Represents a generic RSS feed entry, supporting common media and enclosure fields.
 */
export type FeedEntry = {
  [key: string]: unknown;
  media?: { content?: { url?: string; type?: string }[] };
  enclosure?: { url?: string; type?: string };
  summary?: string;
  content?: string;
};

const parser = new Parser();

/**
 * Attempts to extract an image URL from a feed entry.
 * Checks media content, enclosure, and HTML content fields.
 * @param entry The feed entry to extract the image from.
 * @returns The image URL if found, otherwise null.
 */
export function getImageFromEntry(entry: FeedEntry): string | null {
  // Check media:content for image
  const mediaImage = entry.media?.content?.find(
    (media) =>
      media.url &&
      media.type?.startsWith("image/") &&
      media.url.startsWith("http")
  )?.url;
  if (mediaImage) return mediaImage;

  // Check enclosure for image
  if (
    entry.enclosure?.url &&
    entry.enclosure?.type?.startsWith("image/") &&
    entry.enclosure.url.startsWith("http")
  ) {
    return entry.enclosure.url;
  }

  // Check HTML content for <img src="...">
  const htmlContent = (entry.content || entry.summary) as string | undefined;
  if (htmlContent) {
    // More robust regex for src attribute
    const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"'>]+)["']/i);
    if (imgMatch && imgMatch[1] && imgMatch[1].startsWith("http")) {
      return imgMatch[1];
    }
  }

  // No image found
  return null;
}

/**
 * Parses an RSS feed from the given URL.
 * @param url The RSS feed URL.
 * @returns The parsed feed object.
 */
export async function parseFeed(url: string) {
  return parser.parseURL(url);
}

