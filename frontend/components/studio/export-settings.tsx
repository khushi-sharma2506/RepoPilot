import React, { useState } from "react";
import { Voice } from "@/lib/schemas";
import { Play, Mic, Download, Terminal, X, Archive, Loader2 } from "lucide-react";
import JSZip from "jszip";

export function ExportSettings({
  aspectRatio, setAspectRatio,
  voices, voiceId, setVoiceId,
  pitch, setPitch,
  previewLoading, handlePreviewVoice,
  voiceLoading, handleGenerateVoiceover,
  handleRenderMp4,
  project,
}: {
  aspectRatio: string; setAspectRatio: (a: string) => void;
  voices: Voice[]; voiceId: string; setVoiceId: (id: string) => void;
  pitch: number; setPitch: (p: number) => void;
  previewLoading: boolean; handlePreviewVoice: () => void;
  voiceLoading: boolean; handleGenerateVoiceover: () => void;
  handleRenderMp4: () => void;
  project?: any;
}) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadAssets = async () => {
    if (!project || !project.script_json) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      // Add Script
      const scriptText = project.script_json.scenes.map((s: any, i: number) => `Scene ${i + 1}:\n${s.narration || ''}`).join('\n\n');
      zip.file("script.txt", scriptText);
      zip.file("script.json", JSON.stringify(project.script_json, null, 2));

      // Add Audio
      const scenes = project.script_json.scenes;
      for (let i = 0; i < scenes.length; i++) {
        if (scenes[i].audio_url) {
          try {
            const response = await fetch(scenes[i].audio_url);
            const blob = await response.blob();
            zip.file(`audio/scene_${i + 1}.mp3`, blob);
          } catch (e) {
            console.error(`Failed to fetch audio for scene ${i+1}`);
          }
        }
      }

      // Generate and Download
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.github_url.split('/').pop() || 'repopilot'}_assets.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download assets");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-2xl space-y-8 mt-8 shadow-sm">
      <h3 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-4">Video & Audio Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Aspect Ratio</label>
          <select 
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
          >
            <option value="16:9">Landscape (16:9) - YouTube/PC</option>
            <option value="9:16">Portrait (9:16) - Reels/Shorts</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Select AI Voice</label>
          <select 
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
          >
            {voices.map((v, i) => (
              <option key={i} value={v.ShortName}>{v.FriendlyName || v.ShortName} ({v.Gender})</option>
            ))}
            {voices.length === 0 && <option>Loading voices...</option>}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider flex justify-between">
            <span>Voice Pitch</span>
            <span className="text-blue-600 dark:text-blue-400">{pitch > 0 ? `+${pitch}` : pitch}Hz</span>
          </label>
          <input 
            type="range" 
            min="-50" 
            max="50" 
            value={pitch} 
            onChange={(e) => setPitch(parseInt(e.target.value))}
            className="w-full mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <button 
          onClick={handlePreviewVoice}
          disabled={previewLoading}
          className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-transparent disabled:opacity-50 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
        >
          {previewLoading ? <span className="animate-spin">●</span> : <Play size={16} />}
          Test Voice Pitch
        </button>
        
        <button 
          onClick={handleGenerateVoiceover}
          disabled={voiceLoading}
          className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-transparent disabled:opacity-50 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
        >
          {voiceLoading ? <span className="animate-spin">●</span> : <Mic size={16} />}
          Generate All Voiceovers
        </button>
        
        <button 
          onClick={() => {
            if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
              handleRenderMp4();
            } else {
              setShowExportModal(true);
            }
          }}
          className="bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors shadow-sm"
        >
          <Download size={16} />
          Export MP4
        </button>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative">
            <button 
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                <Download size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Local Rendering Required</h3>
              </div>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-neutral-300">
              <p>
                Vercel Serverless Functions have a strict <strong className="text-neutral-900 dark:text-white">10 second timeout</strong> limit, which is not enough time to run heavy video compilation like FFMPEG and Remotion. 
              </p>
              
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 mt-4">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                  <Terminal size={16} className="text-blue-500 dark:text-blue-400" />
                  Run this locally to render your MP4:
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-neutral-600 dark:text-neutral-300">
                  <li>Clone this repository to your local machine.</li>
                  <li>Run <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-neutral-900 dark:text-white">npm install</code></li>
                  <li>Run <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-neutral-900 dark:text-white">npm run dev</code></li>
                  <li>Visit localhost:3000 and the Export button will work perfectly!</li>
                </ol>
              </div>
            </div>
            
            <button 
              onClick={handleDownloadAssets}
              disabled={isZipping}
              className="w-full mt-6 bg-emerald-600 dark:bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
            >
              {isZipping ? <Loader2 size={20} className="animate-spin" /> : <Archive size={20} />}
              {isZipping ? "Packaging ZIP..." : "Download Assets (.ZIP)"}
            </button>

            <button 
              onClick={() => setShowExportModal(false)}
              className="w-full mt-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold py-3 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
