import React, { useState, useEffect } from "react";
import { ArrowRight, GitBranch, Lock, Globe, Loader2, Search } from "lucide-react";
import { fetchUserRepos } from "@/lib/pilot-api";
import { motion } from "motion/react";

interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
}

export function RepoAnalyzer({ onAnalyze }: { onAnalyze: (url: string) => void }) {
  const [url, setUrl] = useState("");
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUserRepos()
      .then((data) => {
        setRepos(data.repos || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load repos:", err);
        setError("Failed to load your repositories. Please paste a URL below.");
        setLoading(false);
      });
  }, []);

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(search.toLowerCase()) || 
    (repo.description && repo.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-3xl mx-auto w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-2xl shadow-2xl">
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Select a Repository</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Choose one of your GitHub repositories to analyze and generate a cinematic demo video.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Loading your repositories...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm mb-6 border border-red-100 dark:border-red-900/50">
          {error}
        </div>
      ) : (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your repositories..." 
              className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 pl-10 pr-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredRepos.length > 0 ? (
              filteredRepos.map(repo => (
                <motion.div 
                  key={repo.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAnalyze(repo.html_url)}
                  className="flex flex-col p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-neutral-900 dark:text-white truncate pr-2 flex items-center gap-2">
                      <GitBranch size={14} className="text-neutral-400" />
                      {repo.name}
                    </div>
                    {repo.private ? (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 rounded-full shrink-0">
                        <Lock size={10} /> Private
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500 rounded-full shrink-0">
                        <Globe size={10} /> Public
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {repo.description || "No description provided."}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-sm text-neutral-500">
                No repositories found matching "{search}".
              </div>
            )}
          </div>
        </>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Or paste a custom URL
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="relative">
          <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-400" size={18} />
          <input 
            type="url" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo" 
            className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <button 
          onClick={() => onAnalyze(url)}
          disabled={!url}
          className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg py-3 flex items-center justify-center gap-2 transition-colors"
        >
          Analyze Custom URL
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
