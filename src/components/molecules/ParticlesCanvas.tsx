"use client";

import React, { useEffect, useRef } from "react";

export default function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isMobile || prefersReducedMotion) return; // skip on mobile/low-motion

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas || !ctx) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];

    function initParticles() {
      particles.length = 0;
      const area = width * height;
      const density = 0.00005; // particles per px
      const target = Math.min(80, Math.max(20, Math.floor(area * density)));
      for (let i = 0; i < target; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          r: 1 + Math.random() * 1.5,
          a: 0.2 + Math.random() * 0.3,
        });
      }
    }

    let last = 0;
    function tick(ts: number) {
      rafRef.current = requestAnimationFrame(tick);
      if (ts - last < 33) return; // ~30fps cap
      last = ts;

      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = document.documentElement.classList.contains("dark")
        ? "rgba(255,255,255,0.6)"
        : "rgba(0,0,0,0.5)";

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const obs = new ResizeObserver(() => {
      resize();
      initParticles();
    });
    obs.observe(canvas);

    const onVis = () => {
      if (document.visibilityState === "hidden" && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    resize();
    initParticles();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      obs.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden
    />
  );
}
