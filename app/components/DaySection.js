"use client";
import ExerciseCard from "./ExerciseCard";
import Modal from "./Modal";
import { useMemo, useState } from "react";

function slugify(title = "") {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const GROUPS = {
  Wednesday: "Chest & Triceps",
  Thursday: "Back & Biceps",
  Friday: "Shoulders",
  Saturday: "Full Body / Core",
  Sunday: "Legs",
};

export default function DaySection({
  day,
  items,
  status,
  weights,
  onToggle,
  onSave,
}) {
  const isRest = day === "Monday" || day === "Tuesday";
  const [celebrate, setCelebrate] = useState(false);

  // ✅ Count ALL items (warmup included)
  const counts = useMemo(() => {
    const total = items?.length || 0;
    const done = Object.values(status || {}).filter(Boolean).length;
    return { done, total };
  }, [items, status]);

  const handleToggle = async (idx, v) => {
    const next = { ...(status || {}) };
    next[idx] = v;
    const total = items?.length || 0;
    const done = Object.values(next).filter(Boolean).length;
    if (done >= total && total > 0) setCelebrate(true);
    await onToggle(day, idx, v);
  };

  return (
    <section className="scroll-mt-16">
      {/* Glassy section header */}
      <div className="relative rounded-3xl border border-slate-800/70 bg-slate-900/50 backdrop-blur shadow-xl p-4">
        <div className="pointer-events-none absolute top-0 left-0 h-px w-full bg-gradient-to-r from-emerald-500/40 via-sky-500/30 to-transparent" />

        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400/70" />
            <h2 className="text-base font-semibold text-white">{day}</h2>
            {GROUPS[day] && (
              <span className="text-[11px] px-2 py-1 rounded-full border border-slate-700/70 text-slate-300 bg-slate-900/50 backdrop-blur">
                {GROUPS[day]}
              </span>
            )}
          </div>

          {/* progress pill (includes warmup) */}
          {!isRest && (
            <div className="text-[11px] text-slate-300 flex items-center gap-2">
              <div className="h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400 transition-all"
                  style={{
                    width:
                      counts.total > 0
                        ? `${Math.min(
                            100,
                            Math.round((counts.done / counts.total) * 100)
                          )}%`
                        : "0%",
                  }}
                />
              </div>
              <span className="tabular-nums">
                {counts.done}/{counts.total}
              </span>
            </div>
          )}
        </header>

        <div className="mt-3 space-y-3">
          {isRest ? (
            <p className="text-sm text-slate-300/90 border border-slate-800/80 rounded-2xl p-4 bg-slate-900/50 backdrop-blur shadow-inner">
              Rest day 😌
            </p>
          ) : (
            (items || []).map((ex, i) => {
              const key = slugify(ex.title);
              const w = (weights && (weights[key] || weights[i])) || {
                Andy: "",
                Petronela: "",
              };
              return (
                <ExerciseCard
                  key={`${day}-${i}`}
                  day={day}
                  index={i}
                  exercise={ex}
                  completed={!!status[i]}
                  weights={w}
                  onToggle={(v) => handleToggle(i, v)}
                  onSave={(payload) => onSave(day, key, payload)}
                />
              );
            })
          )}
        </div>
      </div>

      {celebrate && (
        <Modal onClose={() => setCelebrate(false)} title={`${day} complete`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 grid place-items-center">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-300">
                  <path
                    fill="currentColor"
                    d="M9.55 17.05 4.5 12l1.4-1.4 3.65 3.6 8.1-8.1L19 7.5 9.55 17.05z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-200">
                  Everything for {day} is done.
                </p>
                <p className="text-xs text-slate-400">
                  Great pace—see you tomorrow.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCelebrate(false)}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 text-white py-2 text-sm font-medium"
            >
              Continue
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
