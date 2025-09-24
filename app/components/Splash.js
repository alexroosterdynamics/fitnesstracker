"use client";

export default function Splash({ show }) {
  return (
    <div
      className={[
        "fixed inset-0 z-50 flex items-center justify-center",
        "transition-all duration-700 ease-out",
        show
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none",
      ].join(" ")}
    >
      {/* Layered ambient gradients */}
      <div
        className={[
          "absolute inset-0",
          // emerald glow top-center + sky glow bottom-right
          "bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(16,185,129,0.25),transparent_60%),",
          "radial-gradient(45%_35%_at_85%_110%,rgba(56,189,248,0.20),transparent_60%)]",
        ].join("")}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur" />

      {/* Card */}
      <div className="relative w-[86%] max-w-sm">
        <div className="relative rounded-3xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Soft top highlight */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

          {/* Logo mark */}
          <div className="flex items-center justify-center pt-7">
            <div className="relative h-14 w-14 rounded-2xl bg-slate-800/70 border border-slate-700/70 shadow-inner grid place-items-center">
              {/* Minimal dumbbell glyph */}
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-slate-100"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M4 9h2v6H4V9zm14 0h2v6h-2V9zM8 11h8v2H8v-2zM6 7h2v10H6V7zm10 0h2v10h-2V7z"
                />
              </svg>
              {/* subtle pulse ring */}
              <span className="absolute inset-0 rounded-2xl ring-1 ring-emerald-400/20 animate-pulse" />
            </div>
          </div>

          {/* Brand */}
          <div className="px-6 pb-7 pt-4 text-center">
            <h2 className="text-2xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
                Andy &amp; Petronela
              </span>
            </h2>
            <p className="mt-1 text-[13px] text-slate-400">
              Train • Track • Progress
            </p>

            {/* Progress sweep bar */}
            <div className="mt-5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={[
                  "h-full w-1/3 rounded-full",
                  "bg-gradient-to-r from-emerald-400 via-emerald-300 to-sky-400",
                  "animate-[sweep_1.4s_ease-in-out_infinite]",
                ].join(" ")}
                style={{
                  // keyframes via inline style fallbacks
                  // Tailwind JIT handles arbitrary animations but we provide keyframes here:
                  animationName: "sweep",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inline keyframes (scoped) */}
      <style jsx>{`
        @keyframes sweep {
          0% {
            transform: translateX(-100%);
            width: 25%;
            opacity: 0.8;
          }
          50% {
            transform: translateX(20%);
            width: 55%;
            opacity: 1;
          }
          100% {
            transform: translateX(120%);
            width: 25%;
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
