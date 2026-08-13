"use client";

import React, { useState, useEffect } from "react";
import { InteractiveBG } from "@/components/preview/interactive-bg";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Zap, ArrowRight, Play, Sparkles,
  GitBranch, LineChart, Shield,
  Sun, Moon, ChevronRight,
  Video, Mic, Download
} from "lucide-react";

/* ─── Fade-in wrapper ─────────────────────────────────────────────── */
function Fade({ children, delay = 0, y = 30, className = "" }: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Feature card ────────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, color, delay }: {
  icon: React.ElementType; title: string; desc: string; color: string; delay: number;
}) {
  return (
    <Fade delay={delay}>
      <motion.div
        whileHover={{ y: -6, boxShadow: "var(--p-shadow-xl)" }}
        transition={{ duration: 0.25 }}
        className="p-card-3d p-shimmer"
        style={{
          padding: "28px 24px", borderRadius: 16,
          border: "1px solid var(--p-border)", background: "var(--p-surface-solid)",
          cursor: "pointer", position: "relative", overflow: "hidden",
          transformStyle: "preserve-3d" as const,
        }}
      >
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: color + "0a", filter: "blur(40px)" }} />
        <div style={{ width: 48, height: 48, borderRadius: 14, background: color + "14", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: `0 4px 12px ${color}15` }}>
          <Icon size={22} color={color} strokeWidth={1.8} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--p-fg)", marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 14, color: "var(--p-fg-3)", lineHeight: 1.6, margin: 0 }}>{desc}</p>
      </motion.div>
    </Fade>
  );
}

