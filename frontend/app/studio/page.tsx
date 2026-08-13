"use client";

// This page is fully dynamic (auth-gated + URL params) — skip static prerender entirely
export const dynamic = "force-dynamic";

import React from "react";
import { RepoAnalyzer } from "@/components/pilot/repo-analyzer";
import { NarrativeCards } from "@/components/pilot/narrative-cards";
import { ScriptEditor } from "@/components/studio/script-editor";
import { VideoPreview } from "@/components/studio/video-preview";
import { ExportSettings } from "@/components/studio/export-settings";
import { LoadingState } from "@/components/shared/loading-state";

import { usePilotEngine } from "@/hooks/use-pilot-engine";
import { useScriptAgent } from "@/hooks/use-script-agent";
import { useStudioSettings } from "@/hooks/use-studio-settings";

import { motion } from "motion/react";
import Link from "next/link";
import { LogOut, Activity, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

function StudioContent() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });
  
  const { status, setStatus, project, setProject, progress, errorMsg, startAnalysis, selectStoryAngle } = usePilotEngine();
  const scriptAgent = useScriptAgent(project, setProject);
  const studioSettings = useStudioSettings(project, setProject, status);

  return (
    <div style={{ minHeight: "100vh", background: "var(--p-bg)", color: "var(--p-fg)", position: "relative" }}>
      {/* Subtle Background Mesh */}
      <div className="p-dotgrid" style={{ position: "fixed", inset: 0, opacity: 0.4, pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: "0", left: "0", right: "0", bottom: "0", background: "radial-gradient(ellipse at top, rgba(var(--p-accent-rgb), 0.08), transparent 70%)", pointerEvents: "none" }} />
      
      {/* Workspace Navbar */}
      <nav className="h-16 flex items-center justify-between px-6 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 relative z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <img src="/logo.png" alt="RepoPilot Logo" className="w-8 h-8 rounded-full object-cover" />
          <span className="text-lg font-bold text-white">
            Repo<span className="text-blue-500">Pilot</span> <span className="text-neutral-400 font-normal">Studio</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {session?.user && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 rounded-full border border-neutral-800">
              {session.user.image ? (
                <img src={session.user.image} alt="User" className="w-5 h-5 rounded-full" />
              ) : (
                <User size={14} className="text-neutral-400" />
              )}
              <span className="text-xs font-medium text-neutral-300">{session.user.name || session.user.email}</span>
            </div>
          )}
          <div className="text-xs font-medium text-emerald-400 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800 flex items-center gap-2">
            <Activity size={14} />
            Agents Online
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })} 
            className="text-neutral-400 hover:text-white transition bg-transparent border-none cursor-pointer p-0"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col items-center px-8 py-12 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl flex flex-col gap-12"
        >
          {/* Header */}
          {status === "idle" && (
            <div className="text-center pt-12 pb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                New Project
              </h1>
              <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                Paste your GitHub URL to start generating your cinematic presentation.
              </p>
            </div>
          )}

          {/* Phases */}
          <div style={{ width: "100%" }}>
            {status === "idle" && (
              <RepoAnalyzer onAnalyze={startAnalysis} />
            )}

            {status === "analyzing" && (
              <LoadingState 
                title="AI Agents Analyzing..." 
                subtitle={progress} 
              />
            )}

            {status === "failed" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "flex", justifyContent: "center" }}>
                <div className="p-glass p-shimmer" style={{ width: "100%", maxWidth: 600, padding: 32, borderRadius: 24, border: "1px solid rgba(239, 68, 68, 0.3)", background: "var(--p-surface-solid)", boxShadow: "0 20px 40px rgba(239, 68, 68, 0.1)", textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--p-fg)", marginBottom: 12 }}>Analysis Failed</h2>
                  <p style={{ fontSize: 15, color: "var(--p-fg-2)", marginBottom: 24, padding: 16, background: "var(--p-bg-alt)", borderRadius: 12, border: "1px solid var(--p-border)", textAlign: "left", wordBreak: "break-word" }}>
                    {errorMsg || "An unknown error occurred during repository analysis."}
                  </p>
                  <button 
                    onClick={() => setStatus("idle")}
                    style={{ padding: "12px 24px", borderRadius: 12, background: "var(--p-surface)", color: "var(--p-fg)", border: "1px solid var(--p-border)", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "0.2s" }}
                    onMouseOver={e => e.currentTarget.style.borderColor = "var(--p-fg-3)"}
                    onMouseOut={e => e.currentTarget.style.borderColor = "var(--p-border)"}
                  >
                    Try Another Repository
                  </button>
                </div>
              </motion.div>
            )}

            {status === "stories" && project?.story_json && (
              <NarrativeCards 
                stories={project.story_json} 
                onSelect={selectStoryAngle} 
              />
            )}

            {status === "generating_script" && (
              <LoadingState 
                title="Director Agent Writing..." 
                subtitle="Drafting the scene-by-scene script based on your selected angle." 
              />
            )}
            
            {status === "script_editing" && project?.script_json && (
              <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                <ScriptEditor 
                  script={project.script_json}
                  chatHistory={scriptAgent.chatHistory}
                  chatInput={scriptAgent.chatInput}
                  setChatInput={scriptAgent.setChatInput}
                  chatLoading={scriptAgent.chatLoading}
                  sendMessage={scriptAgent.sendMessage}
                />
                <div className="flex justify-center mt-8">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStatus("preview")}
                    className="px-12 py-4 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-500 shadow-xl transition-colors"
                  >
                    Lock Script & Render Video →
                  </motion.button>
                </div>
              </motion.div>
            )}
            
            {status === "preview" && project?.script_json && (
              <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="w-full flex flex-col gap-12">
                {studioSettings.renderLoading || studioSettings.voiceLoading ? (
                  <div className="py-24">
                    <LoadingState 
                      title={studioSettings.renderLoading ? "Rendering MP4 Video..." : "Generating AI Voiceovers..."} 
                      subtitle={studioSettings.renderLoading ? "Compiling scenes, generating visual effects, and mixing audio." : "Synthesizing speech, applying pitch shifts, and timing subtitles."} 
                      type={studioSettings.renderLoading ? "render" : "voice"} 
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-white mb-4">Studio Render</h2>
                      <p className="text-lg text-neutral-400">
                        {project.script_json?.scenes?.some(s => !s.audio_url) 
                          ? "Initially there's no audio. Choose your preferable voice below and click Generate All Voiceovers!" 
                          : "Preview your video and customize voiceovers."}
                      </p>
                      
                      <div className="max-w-3xl mx-auto bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6 mt-8 text-left">
                        <h3 className="text-lg font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          How to use this Green Screen Template
                        </h3>
                        <p className="text-neutral-300 text-sm leading-relaxed">
                          RepoPilot generates a cinematic <strong>Chroma Key (Green Screen)</strong> template featuring your AI voiceovers, timed subtitles, and dynamic overlays. 
                          <br /><br />
                          Hit <strong>Export MP4</strong>, drag the video into any editor (like Premiere Pro, CapCut, or AfterEffects), and apply a <em>Green Screen / Keying</em> filter to remove the background. 
                          You can then easily add your own screen recordings or background videos underneath the transparent layer!
                        </p>
                      </div>
                    </div>
                    
                    <VideoPreview 
                      script={project.script_json} 
                      aspectRatio={studioSettings.aspectRatio} 
                    />
                
                <ExportSettings 
                  aspectRatio={studioSettings.aspectRatio}
                  setAspectRatio={studioSettings.setAspectRatio}
                  voices={studioSettings.voices}
                  voiceId={studioSettings.voiceId}
                  setVoiceId={studioSettings.setVoiceId}
                  pitch={studioSettings.pitch}
                  setPitch={studioSettings.setPitch}
                  previewLoading={studioSettings.previewLoading}
                  handlePreviewVoice={studioSettings.handlePreviewVoice}
                  voiceLoading={studioSettings.voiceLoading}
                  handleGenerateVoiceover={studioSettings.handleGenerateVoiceover}
                  renderLoading={studioSettings.renderLoading}
                  handleRenderMp4={studioSettings.handleRenderMp4}
                />
              </>
            )}
          </motion.div>
        )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--p-bg)", color: "var(--p-fg)" }}>Loading Workspace...</div>}>
      <StudioContent />
    </Suspense>
  );
}
