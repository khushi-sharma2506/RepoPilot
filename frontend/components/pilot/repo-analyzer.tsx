import React, { useState } from "react";
import { ArrowRight, GitBranch } from "lucide-react";

export function RepoAnalyzer({ onAnalyze }: { onAnalyze: (url: string) => void }) {
  const [url, setUrl] = useState("");

  return (
    <div className="max-w-xl mx-auto bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-400">Repository URL</label>
          <div className="relative">
            <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/user/repo" 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button 
          onClick={() => onAnalyze(url)}
          disabled={!url}
          className="w-full bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg py-3 flex items-center justify-center gap-2 transition-colors"
        >
          Analyze Repository
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
