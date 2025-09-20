"use client";
import ExerciseCard from "./ExerciseCard";
import Modal from "./Modal";
import ConfettiCanvas from "./ConfettiCanvas";
import { useState } from "react";

function slugify(title = "") {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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

  const handleToggle = async (idx, v) => {
    // optimistic toggle + check completion (local)
    const next = { ...(status || {}) };
    next[idx] = v;
    const total = (items || []).slice(0, 5).length || 0;
    const done = Object.values(next).filter(Boolean).length;
    if (done >= total && total > 0) setCelebrate(true);
    await onToggle(day, idx, v);
  };

  return (
    <section className="scroll-mt-16">
      <h2 className="text-lg font-semibold mb-2 text-white flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
        {day}
      </h2>

      {isRest ? (
        <p className="text-sm text-slate-400 border border-slate-800 rounded-2xl p-4 bg-slate-900/60 shadow-sm">
          Rest day 😌
        </p>
      ) : (
        <div className="space-y-3">
          {(items || []).slice(0, 5).map((ex, i) => {
            const key = slugify(ex.title);
            const w = (weights && (weights[key] || weights[i])) || {
              Andy: "",
              Petronela: "",
            };

            return (
              <ExerciseCard
                key={`${day}-${i}`}
                day={day}
                index={i} // completion stays index-based
                exercise={ex}
                completed={!!status[i]}
                weights={w}
                onToggle={(v) => handleToggle(i, v)}
                onSave={(payload) => onSave(day, key, payload)} // weights saved by slug
              />
            );
          })}
        </div>
      )}

      {celebrate && (
        <Modal
          onClose={() => setCelebrate(false)}
          title={`${day} completed! 🎉`}
        >
          <div className="relative">
            <ConfettiCanvas />
            <p className="text-sm text-slate-300 mb-4">
              Awesome work—every exercise for {day} is done. Keep the streak
              going!
            </p>
            <button
              onClick={() => setCelebrate(false)}
              className="w-full rounded-xl bg-emerald-600 text-white py-2 text-sm font-medium"
            >
              Continue
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
