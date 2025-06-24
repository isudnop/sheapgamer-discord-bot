import Parser from "rss-parser";

const parser = new Parser();

export function getImageFromEntry(entry: any): string | null {
  let imageUrl: string | null = null;
  if (
    entry.media &&
    entry.media.content &&
    Array.isArray(entry.media.content)
  ) {
    for (const media of entry.media.content) {
      if (media.url && media.type && media.type.startsWith("image/")) {
        imageUrl = media.url;
        break;
      }
    }
  }
  if (
    !imageUrl &&
    entry.enclosure &&
    entry.enclosure.url &&
    entry.enclosure.type &&
    entry.enclosure.type.startsWith("image/")
  ) {
    imageUrl = entry.enclosure.url;
  }
  if (!imageUrl && (entry.summary || entry.content)) {
    const htmlContent = entry.content || entry.summary;
    const imgMatch = htmlContent.match(/<img[^>]+src="([^"]+)"/i);
    if (imgMatch && imgMatch[1]) {
      imageUrl = imgMatch[1];
    }
  }
  if (imageUrl && !imageUrl.startsWith("http")) {
    imageUrl = null;
  }
  return imageUrl;
}

export async function parseFeed(url: string) {
  return parser.parseURL(url);
}
