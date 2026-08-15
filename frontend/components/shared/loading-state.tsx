import React, { useState, useEffect } from "react";

export function LoadingState({ title, subtitle, type = "default" }: { title: string; subtitle: string; type?: "default" | "render" | "voice" }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (type === "render" || type === "voice") {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p < 90) return p + Math.random() * 5;
          return p;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [type]);

  return (
    <div className="max-w-2xl mx-auto w-full p-8 md:p-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl space-y-8 flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-neutral-900 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
      
      <div className="space-y-2 text-center w-full">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{title}</h2>
        <p className="text-neutral-600 dark:text-neutral-400">{subtitle}</p>
        
        {title.includes("Analyzing") && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4 italic">
            This process typically takes 30-60 seconds as the AI reads your repository.
          </p>
        )}

        {type === "render" && (
          <div className="mt-8 space-y-4 w-full">
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] md:text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide px-1">
              <span className={progress >= 0 ? "text-blue-600 dark:text-blue-400" : ""}>Bundling</span>
              <span className={progress >= 30 ? "text-blue-600 dark:text-blue-400" : ""}>Rendering Frames</span>
              <span className={progress >= 60 ? "text-blue-600 dark:text-blue-400" : ""}>Audio Mix</span>
              <span className={progress >= 90 ? "text-blue-600 dark:text-blue-400" : ""}>Finalizing</span>
            </div>
          </div>
        )}

        {type === "voice" && (
          <div className="mt-8 space-y-4 w-full">
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] md:text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide px-1">
              <span className={progress >= 0 ? "text-emerald-600 dark:text-emerald-400" : ""}>Connecting</span>
              <span className={progress >= 25 ? "text-emerald-600 dark:text-emerald-400" : ""}>Synthesizing</span>
              <span className={progress >= 60 ? "text-emerald-600 dark:text-emerald-400" : ""}>Applying Pitch</span>
              <span className={progress >= 85 ? "text-emerald-600 dark:text-emerald-400" : ""}>Syncing</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
