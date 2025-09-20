"use client";
import { useEffect, useMemo, useState } from "react";
import DaySection from "@/components/DaySection";
import Splash from "@/components/Splash";
import data from "@/data/exercises.json";

// ISO week number (1-53) + year
function getWeekInfo(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((date - firstThursday) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7
    );
  const year = date.getUTCFullYear();
  return { year, week, key: `${year}-W${week}` };
}

const ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Page() {
  const [state, setState] = useState({ weights: {}, status: {} });
  const [showSplash, setShowSplash] = useState(true); // 👈 splash flag
  const { key: weekKey, week } = useMemo(() => getWeekInfo(), []);
  const days = useMemo(
    () => ORDER.map((d) => ({ name: d, items: data[d] || [] })),
    []
  );

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1600); // fade after 1.6s
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        const s = await res.json();
        setState({ weights: s.weights || {}, status: s.status || {} });
      } catch {}
    })();
  }, []);

  const updateStatus = async (day, idx, completed) => {
    setState((s) => ({
      ...s,
      status: {
        ...s.status,
        [weekKey]: {
          ...(s.status[weekKey] || {}),
          [day]: {
            ...((s.status[weekKey] || {})[day] || {}),
            [idx]: completed,
          },
        },
      },
    }));
    await fetch("/api/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week: weekKey, day, key: idx, completed }),
    });
  };

  const saveWeights = async (day, slug, weights) => {
    setState((s) => ({
      ...s,
      weights: {
        ...s.weights,
        [weekKey]: {
          ...(s.weights[weekKey] || {}),
          [day]: {
            ...((s.weights[weekKey] || {})[day] || {}),
            [slug]: weights,
          },
        },
      },
    }));
    await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week: weekKey, day, key: slug, weights }),
    });
  };

  const weekStatus = state.status[weekKey] || {};
  const weekWeights = state.weights[weekKey] || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      {/* 🔥 Cool splash */}
      <Splash show={showSplash} />

      <main className="max-w-md mx-auto p-3 pb-20 space-y-6">
        <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur px-3 py-3 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            🏋️ Andy &amp; Petronela
          </h1>
          <p className="text-xs text-slate-400">Week W{week}</p>
        </header>

        {days.map(({ name, items }) => (
          <DaySection
            key={name}
            day={name}
            items={items}
            status={weekStatus[name] || {}}
            weights={weekWeights[name] || {}}
            onToggle={updateStatus}
            onSave={saveWeights}
          />
        ))}
      </main>
    </div>
  );
}
