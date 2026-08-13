"use client";

import React, { useState, useEffect } from "react";
import { Script } from "@/lib/schemas";

// Dynamically import Player to prevent SSR crash (window/document not available server-side)
let Player: any = null;
let VideoComposition: any = null;

export function VideoPreview({ script, aspectRatio }: { script: Script; aspectRatio: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Only load Remotion in the browser
    Promise.all([
      import("@remotion/player"),
      import("@/components/engine/composition"),
    ]).then(([playerMod, compMod]) => {
      Player = playerMod.Player;
      VideoComposition = compMod.VideoComposition;
      setReady(true);
    });
  }, []);

  const totalFrames = script?.scenes
    ? script.scenes.reduce((sum, s) => sum + (s.duration_seconds || 5) * 30, 0)
    : 150;

  if (!ready) {
    return (
      <div className={`w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-black flex items-center justify-center ${aspectRatio === "9:16" ? "aspect-[9/16] max-h-[80vh]" : "aspect-video"}`}>
        <span className="text-neutral-500 text-sm">Loading player...</span>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-black ${aspectRatio === "9:16" ? "aspect-[9/16] max-h-[80vh]" : "aspect-video"}`}>
      <Player
        component={VideoComposition}
        inputProps={{ script }}
        durationInFrames={totalFrames}
        compositionWidth={aspectRatio === "9:16" ? 1080 : 1920}
        compositionHeight={aspectRatio === "9:16" ? 1920 : 1080}
        fps={30}
        style={{ width: "100%", height: "100%" }}
        controls
        autoPlay
      />
    </div>
  );
}
