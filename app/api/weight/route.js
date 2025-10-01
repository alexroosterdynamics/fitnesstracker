import { NextResponse } from "next/server";
import { getCol } from "@/lib/mongo";

export const dynamic = "force-dynamic";

/**
 * Save weights GLOBALLY (not per week).
 * Body: { day, key, weights: { Andy, Petronela } }
 * Mongo shape:
 *   _id: "weights"
 *   weights: {
 *     [day]: {
 *       [slug]: { Andy: "20", Petronela: "10" }
 *     }
 *   }
 */
export async function POST(req) {
  try {
    const { day, key, weights } = await req.json();
    if (!day || !key || !weights) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const clean = (v) => String(v ?? "").replace(/[^\d.]/g, "");
    const payload = {
      Andy: clean(weights.Andy),
      Petronela: clean(weights.Petronela),
    };

    const col = await getCol();
    // ⬇️ No week in the path anymore
    const path = `weights.${day}.${key}`;
    await col.updateOne(
      { _id: "weights" },
      { $set: { [path]: payload } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 200 }
    );
  }
}
