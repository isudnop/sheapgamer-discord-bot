"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFeed = exports.getImageFromEntry = void 0;
const rss_parser_1 = __importDefault(require("rss-parser"));
const parser = new rss_parser_1.default();
function getImageFromEntry(entry) {
    let imageUrl = null;
    if (entry.media &&
        entry.media.content &&
        Array.isArray(entry.media.content)) {
        for (const media of entry.media.content) {
            if (media.url && media.type && media.type.startsWith("image/")) {
                imageUrl = media.url;
                break;
            }
        }
    }
    if (!imageUrl &&
        entry.enclosure &&
        entry.enclosure.url &&
        entry.enclosure.type &&
        entry.enclosure.type.startsWith("image/")) {
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
exports.getImageFromEntry = getImageFromEntry;
async function parseFeed(url) {
    return parser.parseURL(url);
}
exports.parseFeed = parseFeed;
