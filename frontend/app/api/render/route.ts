import { NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';

export async function POST(req: Request) {
  try {
    const { script, aspect_ratio = "16:9" } = await req.json();
    if (!script) {
      return NextResponse.json({ error: "No script provided" }, { status: 400 });
    }
    
    const width = aspect_ratio === "9:16" ? 1080 : 1920;
    const height = aspect_ratio === "9:16" ? 1920 : 1080;
    const tempDir = os.tmpdir();
    const compositionName = "Main";
    const outName = `repopilot-${Date.now()}.mp4`;
    const outPath = path.join(tempDir, outName);
    
    const entryCode = `
import { registerRoot, Composition } from "remotion";
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, Sequence, Audio } from "remotion";

const SceneCard = ({ scene, durationFrames }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, durationFrames - 10, durationFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleY = interpolate(frame, [5, 20], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: "#00FF00", display: "flex", flexDirection: "column" }}>

      <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: subtitleOpacity, transform: "translateY(" + subtitleY + "px)" }}>
        <div style={{ backgroundColor: "rgba(0,0,0,0.85)", padding: "20px 40px", borderRadius: 24, maxWidth: "80%", textAlign: "center", border: "3px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          <p style={{ color: "white", fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 48, fontWeight: 800, lineHeight: 1.3, textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
            {scene.narration}
          </p>
        </div>
      </div>
      {scene.audio_url && <Audio src={"http://localhost:3000" + scene.audio_url} />}
    </AbsoluteFill>
  );
};

const VideoComposition = ({ script }) => {
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
            <SceneCard scene={scene} durationFrames={durationFrames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const Root = () => {
  const totalFrames = ${script.scenes.reduce((sum: number, s: any) => sum + (s.duration_seconds || 5) * 30, 0)};
  return (
    <Composition
      id="Main"
      component={VideoComposition}
      durationInFrames={totalFrames}
      fps={30}
      width={${width}}
      height={${height}}
      defaultProps={{ script: ${JSON.stringify(script)} }}
    />
  );
};

registerRoot(Root);
`;
    const entryFile = path.join(tempDir, `remotion-entry-${Date.now()}.tsx`);
    fs.writeFileSync(entryFile, entryCode);

    const bundled = await bundle({
      entryPoint: entryFile,
      webpackOverride: (config) => config,
    });

    const composition = await selectComposition({
      serveUrl: bundled,
      id: compositionName,
    });

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outPath,
    });

    const fileBuffer = fs.readFileSync(outPath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${outName}"`,
        'Content-Type': 'video/mp4',
      },
    });

  } catch (error: any) {
    console.error("Remotion render error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
