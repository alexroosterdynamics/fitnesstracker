import { NextResponse } from "next/server";
import { getCol } from "@/lib/mongo";

export const dynamic = "force-dynamic"; // never prerender/cached

const DAYS = new Set([
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
]);

// Detect a key like "2025-W39"
function isWeekKey(k = "") {
  return /^\d{4}-W\d{1,2}$/.test(k);
}

// Sort week keys ascending by (year, week)
function sortWeekKeysAsc(keys = []) {
  return [...keys].sort((a, b) => {
    const [, ya, wa] = a.match(/^(\d{4})-W(\d{1,2})$/) || [];
    const [, yb, wb] = b.match(/^(\d{4})-W(\d{1,2})$/) || [];
    if (!ya || !yb) return a.localeCompare(b);
    const na = Number(ya) * 100 + Number(wa);
    const nb = Number(yb) * 100 + Number(wb);
    return na - nb;
  });
}

/**
 * Return:
 *  - status: unchanged (still per week)
 *  - weights: GLOBAL day/slug map
 *      If DB already holds global shape -> return as-is
 *      If DB still has old per-week shape -> collapse/merge latest-first
 */
export async function GET() {
  try {
    const col = await getCol();
    const docs = await col
      .find({ _id: { $in: ["status", "weights"] } })
      .toArray();

    const status = docs.find((d) => d._id === "status")?.status || {};
    const rawWeights = docs.find((d) => d._id === "weights")?.weights || {};

    let weights = {};

    // Case 1: Already global (days at top level)
    const topKeys = Object.keys(rawWeights || {});
    const looksGlobal = topKeys.some((k) => DAYS.has(k));

    if (looksGlobal) {
      weights = rawWeights || {};
    } else {
      // Case 2: Legacy per-week: collapse to global
      // Strategy: iterate weeks ascending and let later weeks override earlier ones
      const weekKeys = topKeys.filter(isWeekKey);
      if (weekKeys.length) {
        const ordered = sortWeekKeysAsc(weekKeys);
        const merged = {};
        for (const wk of ordered) {
          const byDay = rawWeights[wk] || {};
          for (const day of Object.keys(byDay)) {
            merged[day] = {
              ...(merged[day] || {}),
              ...(byDay[day] || {}),
            };
          }
        }
        weights = merged;
      } else {
        // Fallback: nothing recognizable -> keep empty object
        weights = {};
      }
    }

    return NextResponse.json({ status, weights });
  } catch (e) {
    return NextResponse.json(
      { status: {}, weights: {}, error: String(e?.message || e) },
      { status: 200 }
    );
  }
}