/* ─── Stat card ───────────────────────────────────────────────────── */
function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <Fade delay={delay}>
      <div style={{ textAlign: "center" as const }}>
        <div style={{ fontSize: 42, fontWeight: 800, color: "var(--p-fg)", letterSpacing: "-2px" }}>{value}</div>
        <div style={{ fontSize: 14, color: "var(--p-fg-3)", marginTop: 4 }}>{label}</div>
      </div>
    </Fade>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   REPOPILOT LANDING PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--p-bg)", color: "var(--p-fg)", position: "relative", overflow: "hidden" }}>
      <InteractiveBG />

      {/* ─── NAV ──────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 64, display: "flex", alignItems: "center", padding: "0 32px", gap: 16 }}
        className="p-glass"
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/logo.png" alt="RepoPilot Logo" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--p-fg)", letterSpacing: "-0.5px" }}>
            Repo<span style={{ color: "var(--p-accent)" }}>Pilot</span>
          </span>
        </Link>

        <div style={{ flex: 1 }} />

        {[
          { label: "Showcase", id: "showcase" },
          { label: "Stats", id: "stats" },
          { label: "Features", id: "features" },
        ].map((item) => (
          <a key={item.id} href={`#${item.id}`} style={{ fontSize: 14, fontWeight: 500, color: "var(--p-fg-2)", textDecoration: "none", padding: "6px 14px", borderRadius: 8, transition: "0.2s" }}>
            {item.label}
          </a>
        ))}

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--p-border)", background: "transparent", cursor: "pointer", color: "var(--p-fg-3)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {mounted ? (resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />) : <div style={{ width: 16, height: 16 }} />}
        </button>

        <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "var(--p-fg-2)", textDecoration: "none", padding: "8px 16px" }}>
          Sign in
        </Link>

        <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", padding: "8px 20px", borderRadius: 10, background: "linear-gradient(135deg, var(--p-accent), var(--p-accent-2))", boxShadow: "0 2px 12px var(--p-accent-glow)", display: "flex", alignItems: "center", gap: 6 }}>
          Enter Studio <ArrowRight size={14} />
        </Link>
      </motion.nav>

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", textAlign: "center" as const, maxWidth: 900, margin: "0 auto", padding: "180px 24px 100px" }}>
        
        <Fade delay={0}>
          <motion.div whileHover={{ scale: 1.03 }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 8px", borderRadius: 50, border: "1px solid var(--p-border-2)", background: "var(--p-surface)", fontSize: 13, fontWeight: 600, color: "var(--p-fg-2)", cursor: "pointer", marginBottom: 28 }}>
            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "var(--p-accent-glow)", color: "var(--p-accent)" }}>NEW</span>
            The Ultimate Hackathon Demo Assistant
            <ChevronRight size={14} />
          </motion.div>
        </Fade>

        <Fade delay={0.1}>
          <h1 style={{ fontSize: "clamp(38px, 5.5vw, 68px)", fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.05, marginBottom: 20, background: "linear-gradient(135deg, var(--p-fg) 40%, var(--p-accent) 70%, var(--p-accent-2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Transform your GitHub<br />into a pro showcase.
          </h1>
        </Fade>

        <Fade delay={0.2}>
          <p style={{ fontSize: 18, fontWeight: 500, color: "var(--p-fg-2)", lineHeight: 1.7, maxWidth: 580, marginBottom: 40 }}>
            Other tools generate black-box AI videos. RepoPilot is an intelligent studio — pick your narrative, refine the script, tune the voice, and export a cinematic demo.
          </p>
        </Fade>

        <Fade delay={0.3}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center" }}>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: "none", background: "linear-gradient(135deg, var(--p-accent), var(--p-accent-2))", boxShadow: "0 4px 20px var(--p-accent-glow), 0 0 0 1px var(--p-accent)" }}>
                <Sparkles size={16} /> Enter the Studio Free
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, color: "var(--p-fg)", textDecoration: "none", border: "1px solid var(--p-border-2)", background: "var(--p-surface)" }}>
                <Play size={14} fill="currentColor" /> Watch Demo
              </a>
            </motion.div>
          </div>
        </Fade>

        {/* Floating stat cards */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: -1 }}>
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="p-glass p-shimmer" style={{ position: "absolute", top: 100, left: -60, padding: "14px 16px", borderRadius: 14, minWidth: 150, boxShadow: "var(--p-shadow-lg)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--p-fg-3)", textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 6 }}>Repos Analyzed</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--p-accent)" }}>2,847</div>
            <div style={{ fontSize: 11, color: "var(--p-green)", marginTop: 2 }}>↑ 12.5%</div>
          </motion.div>

          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="p-glass p-shimmer" style={{ position: "absolute", top: 60, right: -40, padding: "14px 16px", borderRadius: 14, minWidth: 150, boxShadow: "var(--p-shadow-lg)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--p-fg-3)", textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 6 }}>Script Accuracy</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--p-green)" }}>96.4%</div>
            <div style={{ fontSize: 11, color: "var(--p-fg-3)", marginTop: 2 }}>AI storytelling</div>
          </motion.div>

          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="p-glass p-shimmer" style={{ position: "absolute", bottom: 20, right: -80, padding: "14px 16px", borderRadius: 14, minWidth: 140, boxShadow: "var(--p-shadow-lg)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--p-fg-3)", textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 6 }}>Videos Exported</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--p-accent-2)" }}>14.2k</div>
          </motion.div>
        </div>
      </section>

      {/* ─── PRODUCT SHOWCASE (3D mockup) ─────────────────────────── */}
      <section id="showcase" style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "0 24px 80px" }} className="p-perspective">
        <Fade>
          <motion.div
            whileHover={{ rotateX: 1, rotateY: -2 }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="p-shimmer"
            style={{ borderRadius: 20, border: "1px solid var(--p-border-2)", background: "var(--p-surface-solid)", boxShadow: "var(--p-shadow-xl)", overflow: "hidden", transformStyle: "preserve-3d" as const }}
          >
            <div style={{ height: 44, borderBottom: "1px solid var(--p-border)", display: "flex", alignItems: "center", padding: "0 16px", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f87171" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#34d399" }} />
              </div>
              <div style={{ flex: 1, textAlign: "center" as const, fontSize: 12, fontWeight: 600, color: "var(--p-fg-3)" }}>RepoPilot Studio</div>
            </div>
            <div style={{ display: "flex", height: 320 }}>
              <div style={{ width: 180, borderRight: "1px solid var(--p-border)", padding: 12, display: "flex", flexDirection: "column" as const, gap: 4 }}>
                {["Analyze", "Narrative", "Script", "Voices", "Export"].map((item, i) => (
                  <div key={item} style={{ padding: "8px 10px", borderRadius: 6, fontSize: 12, fontWeight: i === 2 ? 600 : 400, color: i === 2 ? "var(--p-accent)" : "var(--p-fg-3)", background: i === 2 ? "var(--p-accent-glow)" : "transparent" }}>{item}</div>
                ))}
              </div>
              <div style={{ flex: 1, position: "relative", background: "var(--p-bg)", padding: 20, display: "flex", flexDirection: "column" as const, gap: 12 }}>
                <div className="p-dotgrid" style={{ position: "absolute", inset: 0, opacity: 0.5, maskImage: "none", WebkitMaskImage: "none" }} />
                {[{ label: "🎬 Scene 1 — Show the Problem (5s)", c: "var(--p-accent)" }, { label: "🚀 Scene 2 — Introduce the Solution (6s)", c: "var(--p-accent-2)" }, { label: "⚡ Scene 3 — Live Demo Highlights (8s)", c: "var(--p-accent-3)" }, { label: "🎯 Scene 4 — Call to Action (4s)", c: "var(--p-amber)" }].map((n, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.15 }} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--p-border)", background: "var(--p-surface-solid)", fontSize: 12, fontWeight: 600, color: "var(--p-fg)", display: "flex", alignItems: "center", gap: 8, zIndex: 2, position: "relative" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.c, flexShrink: 0 }} />
                    {n.label}
                  </motion.div>
                ))}
              </div>
              <div style={{ width: 200, borderLeft: "1px solid var(--p-border)", padding: 12, display: "flex", flexDirection: "column" as const, gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Script AI</div>
                <div style={{ padding: "6px 8px", borderRadius: 6, background: "var(--p-border)", fontSize: 11, color: "var(--p-fg-3)" }}>What angle should I focus on?</div>
                <div style={{ padding: "6px 8px", borderRadius: 6, background: "linear-gradient(135deg, var(--p-accent), var(--p-accent-2))", fontSize: 11, color: "#fff", alignSelf: "flex-end" }}>Make it hackathon-ready</div>
                <div style={{ marginTop: "auto", height: 28, borderRadius: 6, border: "1px solid var(--p-border)", background: "var(--p-bg)" }} />
              </div>
            </div>
          </motion.div>
        </Fade>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────── */}
      <section id="stats" style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, padding: "40px 24px 80px" }}>
        <StatCard value="2.8k+" label="Repos showcased" delay={0} />
        <StatCard value="4 voices" label="US & UK AI narration" delay={0.1} />
        <StatCard value="9:16 & 16:9" label="Aspect ratios" delay={0.2} />
        <StatCard value="4.9★" label="Hackathon rating" delay={0.3} />
      </section>

      <div className="p-glow-line" style={{ maxWidth: 600, margin: "0 auto" }} />

      {/* ─── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <Fade>
          <div style={{ textAlign: "center" as const, marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--p-accent)", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 12 }}>Features</p>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>You are the director, not a passenger.</h2>
            <p style={{ fontSize: 16, color: "var(--p-fg-3)", maxWidth: 500, margin: "0 auto" }}>
              From GitHub analysis to AI voiceover to an editable MP4, RepoPilot gives you total creative control.
            </p>
          </div>
        </Fade>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          <FeatureCard icon={Zap} title="No Black Boxes" desc="Pick your narrative angle, chat with the AI to refine the script line-by-line, and control every scene." color="var(--p-accent)" delay={0} />
          <FeatureCard icon={Mic} title="Studio Voiceovers" desc="Curated US & UK AI voices. Tune the pitch, preview before generating, and regenerate any scene." color="var(--p-accent-2)" delay={0.1} />
          <FeatureCard icon={Download} title="Editable MP4 Export" desc="Download a green-screen template ready to drop into CapCut or Premiere Pro for pro-level polish." color="var(--p-accent-3)" delay={0.2} />
          <FeatureCard icon={LineChart} title="Live Script Preview" desc="See the full scene breakdown with narration, visual hints, and timing before you render a frame." color="var(--p-green)" delay={0.1} />
          <FeatureCard icon={GitBranch} title="GitHub Analysis" desc="AI agents parse your repo architecture, tech stack, and README to write a script that actually makes sense." color="var(--p-amber)" delay={0.2} />
          <FeatureCard icon={Shield} title="Reel/Shorts Ready" desc="Switch between 16:9 landscape and 9:16 portrait in one click for any social media platform." color="var(--p-accent)" delay={0.3} />
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", textAlign: "center" as const, padding: "60px 24px 120px" }}>
        <Fade>
          <div style={{ padding: "56px 40px", borderRadius: 24, border: "1px solid var(--p-border-2)", background: "var(--p-surface)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -80, right: -80, width: 200, height: 200, borderRadius: "50%", background: "var(--p-accent-glow)", filter: "blur(60px)" }} />
            <div style={{ position: "absolute", bottom: -60, left: -60, width: 160, height: 160, borderRadius: "50%", background: "var(--p-accent-glow-2)", filter: "blur(50px)" }} />
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: "-1px", position: "relative" }}>Ready to impress your judges?</h2>
            <p style={{ fontSize: 16, color: "var(--p-fg-3)", marginBottom: 28, position: "relative" }}>
              Transform your GitHub repository into a professional project showcase video.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} style={{ position: "relative" }}>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 12, fontSize: 16, fontWeight: 700, color: "#fff", textDecoration: "none", background: "linear-gradient(135deg, var(--p-accent), var(--p-accent-2))", boxShadow: "0 4px 24px var(--p-accent-glow)" }}>
                Enter the Studio Free <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </Fade>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid var(--p-border)", padding: "40px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--p-fg-3)", fontSize: 13 }}>
        <span>© 2026 RepoPilot</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Studio", "Voices", "Export"].map((t) => (
            <a key={t} href="#" style={{ color: "var(--p-fg-3)", textDecoration: "none" }}>{t}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
