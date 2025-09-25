// app/api/audio/route.js
import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs"; // ensure FS access

const AUDIO_EXTS = [".mp3", ".m4a", ".aac", ".ogg", ".wav", ".flac", ".webm"];

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "audio");
    const files = await readdir(dir);

    const tracks = files
      .filter((f) => AUDIO_EXTS.some((ext) => f.toLowerCase().endsWith(ext)))
      .map((f) => {
        const url = "/audio/" + encodeURIComponent(f);
        const base = f.replace(/\.[^/.]+$/, "");
        const display =
          decodeURIComponent(base)
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim() || f;
        return { name: display, url, file: f };
      })
      .sort((a, b) =>
        a.file.localeCompare(b.file, undefined, { sensitivity: "base" })
      );

    return NextResponse.json({ tracks });
  } catch (e) {
    return NextResponse.json({ tracks: [], error: String(e) }, { status: 200 });
  }
}
