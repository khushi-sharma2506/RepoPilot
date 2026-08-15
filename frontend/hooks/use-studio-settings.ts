import { useState, useEffect } from "react";
import { Voice, Project } from "@/lib/schemas";
import { fetchVoices, previewVoice, generateVoiceover, renderMp4 } from "@/lib/pilot-api";

export function useStudioSettings(project: Project | null, setProject: (p: Project) => void, status: string) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState("en-US-ChristopherNeural");
  const [pitch, setPitch] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  
  const [previewLoading, setPreviewLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [renderLoading, setRenderLoading] = useState(false);

  useEffect(() => {
    if (status === "preview" && voices.length === 0) {
      fetchVoices()
        .then((v) => setVoices(v))
        .catch(console.error);
    }
  }, [status, voices.length]);

  const handlePreviewVoice = async () => {
    setPreviewLoading(true);
    try {
      const data = await previewVoice(voiceId, `${pitch >= 0 ? "+" : ""}${pitch}Hz`);
      if (!data.audio_url) throw new Error("Audio generation failed on backend");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8000';
      const audioUrl = typeof data.audio_url === 'string' && data.audio_url.startsWith('/') ? `${baseUrl}${data.audio_url}` : data.audio_url;
      const audio = new window.Audio(audioUrl);
      audio.play();
    } catch (e) {
      console.error(e);
      alert("Failed to preview voice");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerateVoiceover = async () => {
    if (!project?.id) return;
    setVoiceLoading(true);
    try {
      const updatedScript = await generateVoiceover(project.id, voiceId, `${pitch >= 0 ? "+" : ""}${pitch}Hz`);
      setProject({ ...project, script_json: updatedScript });
      alert("AI Voiceover generated successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to generate voiceover.");
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleRenderMp4 = async () => {
    if (!project?.script_json) return;
    setRenderLoading(true);
    try {
      const blob = await renderMp4(project.script_json, aspectRatio);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `repopilot-${project.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to render MP4");
    } finally {
      setRenderLoading(false);
    }
  };

  return {
    voices,
    voiceId,
    setVoiceId,
    pitch,
    setPitch,
    aspectRatio,
    setAspectRatio,
    previewLoading,
    voiceLoading,
    renderLoading,
    handlePreviewVoice,
    handleGenerateVoiceover,
    handleRenderMp4
  };
}
