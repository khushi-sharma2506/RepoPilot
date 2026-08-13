import React from "react";
import { AbsoluteFill, useVideoConfig, Sequence } from "remotion";
import { SceneRenderer } from "./scene-renderer";
import { Script } from "@/lib/schemas";

export const VideoComposition: React.FC<{ script: Script }> = ({ script }) => {
  const { fps } = useVideoConfig();
  const scenes = script?.scenes || [];

  if (scenes.length === 0) return <AbsoluteFill style={{ backgroundColor: "#00FF00" }} />;

  let cumulativeFrames = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#00FF00" }}>
      {scenes.map((scene, idx) => {
        const durationFrames = (scene.duration_seconds || 5) * fps;
        const startFrame = cumulativeFrames;
        cumulativeFrames += durationFrames;
        
        return (
          <Sequence key={idx} from={startFrame} durationInFrames={durationFrames}>
            <SceneRenderer scene={scene} durationFrames={durationFrames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
