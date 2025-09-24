"use client";
import { useEffect, useRef, useState } from "react";

export default function AudioPlayer({ src = "/audio/fitness-mix.mp3" }) {
  const audioRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState({ cur: 0, dur: 0 }); // seconds

  // Keep a single <audio> element alive
  useEffect(() => {
    const el = new Audio(src);
    el.preload = "metadata";
    el.loop = true; // remove if you don't want looping
    audioRef.current = el;

    const onLoaded = () => setT((s) => ({ ...s, dur: el.duration || 0 }));
    const onTime = () =>
      setT({ cur: el.currentTime || 0, dur: el.duration || 0 });
    const onEnd = () => setPlaying(false);

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnd);
    setReady(true);

    // Media Session (lock screen controls on mobile)
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: "Fitness Mix",
        artist: "You",
        album: "Workout",
      });
      navigator.mediaSession.setActionHandler?.("play", () => {
        play();
      });
      navigator.mediaSession.setActionHandler?.("pause", () => {
        pause();
      });
      navigator.mediaSession.setActionHandler?.("seekto", (d) => {
        if (el && typeof d.seekTime === "number") el.currentTime = d.seekTime;
      });
    }

    return () => {
      el.pause();
      el.src = "";
      el.load();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const play = async () => {
    try {
      await audioRef.current?.play();
      setPlaying(true);
    } catch (err) {
      // Autoplay blocked until user interacts; pressing button counts as interaction.
      console.error(err);
    }
  };
  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const toggle = () => (playing ? pause() : play());

  const onScrub = (e) => {
    const val = Number(e.target.value);
    if (!audioRef.current) return;
    audioRef.current.currentTime = val;
    setT((s) => ({ ...s, cur: val }));
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="fixed right-3 bottom-3 z-40">
      {/* Mini player card */}
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 backdrop-blur px-3 py-2 shadow-xl w-72">
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            disabled={!ready}
            className={[
              "h-10 w-10 rounded-full border flex items-center justify-center",
              "border-slate-700 bg-slate-800/70 active:scale-95 transition",
              ready ? "text-white" : "text-slate-500",
            ].join(" ")}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="currentColor" d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex-1">
            <div className="text-xs text-slate-300">Fitness Mix</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={t.dur || 0}
                step="1"
                value={t.cur}
                onChange={onScrub}
                className="w-full accent-emerald-500"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{fmt(t.cur)}</span>
              <span>{fmt(t.dur || 0)}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Note: audio element is created via JS so it never unmounts while page updates */}
    </div>
  );
}
