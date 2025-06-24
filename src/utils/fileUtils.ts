import fs from "fs/promises";
import path from "path";
import { GUID_FILE } from "../config";

export async function loadLastProcessedGuid(): Promise<string | null> {
  try {
    const data = await fs.readFile(
      path.resolve(process.cwd(), GUID_FILE),
      "utf8"
    );
    return JSON.parse(data).lastGuid;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return null;
    } else {
      throw error;
    }
  }
}

export async function saveLastProcessedGuid(guid: string): Promise<void> {
  await fs.writeFile(
    path.resolve(process.cwd(), GUID_FILE),
    JSON.stringify({ lastGuid: guid }),
    "utf8"
  );
}
