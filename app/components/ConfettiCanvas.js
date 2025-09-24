//components/ConfettiCanvas.js
"use client";
import { useEffect, useRef } from "react";

export default function ConfettiCanvas({ duration = 1800, count = 120 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = 180);
    const colors = [
      "#34d399",
      "#60a5fa",
      "#f472b6",
      "#fbbf24",
      "#22d3ee",
      "#a78bfa",
    ];
    const rand = (min, max) => Math.random() * (max - min) + min;

    const parts = Array.from({ length: count }).map(() => ({
      x: rand(0, w),
      y: rand(-h, 0),
      vx: rand(-0.8, 0.8),
      vy: rand(1.2, 2.6),
      size: rand(2, 4),
      color: colors[(Math.random() * colors.length) | 0],
      rot: rand(0, 2 * Math.PI),
      vr: rand(-0.15, 0.15),
    }));

    let start = performance.now();
    let raf;
    const draw = (t) => {
      const elapsed = t - start;
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > h) {
          p.y = -10;
          p.x = rand(0, w);
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      if (elapsed < duration) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [count, duration]);

  return (
    <canvas ref={ref} className="w-full h-[180px] rounded-lg bg-transparent" />
  );
}
