import { getSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session: any = await getSession();
  const headers = new Headers(options.headers || {});
  
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  
  return fetch(url, { ...options, headers });
}

export async function analyzeRepo(url: string) {
  const res = await fetchWithAuth(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ github_url: url })
  });
  if (!res.ok) throw new Error("Failed to analyze repo");
  return res.json();
}

export async function pollProjectStatus(id: number) {
  const res = await fetchWithAuth(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error("Failed to poll status");
  return res.json();
}

export async function generateScript(id: number, storyIndex: number) {
  const res = await fetchWithAuth(`${API_BASE}/projects/${id}/script`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ story_index: storyIndex })
  });
  if (!res.ok) throw new Error("Failed to generate script");
  return res.json();
}

export async function sendChatMessage(id: number, prompt: string, history: any[]) {
  const res = await fetchWithAuth(`${API_BASE}/projects/${id}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, history })
  });
  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}

export async function fetchVoices() {
  const res = await fetchWithAuth(`${API_BASE}/voices`);
  if (!res.ok) throw new Error("Failed to fetch voices");
  const data = await res.json();
  return data.voices || [];
}

export async function previewVoice(voiceId: string, pitch: string) {
  const res = await fetchWithAuth(`${API_BASE}/voice-preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voice_id: voiceId, pitch })
  });
  if (!res.ok) throw new Error("Failed to preview voice");
  return res.json();
}

export async function generateVoiceover(id: number, voiceId: string, pitch: string) {
  const res = await fetchWithAuth(`${API_BASE}/projects/${id}/voice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voice_id: voiceId, pitch })
  });
  if (!res.ok) throw new Error("Failed to generate voiceover");
  return res.json();
}

export async function renderMp4(script: any, aspectRatio: string) {
  const res = await fetch("/api/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ script, aspect_ratio: aspectRatio })
  });
  if (!res.ok) throw new Error("Render failed");
  return res.blob();
}
