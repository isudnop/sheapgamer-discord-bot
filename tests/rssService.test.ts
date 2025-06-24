import { getImageFromEntry } from "@/services/rssService";
import {
  entryWithMediaContent,
  entryWithEnclosure,
  entryWithoutImage,
} from "./fixtures/rssEntries";

describe("getImageFromEntry", () => {
  it("returns image from media:content", () => {
    expect(getImageFromEntry(entryWithMediaContent)).toBe(
      "https://static.xx.fbcdn.net/rsrc.php/yz/r/KFyVIAWzntM.ico"
    );
  });

  it("returns image from enclosure", () => {
    expect(getImageFromEntry(entryWithEnclosure)).toBe(
      "https://static.xx.fbcdn.net/rsrc.php/yz/r/KFyVIAWzntM.ico"
    );
  });

  it("returns null if no image found", () => {
    expect(getImageFromEntry(entryWithoutImage)).toBeNull();
  });
});

describe("getImageFromEntry (realistic mocks)", () => {
  it("returns image from media:content (realistic)", () => {
    expect(getImageFromEntry(entryWithMediaContent)).toBe(
      "https://static.xx.fbcdn.net/rsrc.php/yz/r/KFyVIAWzntM.ico"
    );
  });

  it("returns image from enclosure (realistic)", () => {
    expect(getImageFromEntry(entryWithEnclosure)).toBe(
      "https://static.xx.fbcdn.net/rsrc.php/yz/r/KFyVIAWzntM.ico"
    );
  });

  it("returns null if no image found (realistic)", () => {
    expect(getImageFromEntry(entryWithoutImage)).toBeNull();
  });
});
