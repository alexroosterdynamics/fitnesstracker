"use client";
import { useEffect, useState } from "react";
import Modal from "./Modal";

function Check({ checked, onChange }) {
  const toggle = () => onChange(!checked);
  const onKey = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  };
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={toggle}
      onKeyDown={onKey}
      className={[
        "h-5 w-5 rounded-md border transition-all duration-200 ease-in-out",
        checked
          ? "bg-emerald-600 border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)] scale-95"
          : "bg-slate-800 border-slate-700 hover:border-slate-600",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        className={[
          "mx-auto h-3 w-3 text-white transition-transform duration-200 ease-in-out",
          checked ? "scale-100" : "scale-0",
        ].join(" ")}
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M20.285 6.709a1 1 0 0 0-1.414-1.418l-8.5 8.51-3.242-3.243a1 1 0 1 0-1.415 1.414l3.95 3.95a1 1 0 0 0 1.415 0l9.206-9.213z"
        />
      </svg>
    </button>
  );
}

export default function ExerciseCard({
  day,
  index,
  exercise,
  completed,
  weights,
  onToggle,
  onSave,
}) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(weights);
  const [saved, setSaved] = useState(false);
  const [growthMsg, setGrowthMsg] = useState("");

  useEffect(() => {
    setLocal(weights || { Andy: "", Petronela: "" });
  }, [weights]);

  const sanitize = (v) => String(v ?? "").replace(/[^\d.]/g, "");
  const num = (v) => (v === "" || v == null ? 0 : parseFloat(v));
  const src = `/videos/${(exercise.video || exercise.title).trim()}.mp4`;

  const save = async () => {
    const prevA = num(weights.Andy);
    const prevP = num(weights.Petronela);
    const nextA = num(sanitize(local.Andy));
    const nextP = num(sanitize(local.Petronela));

    const ups = [];
    if (nextA > prevA)
      ups.push(`Nice Andy! +${(nextA - prevA).toFixed(0)} kg 💪`);
    if (nextP > prevP)
      ups.push(`Nice Petronela! +${(nextP - prevP).toFixed(0)} kg 💪`);

    setSaved(false);
    await onSave({
      Andy: sanitize(local.Andy),
      Petronela: sanitize(local.Petronela),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);

    if (ups.length) setGrowthMsg(ups.join("\n"));
  };

  return (
    <article
      className={[
        "rounded-2xl border px-4 py-3 shadow-lg",
        "bg-slate-900/80",
        completed ? "border-emerald-600/40" : "border-slate-800",
      ].join(" ")}
    >
      <header className="flex items-center gap-3">
        <Check checked={completed} onChange={(v) => onToggle(v)} />

        <button onClick={() => setOpen((o) => !o)} className="flex-1 text-left">
          <h3 className="text-base font-semibold leading-tight text-white">
            {exercise.title}
          </h3>
          <p className="text-[11px] text-slate-400">
            Tap to {open ? "collapse" : "expand"}
          </p>
        </button>

        <span
          className={[
            "text-[10px] px-2 py-1 rounded-full border",
            completed
              ? "border-emerald-500 text-emerald-400"
              : "border-slate-700 text-slate-400",
          ].join(" ")}
        >
          {completed ? "Done" : "Pending"}
        </span>
      </header>

      {/* Smooth expand/collapse */}
      <div
        className={[
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="mt-3 space-y-3">
            <p className="text-sm text-slate-300">{exercise.description}</p>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Andy (kg)</span>
                <input
                  inputMode="decimal"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder:text-slate-600"
                  value={local.Andy}
                  onChange={(e) =>
                    setLocal((s) => ({ ...s, Andy: e.target.value }))
                  }
                  placeholder="—"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Petronela (kg)</span>
                <input
                  inputMode="decimal"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder:text-slate-600"
                  value={local.Petronela}
                  onChange={(e) =>
                    setLocal((s) => ({ ...s, Petronela: e.target.value }))
                  }
                  placeholder="—"
                />
              </label>
            </div>

            <button
              onClick={save}
              className="w-full rounded-xl bg-emerald-600 text-white py-2 text-sm font-medium active:scale-[.99] transition"
            >
              {saved ? "Saved ✓" : "Save"}
            </button>

            <div className="overflow-hidden rounded-xl border border-slate-800">
              <video
                src={src}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-48 object-cover bg-black"
              />
            </div>
          </div>
        </div>
      </div>

      {growthMsg && (
        <Modal title="Getting stronger!" onClose={() => setGrowthMsg("")}>
          <p className="whitespace-pre-line text-sm text-slate-200 mb-4">
            {growthMsg}
          </p>
          <button
            onClick={() => setGrowthMsg("")}
            className="w-full rounded-xl bg-emerald-600 text-white py-2 text-sm font-medium"
          >
            Continue
          </button>
        </Modal>
      )}
    </article>
  );
}
