"use client";
import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";

export default function ExerciseCard({ id, isOpen, setOpenCard, index, exercise, completed, weights, onToggle, onSave }) {
  const [local, setLocal] = useState(weights);
  const [saved, setSaved] = useState(false);
  const [growthMsg, setGrowthMsg] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const lastTapRef = useRef(0);

  useEffect(() => setLocal(weights), [weights]);
  useEffect(() => {
    const v = videoRef.current;
    if (v) isOpen ? v.play().catch(() => {}) : v.pause();
  }, [isOpen]);

  const save = async () => {
    const diffA = parseFloat(local.Andy || 0) - parseFloat(weights.Andy || 0);
    const diffP = parseFloat(local.Petronela || 0) - parseFloat(weights.Petronela || 0);
    let msg = [];
    if (diffA > 0) msg.push(`Andy +${diffA}kg`);
    if (diffP > 0) msg.push(`Petronela +${diffP}kg`);
    
    await onSave({ Andy: String(local.Andy).replace(/[^\d.]/g, ""), Petronela: String(local.Petronela).replace(/[^\d.]/g, "") });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
    if (msg.length) setGrowthMsg(msg.join("\n"));
  };

  const handleVideo = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      const v = videoRef.current;
      v?.webkitEnterFullscreen ? v.webkitEnterFullscreen() : v?.requestFullscreen?.();
    } else {
      videoRef.current?.paused ? videoRef.current.play() : videoRef.current.pause();
    }
    lastTapRef.current = now;
  };

  return (
    <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
      isOpen 
        ? 'bg-gradient-to-br from-slate-900/90 to-slate-900/50 border-slate-700/50 shadow-2xl' 
        : completed
        ? 'bg-slate-900/30 border-slate-800/30 hover:border-slate-700/50'
        : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700/70 hover:shadow-lg'
    }`}>
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-sky-500/0 to-emerald-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none ${isOpen ? 'opacity-5' : ''}`} />
      
      {/* Header / Collapsed View */}
      <div 
        className="relative cursor-pointer"
        onClick={() => setOpenCard(isOpen ? null : id)}
      >
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Enhanced checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(!completed); }}
            className={`relative flex-shrink-0 h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
              completed 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 shadow-lg shadow-emerald-500/30' 
                : 'border-slate-600 hover:border-emerald-500/50 hover:bg-slate-800/50'
            }`}
          >
            <svg 
              viewBox="0 0 24 24" 
              className={`w-5 h-5 transition-all duration-300 ${completed ? 'text-white scale-100' : 'text-transparent scale-0'}`}
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </button>

          {/* Exercise info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${
                index === 0 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-slate-700/30 text-slate-400 border border-slate-600/20'
              }`}>
                {index === 0 ? 'Warmup' : `Set ${index}`}
              </span>
            </div>
            <h3 className={`text-base font-semibold transition-all duration-300 ${
              completed 
                ? 'text-slate-500 line-through' 
                : 'text-slate-100 group-hover:text-white'
            }`}>
              {exercise.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {exercise.description.split('—')[1] || '3×8'}
            </p>
          </div>

          {/* Weight display and expand indicator */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mb-1">Last</div>
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/30">
                  <span className="text-xs font-bold text-emerald-400">{weights.Andy || '—'}</span>
                </div>
                <span className="text-slate-600 text-xs">/</span>
                <div className="px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/30">
                  <span className="text-xs font-bold text-sky-400">{weights.Petronela || '—'}</span>
                </div>
              </div>
            </div>

            {/* Expand chevron */}
            <svg 
              className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Detail Section */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-5 pb-6 space-y-6 border-t border-slate-800/50">
          {/* Description */}
          <div className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-sky-500 rounded-full" />
              <p className="text-sm text-slate-400 leading-relaxed">{exercise.description}</p>
            </div>
          </div>

          {/* Weight Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Log Today's Weight</h4>
              {saved && (
                <span className="text-xs text-emerald-400 font-medium animate-pulse">✓ Saved</span>
              )}
            </div>
            
            <div className="grid grid-cols-[1fr,1fr,auto] gap-3">
              {/* Andy Input */}
              <div className="relative group/input">
                <label className="absolute -top-2 left-3 px-1 bg-slate-900 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Andy
                </label>
                <input
                  inputMode="decimal"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-base font-semibold text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  placeholder="0"
                  value={local.Andy}
                  onChange={(e) => setLocal(s => ({ ...s, Andy: e.target.value }))}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">kg</span>
              </div>

              {/* Petronela Input */}
              <div className="relative group/input">
                <label className="absolute -top-2 left-3 px-1 bg-slate-900 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  Petronela
                </label>
                <input
                  inputMode="decimal"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-base font-semibold text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                  placeholder="0"
                  value={local.Petronela}
                  onChange={(e) => setLocal(s => ({ ...s, Petronela: e.target.value }))}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">kg</span>
              </div>

              {/* Save Button */}
              <button
                onClick={save}
                className={`px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                  saved
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {saved ? '✓' : 'Log'}
              </button>
            </div>
          </div>

          {/* Video Player */}
          <div className="relative">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Exercise Demo</h4>
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video group/video border border-slate-800/50 shadow-xl">
              <video
                ref={videoRef}
                src={`/videos/${exercise.title.trim()}.mp4`}
                loop
                muted={isMuted}
                playsInline
                onClick={handleVideo}
                className="w-full h-full object-cover cursor-pointer transition-opacity group-hover/video:opacity-90"
              />
              
              {/* Video controls overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/video:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Play/Pause indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/video:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    {videoRef.current?.paused ? (
                      <path d="M8 5v14l11-7z" />
                    ) : (
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    )}
                  </svg>
                </div>
              </div>

              {/* Mute button */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="absolute bottom-3 right-3 p-2.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-black/60 transition-all z-10"
              >
                {isMuted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>

              {/* Fullscreen hint */}
              <div className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white text-xs opacity-0 group-hover/video:opacity-100 transition-opacity">
                Double tap for fullscreen
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress growth modal */}
      {growthMsg && (
        <Modal title="💪 Progress Logged" onClose={() => setGrowthMsg("")}>
          <div className="py-6 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border-2 border-emerald-500/30 mb-4">
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="space-y-2">
                {growthMsg.split('\n').map((line, i) => (
                  <p key={i} className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                    {line}
                  </p>
                ))}
              </div>
              <p className="text-slate-500 text-sm mt-3">Keep pushing forward!</p>
            </div>
            <button
              onClick={() => setGrowthMsg("")}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold text-sm uppercase tracking-wider hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Continue
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}