"use client";
import { useEffect, useRef, useState } from "react";

export default function AudioPlayer() {
  const audioRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState({ cur: 0, dur: 0 }); // seconds

  const [tracks, setTracks] = useState([]); // {name, url, file}[]
  const [current, setCurrent] = useState(null); // track object
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch tracks from /api/audio
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/audio", { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        const list = data?.tracks || [];
        setTracks(list);

        // Choose default: last chosen from localStorage, else first alphabetically
        const last =
          typeof window !== "undefined"
            ? localStorage.getItem("audio:selected")
            : null;
        const found = list.find((x) => x.url === last);
        setCurrent(found || list[0] || null);
      } catch {
        setTracks([]);
        setCurrent(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Create/reuse a single <audio> element; update source when `current` changes.
  useEffect(() => {
    // if no track yet, don’t create audio
    if (!current) return;

    let el = audioRef.current;
    const fresh = !el;

    if (!el) {
      el = new Audio();
      el.preload = "metadata";
      el.loop = true; // 🔁 ensure it always loops when it reaches the end
      audioRef.current = el;

      const onLoaded = () => setT((s) => ({ ...s, dur: el.duration || 0 }));
      const onTime = () =>
        setT({ cur: el.currentTime || 0, dur: el.duration || 0 });
      const onEnd = () => setPlaying(false);

      el.addEventListener("loadedmetadata", onLoaded);
      el.addEventListener("timeupdate", onTime);
      el.addEventListener("ended", onEnd);
      setReady(true);
    }

    // update source (preserve play/pause state)
    const shouldResume = playing;
    el.src = current.url;
    el.load();

    // Update Media Session
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: current.name || "Audio",
        artist: "Playlist",
        album: "Workout",
      });
      navigator.mediaSession.setActionHandler?.("play", () => play());
      navigator.mediaSession.setActionHandler?.("pause", () => pause());
      navigator.mediaSession.setActionHandler?.("seekto", (d) => {
        if (el && typeof d.seekTime === "number") el.currentTime = d.seekTime;
      });
      navigator.mediaSession.setActionHandler?.("previoustrack", prev);
      navigator.mediaSession.setActionHandler?.("nexttrack", next);
    }

    // restore playback if we were playing
    if (!fresh && shouldResume) {
      el.play().catch(() => {});
    } else {
      setPlaying(false);
      setT({ cur: 0, dur: 0 });
    }

    // persist selection
    try {
      localStorage.setItem("audio:selected", current.url);
    } catch {}

    // cleanup on unmount handled in a separate effect if needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    return () => {
      const el = audioRef.current;
      if (!el) return;
      el.pause();
      el.src = "";
      el.load();
      audioRef.current = null;
    };
  }, []);

  const play = async () => {
    try {
      await audioRef.current?.play();
      setPlaying(true);
    } catch (err) {
      // requires user gesture, button press counts
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

  // Track navigation
  const indexOf = (trk) => tracks.findIndex((x) => x.url === trk?.url);
  const prev = () => {
    if (!current || !tracks.length) return;
    const i = indexOf(current);
    const n = (i - 1 + tracks.length) % tracks.length;
    setCurrent(tracks[n]);
  };
  const next = () => {
    if (!current || !tracks.length) return;
    const i = indexOf(current);
    const n = (i + 1) % tracks.length;
    setCurrent(tracks[n]);
  };

  const fmt = (s) => {
    const m = Math.floor((s || 0) / 60);
    const sec = Math.floor((s || 0) % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  const pick = (trk) => {
    setMenuOpen(false);
    setCurrent(trk);
    // if we were playing, resume automatically on the new track
    if (playing) {
      // slight delay so the new src is set
      setTimeout(() => play(), 0);
    }
  };

  return (
    <div className="fixed right-3 bottom-3 z-40">
      {/* Mini player card */}
      <div className="relative rounded-2xl border border-slate-800/70 bg-slate-900/70 backdrop-blur px-3 py-2 shadow-xl w-72">
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <button
            onClick={toggle}
            disabled={!ready || !current}
            className={[
              "h-10 w-10 rounded-full border flex items-center justify-center",
              "border-slate-700 bg-slate-800/70 active:scale-95 transition",
              ready ? "text-white" : "text-slate-500",
            ].join(" ")}
            aria-label={playing ? "Pause" : "Play"}
            title={playing ? "Pause" : "Play"}
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

          {/* Track info + scrubber */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-300 truncate">
              {current ? current.name : "No audio found"}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={t.dur || 0}
                step="1"
                value={t.cur}
                onChange={onScrub}
                disabled={!current}
                className="w-full accent-emerald-500"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{fmt(t.cur)}</span>
              <span>{fmt(t.dur || 0)}</span>
            </div>
          </div>

          {/* Track menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            disabled={!tracks.length}
            className="h-10 w-10 rounded-full border border-slate-700 bg-slate-800/70 text-white active:scale-95 transition grid place-items-center"
            aria-label="Choose track"
            title="Choose track"
          >
            {/* music note icon */}
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                fill="currentColor"
                d="M12 3v10.55A4 4 0 1 1 10 9V5h8V3h-6z"
              />
            </svg>
          </button>
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute right-0 bottom-14 w-72 max-h-64 overflow-auto rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur shadow-2xl">
            {tracks.length ? (
              <ul className="py-1">
                {tracks.map((trk) => {
                  const active = current && trk.url === current.url;
                  return (
                    <li key={trk.url}>
                      <button
                        onClick={() => pick(trk)}
                        className={[
                          "w-full text-left px-3 py-2 text-sm flex items-center gap-2",
                          active
                            ? "bg-emerald-600/20 text-emerald-200"
                            : "text-slate-200 hover:bg-slate-800/60",
                        ].join(" ")}
                      >
                        {active ? (
                          <svg viewBox="0 0 24 24" className="h-4 w-4">
                            <path
                              fill="currentColor"
                              d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                            />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 opacity-50"
                          >
                            <path
                              fill="currentColor"
                              d="M12 3v10.55A4 4 0 1 1 10 9V5h8V3h-6z"
                            />
                          </svg>
                        )}
                        <span className="truncate">{trk.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400">
                No audio files
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
