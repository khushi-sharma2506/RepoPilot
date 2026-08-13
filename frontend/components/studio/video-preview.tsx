import React from "react";
import { Player } from "@remotion/player";
import { VideoComposition } from "@/components/engine/composition";
import { Script } from "@/lib/schemas";

export function VideoPreview({ script, aspectRatio }: { script: Script; aspectRatio: string }) {
  const totalFrames = script?.scenes
    ? script.scenes.reduce((sum, s) => sum + (s.duration_seconds || 5) * 30, 0)
    : 150; // default 5s if empty

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-black ${aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[80vh]' : 'aspect-video'}`}>
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
