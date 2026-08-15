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
  
  const [toastMessage, setToastMessage] = useState<{title: string, type: "success" | "error"} | null>(null);

  const showToast = (title: string, type: "success" | "error") => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

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
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to preview voice", "error");
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
      showToast("AI Voiceover generated successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to generate voiceovers.", "error");
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
      showToast("Failed to render MP4", "error");
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
    toastMessage,
    handlePreviewVoice,
    handleGenerateVoiceover,
    handleRenderMp4
  };
}
