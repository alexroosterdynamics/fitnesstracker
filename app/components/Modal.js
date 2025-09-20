"use client";
export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative m-3 w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl">
        {title && (
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}
