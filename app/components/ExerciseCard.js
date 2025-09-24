"use client";
import { useEffect, useRef, useState, useMemo } from "react";
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
          : "bg-slate-800/80 border-slate-700 hover:border-slate-600",
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

  // --- Fullscreen state/refs ---
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Mute state ---
  const [isMuted, setIsMuted] = useState(true); // Start muted by default

  useEffect(() => {
    setLocal(weights || { Andy: "", Petronela: "" });
  }, [weights]);

  const sanitize = (v) => String(v ?? "").replace(/[^\d.]/g, "");
  const num = (v) => (v === "" || v == null ? 0 : parseFloat(v));
  const src = `/videos/${(exercise.video || exercise.title).trim()}.mp4`;

  const chips = useMemo(() => {
    const a = weights?.Andy ? `${weights.Andy}kg` : "—";
    const p = weights?.Petronela ? `${weights.Petronela}kg` : "—";
    return { a, p };
  }, [weights]);

  const save = async () => {
    const prevA = num(weights.Andy);
    const prevP = num(weights.Petronela);
    const nextA = num(sanitize(local.Andy));
    const nextP = num(sanitize(local.Petronela));
    const ups = [];
    if (nextA > prevA) ups.push(`Andy +${(nextA - prevA).toFixed(0)} kg`);
    if (nextP > prevP) ups.push(`Petronela +${(nextP - prevP).toFixed(0)} kg`);

    setSaved(false);
    await onSave({
      Andy: sanitize(local.Andy),
      Petronela: sanitize(local.Petronela),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
    if (ups.length) setGrowthMsg(ups.join("\n"));
  };

  // --- Toggle mute function ---
  const toggleMute = (e) => {
    e.stopPropagation(); // Prevent other click handlers
    const vid = videoRef.current;
    if (vid) {
      vid.muted = !vid.muted;
      setIsMuted(vid.muted);
    }
  };

  // --- Sync muted state with video element ---
  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.muted = isMuted;
    }
  }, [isMuted]);

  // --- Fullscreen helpers (desktop + iOS/Android) ---
  const enterFullscreen = async () => {
    const vid = videoRef.current;
    const box = containerRef.current;
    if (!vid) return;

    try {
      // iOS Safari prefers video.webkitEnterFullscreen()
      if (typeof vid.webkitEnterFullscreen === "function") {
        vid.webkitEnterFullscreen();
        setIsFullscreen(true);
        return;
      }
      // Standard Fullscreen API (prefer container so overlay button hides)
      if (box?.requestFullscreen) {
        await box.requestFullscreen({ navigationUI: "hide" });
        setIsFullscreen(true);
        return;
      }
      if (vid.requestFullscreen) {
        await vid.requestFullscreen();
        setIsFullscreen(true);
        return;
      }
    } catch (e) {
      console.error("Fullscreen error:", e);
    }
  };

  const exitFullscreen = async () => {
    const vid = videoRef.current;
    // iOS Safari
    if (
      vid &&
      typeof vid.webkitExitFullscreen === "function" &&
      vid.webkitDisplayingFullscreen
    ) {
      try {
        vid.webkitExitFullscreen();
      } catch {}
      setIsFullscreen(false);
      return;
    }
    // Standard
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {}
      setIsFullscreen(false);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen || document.fullscreenElement) exitFullscreen();
    else enterFullscreen();
  };

  // Track fullscreen changes (standard + iOS webkit events)
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    const vid = videoRef.current;
    const onWebkitBegin = () => setIsFullscreen(true);
    const onWebkitEnd = () => setIsFullscreen(false);
    if (vid) {
      vid.addEventListener("webkitbeginfullscreen", onWebkitBegin);
      vid.addEventListener("webkitendfullscreen", onWebkitEnd);
    }
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      if (vid) {
        vid.removeEventListener("webkitbeginfullscreen", onWebkitBegin);
        vid.removeEventListener("webkitendfullscreen", onWebkitEnd);
      }
    };
  }, []);

  // Apply different styles based on fullscreen state
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isFullscreen) {
      // In fullscreen, make video fill the entire screen
      vid.style.width = "100vw";
      vid.style.height = "100vh";
      vid.style.objectFit = "contain"; // or 'cover' if you want to fill completely
      vid.style.position = "fixed";
      vid.style.top = "0";
      vid.style.left = "0";
      vid.style.zIndex = "9999";
    } else {
      // Reset to normal styles when exiting fullscreen
      vid.style.width = "";
      vid.style.height = "";
      vid.style.objectFit = "";
      vid.style.position = "";
      vid.style.top = "";
      vid.style.left = "";
      vid.style.zIndex = "";
    }
  }, [isFullscreen]);

  // Gradient shell for glass border
  const shell = completed
    ? "from-emerald-600/50 via-emerald-500/25 to-sky-500/25"
    : "from-slate-700/60 via-emerald-600/25 to-sky-600/25";

  return (
    <div className={["rounded-2xl p-[1px] bg-gradient-to-r", shell].join(" ")}>
      <article
        className={[
          "rounded-[1rem] border border-slate-800/70 bg-slate-900/60 backdrop-blur shadow-lg transition-transform",
          "hover:-translate-y-[1px] active:translate-y-0",
        ].join(" ")}
      >
        {/* Collapsed header */}
        <header className="flex items-center gap-3 px-4 py-3">
          <Check checked={completed} onChange={(v) => onToggle(v)} />

          <button
            onClick={() => setOpen((o) => !o)}
            className="flex-1 text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-300 bg-slate-900/60">
                {index === 0 ? "Warmup" : `#${index}`}
              </span>
              <h3 className="text-[15px] font-semibold leading-tight text-white">
                {exercise.title}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Tap to {open ? "collapse" : "expand"}
            </p>
          </button>

          <div className="flex items-center gap-2">
            <span
              className={[
                "text-[10px] px-2 py-1 rounded-full border",
                completed
                  ? "border-emerald-500 text-emerald-300"
                  : "border-slate-700 text-slate-400",
              ].join(" ")}
            >
              {completed ? "Done" : "Pending"}
            </span>
            <svg
              viewBox="0 0 24 24"
              className={[
                "h-4 w-4 text-slate-400 transition-transform duration-300 ease-in-out",
                open ? "rotate-180" : "rotate-0",
              ].join(" ")}
            >
              <path
                fill="currentColor"
                d="M7.41 8.58 12 13.17l4.59-4.59L18 10l-6 6-6-6z"
              />
            </svg>
          </div>
        </header>

        {/* Expanded body */}
        <div
          className={[
            "grid transition-all duration-300 ease-in-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4">
              <p className="text-sm text-slate-300">{exercise.description}</p>

              {/* Inputs */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Andy (kg)</span>
                  <input
                    inputMode="decimal"
                    className="w-full rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder:text-slate-600"
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
                    className="w-full rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder:text-slate-600"
                    value={local.Petronela}
                    onChange={(e) =>
                      setLocal((s) => ({ ...s, Petronela: e.target.value }))
                    }
                    placeholder="—"
                  />
                </label>
              </div>

              {/* Save */}
              <button
                onClick={save}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 text-white py-2 text-sm font-medium active:scale-[.99] transition"
              >
                {saved ? "Saved ✓" : "Save"}
              </button>

              {/* Media with fullscreen control */}
              <div
                ref={containerRef}
                className="relative overflow-hidden rounded-2xl border border-slate-800"
              >
                <video
                  ref={videoRef}
                  src={src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onClick={toggleMute}
                  className="w-full h-48 object-cover bg-black cursor-pointer"
                />

                {/* Mute indicator */}
                <div
                  className={[
                    "absolute left-2 top-2 rounded-lg border border-slate-700/70 bg-slate-900/70 backdrop-blur px-2 py-1 transition-opacity duration-300",
                    isMuted ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-200">
                    <path
                      fill="currentColor"
                      d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                    />
                  </svg>
                </div>

                {/* Fullscreen toggle button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="absolute right-2 top-2 rounded-lg border border-slate-700/70 bg-slate-900/70 backdrop-blur px-2 py-1 text-[11px] text-slate-200 hover:border-slate-600 active:scale-95 transition"
                  aria-label={
                    isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                  }
                >
                  {isFullscreen ? (
                    // exit icon
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M7 14H5v5h5v-2H7v-3zm12 5h-5v-2h3v-3h2v5zM7 7h3V5H5v5h2V7zm12 3h-2V5h-5v2h3v3h4z"
                      />
                    </svg>
                  ) : (
                    // enter icon
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M7 14H5v5h5v-2H7v-3zm12-9h-5v2h3v3h2V5zM7 7h3V5H5v5h2V7zm12 12h-3v2h5v-5h-2v3z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {growthMsg && (
        <Modal title="Progress updated" onClose={() => setGrowthMsg("")}>
          <p className="whitespace-pre-line text-sm text-slate-200 mb-4">
            {growthMsg}
          </p>
          <button
            onClick={() => setGrowthMsg("")}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 text-white py-2 text-sm font-medium"
          >
            Continue
          </button>
        </Modal>
      )}
    </div>
  );
}
