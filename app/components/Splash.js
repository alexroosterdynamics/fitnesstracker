"use client";
import ConfettiCanvas from "./ConfettiCanvas";

export default function Splash({ show }) {
  return (
    <div
      className={[
        "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ease-out",
        show
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950" />
      {/* Glow blobs */}
      <div className="absolute -inset-10 flex items-center justify-center blur-3xl opacity-40">
        <div className="h-64 w-64 rounded-full bg-emerald-500/40 animate-pulse" />
        <div className="h-64 w-64 rounded-full bg-sky-500/40 animate-pulse ml-[-4rem]" />
      </div>

      {/* Card */}
      <div className="relative w-[86%] max-w-sm rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur p-6 shadow-2xl">
        <div className="flex items-center justify-center mb-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-600/90 flex items-center justify-center shadow-lg">
            <span className="text-2xl">🏋️</span>
          </div>
        </div>

        <h2 className="text-center text-2xl font-extrabold text-white">
          Andy &amp; Petronela
        </h2>
        <p className="text-center text-sm text-slate-400 mt-1">
          Train. Track. Progress.
        </p>

        {/* Confetti flourish */}
        <div className="mt-4">
          <ConfettiCanvas duration={1400} count={90} />
        </div>

        {/* Spinner */}
        <div className="mt-2 flex items-center justify-center">
          <div className="h-5 w-5 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" />
        </div>
      </div>
    </div>
  );
}
