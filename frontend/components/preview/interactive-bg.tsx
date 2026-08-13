"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useTheme } from "next-themes";

export function InteractiveBG() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfigFast = { damping: 40, stiffness: 120, mass: 1 };
  const springConfigMed = { damping: 50, stiffness: 60, mass: 2 };
  const springConfigSlow = { damping: 60, stiffness: 30, mass: 3 };

  const cursorX = useSpring(mouseX, springConfigFast);
  const cursorY = useSpring(mouseY, springConfigFast);
  const orb1X = useSpring(mouseX, springConfigMed);
  const orb1Y = useSpring(mouseY, springConfigMed);
  const orb2X = useSpring(mouseX, springConfigSlow);
  const orb2Y = useSpring(mouseY, springConfigSlow);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId: number;
    let particles: any[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    const symbols = ["{  }", "REPO", "PILOT", "< />"];
    let currentSymbolIdx = 0;

    const getSymbolPoints = (text: string) => {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return [];
      offCtx.fillStyle = "white";
      let fontSize = Math.min(width * 0.35, 500);
      if (text === "REPO" || text === "PILOT") fontSize = Math.min(width * 0.2, 350);
      offCtx.font = `900 ${fontSize}px "Inter", sans-serif`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillText(text, width / 2, height / 2);
      const imgData = offCtx.getImageData(0, 0, width, height).data;
      const pts = [];
      const step = Math.max(16, Math.floor(width / 80));
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          if (imgData[idx + 3] > 128) pts.push({ x, y });
        }
      }
      return pts;
    };

    const initOrMorph = (isMorph = false) => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      const pts = getSymbolPoints(symbols[currentSymbolIdx]);
      if (!isMorph) {
        particles = pts.map(pt => ({
          x: Math.random() * width, y: Math.random() * height,
          tx: pt.x, ty: pt.y,
          vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
          baseSize: Math.random() * 4 + 4, size: 0,
          colorOffset: Math.random() * Math.PI * 2
        }));
      } else {
        for (let i = 0; i < pts.length; i++) {
          if (i < particles.length) {
            particles[i].tx = pts[i].x; particles[i].ty = pts[i].y;
          } else {
            particles.push({ x: width / 2, y: height / 2, tx: pts[i].x, ty: pts[i].y, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, baseSize: Math.random() * 4 + 4, size: 0, colorOffset: Math.random() * Math.PI * 2 });
          }
        }
        for (let i = pts.length; i < particles.length; i++) {
          const rp = pts[Math.floor(Math.random() * pts.length)];
          if (rp) { particles[i].tx = rp.x; particles[i].ty = rp.y; }
        }
      }
    };

    window.addEventListener("resize", () => initOrMorph(false));
    initOrMorph(false);

    const handleClick = () => {
      for (const p of particles) {
        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * 80 + 30;
        p.vx += Math.cos(angle) * force; p.vy += Math.sin(angle) * force;
      }
      currentSymbolIdx = (currentSymbolIdx + 1) % symbols.length;
      setTimeout(() => initOrMorph(true), 150);
    };
    window.addEventListener("click", handleClick);

    let time = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const mx = mouseX.get(); const my = mouseY.get();
      time += 0.02;
      const mouseRadius = 250; const spring = 0.04; const friction = 0.85;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dxMouse = mx - p.x; const dyMouse = my - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        const ambientX = Math.sin(time + p.colorOffset) * 12;
        const ambientY = Math.cos(time + p.colorOffset) * 12;
        if (distMouse < mouseRadius) {
          const force = (mouseRadius - distMouse) / mouseRadius;
          const angle = Math.atan2(dyMouse, dxMouse);
          p.vx -= Math.cos(angle) * force * 1.5;
          p.vy -= Math.sin(angle) * force * 1.5;
        }
        p.size = p.size + (p.baseSize - p.size) * 0.1;
        const dxTarget = (p.tx + ambientX) - p.x; const dyTarget = (p.ty + ambientY) - p.y;
        p.vx += dxTarget * spring; p.vy += dyTarget * spring;
        p.vx *= friction; p.vy *= friction;
        p.x += p.vx; p.y += p.vy;
        const gradient = ctx.createRadialGradient(p.x - p.size * 0.3, p.y - p.size * 0.3, 0, p.x, p.y, p.size);
        if (isDark) {
          gradient.addColorStop(0, "rgba(255,255,255,0.95)");
          gradient.addColorStop(0.3, "rgba(139,92,246,0.8)");
          gradient.addColorStop(0.8, "rgba(139,92,246,0.2)");
          gradient.addColorStop(1, "rgba(0,0,0,0)");
        } else {
          gradient.addColorStop(0, "rgba(255,255,255,1)");
          gradient.addColorStop(0.3, "rgba(59,130,246,0.8)");
          gradient.addColorStop(0.8, "rgba(59,130,246,0.2)");
          gradient.addColorStop(1, "rgba(255,255,255,0)");
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0, p.size), 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", () => initOrMorph(false));
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(rafId);
    };
  }, [isDark, mouseX, mouseY]);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, opacity: 0.8 }} />

      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", top: "10%", right: "10%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, var(--p-accent-glow-2) 0%, transparent 70%)", filter: "blur(80px)", opacity: 0.4 }}
      />
      <motion.div style={{ position: "absolute", left: 0, top: 0, x: orb2X, y: orb2Y, translateX: "-50%", translateY: "-50%", width: 600, height: 600 }}>
        <motion.div animate={{ x: [0, 120, 0, -120, 0], y: [0, -100, 80, -60, 0], scale: [1, 1.1, 0.9, 1.05, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(circle, var(--p-accent-glow) 0%, transparent 70%)", filter: "blur(60px)", opacity: 0.6 }} />
      </motion.div>
      <motion.div style={{ position: "absolute", left: 0, top: 0, x: orb1X, y: orb1Y, translateX: "-40%", translateY: "-60%", width: 400, height: 400 }}>
        <motion.div animate={{ x: [0, -80, 0, 80, 0], y: [0, 60, -90, 40, 0], scale: [1, 0.9, 1.1, 0.95, 1] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(circle, var(--p-accent-glow-2) 0%, transparent 60%)", filter: "blur(40px)", opacity: 0.8 }} />
      </motion.div>

    </div>
  );
}
