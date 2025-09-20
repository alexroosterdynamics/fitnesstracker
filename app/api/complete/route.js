import { NextResponse } from "next/server";
import { getCol } from "@/lib/mongo";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { week, day, key, completed } = await req.json();
    if (!week || !day || key === undefined)
      return NextResponse.json({ ok: false }, { status: 400 });

    const col = await getCol();
    const path = `status.${week}.${day}.${key}`;
    await col.updateOne(
      { _id: "status" },
      { $set: { [path]: !!completed } },
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
