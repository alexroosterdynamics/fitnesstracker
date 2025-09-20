import { NextResponse } from "next/server";
import { getCol } from "@/lib/mongo";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { week, day, key, weights } = await req.json();
    if (!week || !day || !key || !weights)
      return NextResponse.json({ ok: false }, { status: 400 });

    const clean = (v) => String(v ?? "").replace(/[^\d.]/g, "");
    const payload = {
      Andy: clean(weights.Andy),
      Petronela: clean(weights.Petronela),
    };

    const col = await getCol();
    const path = `weights.${week}.${day}.${key}`;
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
