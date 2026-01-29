"use client";
import ExerciseCard from "./ExerciseCard";
import Modal from "./Modal";
import { useMemo, useState } from "react";

const slugify = (t = "") => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function DaySection({ day, items, status, weights, onToggle, onSave, openCard, setOpenCard }) {
  const [celebrate, setCelebrate] = useState(false);
  const isRest = day === "Monday" || day === "Tuesday";

  const counts = useMemo(() => {
    const total = items?.length || 0;
    const done = Object.values(status || {}).filter(Boolean).length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [items, status]);

  const handleToggle = async (idx, v) => {
    if (v && counts.done + 1 === counts.total) setCelebrate(true);
    await onToggle(day, idx, v);
  };

  return (
    <section className="group animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Modern header with gradient accent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl border border-slate-800/50 mb-3 shadow-xl">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Day indicator dot */}
              <div className="relative">
                <div className={`h-3 w-3 rounded-full ${isRest ? 'bg-amber-500' : counts.pct === 100 ? 'bg-emerald-500' : 'bg-sky-500'} shadow-lg`}>
                  <div className={`absolute inset-0 rounded-full ${isRest ? 'bg-amber-500' : counts.pct === 100 ? 'bg-emerald-500' : 'bg-sky-500'} animate-ping opacity-20`} />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {day}
                </h2>
                {isRest ? (
                  <p className="text-xs text-amber-400/80 font-medium mt-0.5">Rest & Recovery</p>
                ) : (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {counts.total} exercises
                  </p>
                )}
              </div>
            </div>

            {!isRest && (
              <div className="flex items-center gap-4">
                {/* Progress ring */}
                <div className="relative h-14 w-14">
                  <svg className="transform -rotate-90 h-14 w-14">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-slate-800"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 24}`}
                      strokeDashoffset={`${2 * Math.PI * 24 * (1 - counts.pct / 100)}`}
                      className={`transition-all duration-500 ${counts.pct === 100 ? 'text-emerald-400' : 'text-sky-400'}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{counts.pct}%</span>
                  </div>
                </div>

                {/* Stats badge */}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                    {counts.done}/{counts.total}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    Completed
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exercise cards container */}
      <div className="space-y-2">
        {isRest ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/20 to-slate-900/50 backdrop-blur-xl border border-amber-900/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,191,36,0.1),transparent)]" />
            <div className="relative px-6 py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-amber-100 mb-2">Recovery Day</h3>
              <p className="text-sm text-amber-200/60 max-w-xs mx-auto leading-relaxed">
                No scheduled training. Focus on rest, mobility, and muscle recovery.
              </p>
            </div>
          </div>
        ) : (
          items.map((ex, i) => (
            <ExerciseCard
              key={`${day}-${i}`}
              id={`${day}-${i}`}
              isOpen={openCard === `${day}-${i}`}
              setOpenCard={setOpenCard}
              index={i}
              exercise={ex}
              completed={!!status[i]}
              weights={weights?.[slugify(ex.title)] || weights?.[i] || { Andy: "", Petronela: "" }}
              onToggle={(v) => handleToggle(i, v)}
              onSave={(p) => onSave(day, slugify(ex.title), p)}
            />
          ))
        )}
      </div>

      {celebrate && (
        <Modal onClose={() => setCelebrate(false)} title="🎉 Session Complete">
          <div className="text-center py-6">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 mb-4">
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-300 text-base leading-relaxed">
                All sets for <span className="font-semibold text-emerald-400">{day}</span> are complete!
              </p>
              <p className="text-slate-500 text-sm mt-2">Excellent work and consistency.</p>
            </div>
            <button
              onClick={() => setCelebrate(false)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold text-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Continue Training
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}