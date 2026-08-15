import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio } from "remotion";
import { Scene } from "@/lib/schemas";

export const SceneRenderer: React.FC<{ scene: Scene; durationFrames: number }> = ({ scene, durationFrames }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 10, durationFrames - 10, durationFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleY = interpolate(frame, [5, 20], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: "#00FF00", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: 40, left: 40, backgroundColor: "rgba(0,0,0,0.7)", padding: "16px 24px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.2)", maxWidth: 600 }}>
        <div style={{ color: "#FFD700", fontFamily: "sans-serif", fontSize: 16, fontWeight: "bold", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.1em" }}>
          🎬 Scene {scene.scene_number} - Director Note
        </div>
        <div style={{ color: "white", fontFamily: "sans-serif", fontSize: 20, lineHeight: 1.4 }}>
          {scene.visual_hint}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: subtitleOpacity, transform: `translateY(${subtitleY}px)` }}>
        <div style={{ backgroundColor: "rgba(0,0,0,0.85)", padding: "20px 40px", borderRadius: 24, maxWidth: "80%", textAlign: "center", border: "3px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          <p style={{
            color: "white", 
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
            fontSize: 48, 
            fontWeight: 800, 
            lineHeight: 1.3,
            textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000"
          }}>
            {scene.narration}
          </p>
        </div>
      </div>

      {scene.audio_url && (
        <Audio 
          src={scene.audio_url.startsWith('/') 
            ? `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8000'}${scene.audio_url}` 
            : scene.audio_url} 
        />
      )}
    </AbsoluteFill>
  );
};
