import { NextResponse } from "next/server";
import { getCol } from "@/lib/mongo";

export const dynamic = "force-dynamic"; // never prerender/cached

export async function GET() {
  try {
    const col = await getCol();
    const docs = await col
      .find({ _id: { $in: ["status", "weights"] } })
      .toArray();
    const status = docs.find((d) => d._id === "status")?.status || {};
    const weights = docs.find((d) => d._id === "weights")?.weights || {};
    return NextResponse.json({ status, weights });
  } catch (e) {
    return NextResponse.json(
      { status: {}, weights: {}, error: String(e?.message || e) },
      { status: 200 }
    );
  }
}
