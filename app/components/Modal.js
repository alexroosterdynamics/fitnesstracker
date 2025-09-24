"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Modal({ title, children, onClose }) {
  const [mounted, setMounted] = useState(false);

  // mount portal target
  useEffect(() => setMounted(true), []);

  // hard lock background scroll (mobile-safe) and preserve scroll position
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyWidth = body.style.width;
    const scrollY = window.scrollY;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.width = "100%";
    body.style.top = `-${scrollY}px`;

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      body.style.position = prevBodyPosition;
      body.style.width = prevBodyWidth;
      body.style.top = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur"
      />
      {/* Absolute-centered shell so it cannot drift with layout */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm">
        {/* Card (self-scrolls if tall) */}
        <div className="max-h-[85vh] overflow-auto rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-2xl p-5">
          {title && (
            <h3 className="text-lg font-semibold text-white mb-3">
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
                {title}
              </span>
            </h3>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
