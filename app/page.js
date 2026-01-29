"use client";
import { useEffect, useMemo, useState } from "react";
import DaySection from "@/components/DaySection";
import Splash from "@/components/Splash";
import AudioPlayer from "@/components/AudioPlayer";
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

const ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function Page() {
  const [state, setState] = useState({ weights: {}, status: {} });
  const [showSplash, setShowSplash] = useState(true);
  const [openCard, setOpenCard] = useState(null);
  const { key: weekKey, week, year } = useMemo(() => getWeekInfo(), []);
  const days = useMemo(() => ORDER.map((d) => ({ name: d, items: data[d] || [] })), []);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const weekStatus = state.status[weekKey] || {};
    let totalExercises = 0;
    let completedExercises = 0;
    
    days.forEach(({ name, items }) => {
      if (name !== "Monday" && name !== "Tuesday") {
        totalExercises += items.length;
        const dayStatus = weekStatus[name] || {};
        completedExercises += Object.values(dayStatus).filter(Boolean).length;
      }
    });

    return {
      total: totalExercises,
      completed: completedExercises,
      percentage: totalExercises ? Math.round((completedExercises / totalExercises) * 100) : 0
    };
  }, [state.status, weekKey, days]);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1500);
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
          [day]: { ...((s.status[weekKey] || {})[day] || {}), [idx]: completed }
        }
      }
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
        ...(s.weights || {}),
        [day]: {
          ...((s.weights || {})[day] || {}),
          [slug]: weights,
        },
      },
    }));
    await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, key: slug, weights }),
    });
  };

  const weekStatus = state.status[weekKey] || {};
  const globalWeights = state.weights || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      <Splash show={showSplash} />

      {/* Modern Header with Glass Morphism */}
      <header className="sticky top-0 z-30 border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              {/* App Icon */}
              <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 p-[2px] shadow-lg shadow-emerald-500/20">
                <div className="h-full w-full rounded-[10px] bg-slate-900 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" aria-hidden="true">
                    <path fill="currentColor" d="M4 9h2v6H4V9zm14 0h2v6h-2V9zM8 11h8v2H8v-2zM6 7h2v10H6V7zm10 0h2v10h-2V7z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-sky-400 bg-clip-text text-transparent">
                  Andy & Petronela
                </h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Fitness Tracker
                </p>
              </div>
            </div>

            {/* Week Info Card */}
            <div className="flex items-center gap-3">
              {/* Progress Ring */}
              <div className="relative h-12 w-12">
                <svg className="transform -rotate-90 h-12 w-12">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-slate-800"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - overallProgress.percentage / 100)}`}
                    className={`transition-all duration-500 ${
                      overallProgress.percentage === 100 
                        ? 'text-emerald-400' 
                        : overallProgress.percentage > 50 
                        ? 'text-sky-400' 
                        : 'text-slate-600'
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {overallProgress.percentage}%
                  </span>
                </div>
              </div>

              {/* Week Badge */}
              <div className="text-right">
                <div className="text-xs font-bold text-slate-200">
                  Week {week}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {year}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${overallProgress.percentage}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 min-w-[60px] text-right">
              {overallProgress.completed}/{overallProgress.total}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6">
        {days.map(({ name, items }) => (
          <DaySection
            key={name}
            day={name}
            items={items}
            status={weekStatus[name] || {}}
            weights={globalWeights[name] || {}}
            onToggle={updateStatus}
            onSave={saveWeights}
            openCard={openCard}
            setOpenCard={setOpenCard}
          />
        ))}
      </main>

      <AudioPlayer />
    </div>
  );
}