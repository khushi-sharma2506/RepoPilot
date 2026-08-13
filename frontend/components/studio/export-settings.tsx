import React from "react";
import { Voice } from "@/lib/schemas";
import { Play, Mic, Download } from "lucide-react";

export function ExportSettings({
  aspectRatio, setAspectRatio,
  voices, voiceId, setVoiceId,
  pitch, setPitch,
  previewLoading, handlePreviewVoice,
  voiceLoading, handleGenerateVoiceover,
  renderLoading, handleRenderMp4
}: {
  aspectRatio: string; setAspectRatio: (v: string) => void;
  voices: Voice[]; voiceId: string; setVoiceId: (v: string) => void;
  pitch: number; setPitch: (v: number) => void;
  previewLoading: boolean; handlePreviewVoice: () => void;
  voiceLoading: boolean; handleGenerateVoiceover: () => void;
  renderLoading: boolean; handleRenderMp4: () => void;
}) {
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
          onClick={handleRenderMp4}
          disabled={renderLoading}
          className="bg-white text-black hover:bg-neutral-200 disabled:opacity-50 py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors"
        >
          {renderLoading ? <span className="animate-spin">●</span> : <Download size={16} />}
          Export MP4
        </button>
      </div>
    </div>
  );
}
