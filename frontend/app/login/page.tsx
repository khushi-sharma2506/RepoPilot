"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Sparkles, ArrowRight, Eye, EyeOff, Sun, Moon, GitBranch, Globe, Mail, Lock, Cpu, Activity } from "lucide-react";
import { InteractiveBG } from "@/components/preview/interactive-bg";

export default function LoginPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  const [showPw, setShowPw] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => setMounted(true), []);

  const handleGithubAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("github", { callbackUrl: "/studio" });
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--p-bg)", position: "relative", overflow: "hidden" }}>
      <InteractiveBG />

      {/* Scrolling WELCOME background text */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
        <motion.div animate={{ x: ["-33.33%", "0%"] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} style={{ display: "flex", whiteSpace: "nowrap", alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <motion.div key={i} animate={{ opacity: [0.12, 0.25, 0.12] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: i * 2 }} style={{ fontSize: "clamp(120px, 25vw, 400px)", fontWeight: 900, color: "transparent", WebkitTextStroke: mounted && resolvedTheme === "dark" ? "3px rgba(255,255,255,0.6)" : "3px rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "1.5vw", padding: "0 12vw", fontFamily: "'Inter', sans-serif", userSelect: "none" }}>WELCOME</motion.div>
          ))}
        </motion.div>
      </div>

      {/* Floating system status blocks */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}>
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="p-glass" style={{ position: "absolute", top: "15%", left: "10%", padding: "16px", borderRadius: 16, minWidth: 160, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Activity size={14} color="var(--p-green)" /><span style={{ fontSize: 11, fontWeight: 700, color: "var(--p-fg-3)", textTransform: "uppercase" }}>AI Agents</span></div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--p-fg)" }}>Operational</div>
        </motion.div>
        <motion.div animate={{ y: [0, 25, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="p-glass" style={{ position: "absolute", bottom: "15%", right: "8%", padding: "16px", borderRadius: 16, minWidth: 180, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Cpu size={14} color="var(--p-accent)" /><span style={{ fontSize: 11, fontWeight: 700, color: "var(--p-fg-3)", textTransform: "uppercase" }}>Script Engine</span></div>
          <div style={{ height: 6, width: "100%", background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}><motion.div animate={{ width: ["40%", "85%", "60%"] }} transition={{ duration: 5, repeat: Infinity }} style={{ height: "100%", background: "var(--p-accent)" }} /></div>
        </motion.div>
      </div>

      {/* Theme toggle */}
      {mounted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "absolute", top: 40, right: 40, zIndex: 10 }}>
          <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", backdropFilter: "blur(12px)", color: "var(--p-fg-2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </motion.div>
      )}

      {/* AUTH CARD */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="p-scroll" style={{ width: "100%", maxWidth: 420, margin: "20px", position: "relative", zIndex: 2, background: mounted && resolvedTheme === "dark" ? "rgba(10,10,15,0.7)" : "rgba(255,255,255,0.8)", backdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: "40px", boxShadow: "0 40px 80px rgba(0,0,0,0.3)" }}>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <img src="/logo.png" alt="RepoPilot Logo" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--p-fg)", letterSpacing: "-0.5px" }}>Repo<span style={{ color: "var(--p-accent)" }}>Pilot</span></span>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={isLogin ? "login" : "signup"} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{isLogin ? "System Access" : "Initialize Account"}</h2>
              <p style={{ fontSize: 14, color: "var(--p-fg-3)" }}>{isLogin ? "Enter credentials to authorize." : "Set up your workspace credentials."}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button onClick={handleGithubAuth} disabled={loading} style={{ width: "100%", height: 52, borderRadius: 14, background: "var(--p-accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8, boxShadow: "0 10px 25px var(--p-accent-glow)" }}>
                {loading ? "PROCESSING..." : "CONTINUE WITH GITHUB"}
                {!loading && <GitBranch size={18} />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <style dangerouslySetInnerHTML={{ __html: `.p-glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); }` }} />
    </div>
  );
}
