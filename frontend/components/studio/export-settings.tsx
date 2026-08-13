import React, { useState } from "react";
import { Voice } from "@/lib/schemas";
import { Play, Mic, Download, Terminal, X } from "lucide-react";

export function ExportSettings({
  aspectRatio, setAspectRatio,
  voices, voiceId, setVoiceId,
  pitch, setPitch,
  previewLoading, handlePreviewVoice,
  voiceLoading, handleGenerateVoiceover,
}: {
  aspectRatio: string; setAspectRatio: (a: string) => void;
  voices: Voice[]; voiceId: string; setVoiceId: (id: string) => void;
  pitch: number; setPitch: (p: number) => void;
  previewLoading: boolean; handlePreviewVoice: () => void;
  voiceLoading: boolean; handleGenerateVoiceover: () => void;
}) {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="max-w-4xl mx-auto bg-neutral-900 border border-neutral-800 p-8 rounded-2xl space-y-8 mt-8">
      <h3 className="text-2xl font-bold text-white border-b border-neutral-800 pb-4">Video & Audio Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Aspect Ratio</label>
          <select 
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-600"
          >
            <option value="16:9">Landscape (16:9) - YouTube/PC</option>
            <option value="9:16">Portrait (9:16) - Reels/Shorts</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Select AI Voice</label>
          <select 
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-neutral-600"
          >
            {voices.map((v, i) => (
              <option key={i} value={v.ShortName}>{v.FriendlyName || v.ShortName} ({v.Gender})</option>
            ))}
            {voices.length === 0 && <option>Loading voices...</option>}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex justify-between">
            <span>Voice Pitch</span>
            <span className="text-blue-400">{pitch > 0 ? `+${pitch}` : pitch}Hz</span>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-800">
        <button 
          onClick={handlePreviewVoice}
          disabled={previewLoading}
          className="bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
        >
          {previewLoading ? <span className="animate-spin">●</span> : <Play size={16} />}
          Test Voice Pitch
        </button>
        
        <button 
          onClick={handleGenerateVoiceover}
          disabled={voiceLoading}
          className="bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
        >
          {voiceLoading ? <span className="animate-spin">●</span> : <Mic size={16} />}
          Generate All Voiceovers
        </button>
        
        <button 
          onClick={() => setShowExportModal(true)}
          className="bg-white text-black hover:bg-neutral-200 py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors"
        >
          <Download size={16} />
          Export MP4
        </button>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative">
            <button 
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                <Download size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Local Export Required</h2>
                <p className="text-neutral-400 text-sm">Vercel Free Tier Limitations</p>
              </div>
            </div>

            <div className="space-y-4 text-neutral-300">
              <p>
                RepoPilot generates high-quality 1080p MP4s by running a headless Google Chrome browser and FFMPEG underneath the hood. 
              </p>
              <p>
                Because Vercel's free tier has a strict <strong className="text-white">10-second timeout</strong> and <strong className="text-white">50MB size limit</strong>, it is physically impossible to render videos on the live cloud server.
              </p>
              
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 mt-4">
                <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Terminal size={16} className="text-blue-400" />
                  Run this locally to render your MP4:
                </p>
                <code className="block text-emerald-400 text-sm font-mono whitespace-pre-wrap">
                  git clone https://github.com/khushi-sharma2506/RepoPilot.git{"\n"}
                  cd RepoPilot/frontend{"\n"}
                  npm install{"\n"}
                  npm run dev
                </code>
              </div>
              <p className="text-xs text-neutral-500 text-center mt-4">
                Open localhost:3000, hit Export MP4, and it will save directly to your computer!
              </p>
            </div>
            
            <button 
              onClick={() => setShowExportModal(false)}
              className="w-full mt-6 bg-white text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
