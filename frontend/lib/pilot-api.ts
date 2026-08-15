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
export async function getProjects() {
  const res = await fetchWithAuth(`${API_BASE}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function fetchUserRepos() {
  const res = await fetchWithAuth(`${API_BASE}/github/repos`);
  if (!res.ok) throw new Error("Failed to fetch user repositories");
  return res.json();
}

export async function pollProjectStatus(id: number) {
  const res = await fetchWithAuth(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error("Failed to poll status");
  return res.json();
}

export async function generateScript(id: number, storyIndex: number, targetDurationSeconds: number = 75) {
  const res = await fetchWithAuth(`${API_BASE}/projects/${id}/script`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ story_index: storyIndex, target_duration_seconds: targetDurationSeconds })
  });
  if (!res.ok) throw new Error("Failed to generate script");
  return res.json();
}

export async function updateScene(id: number, sceneIndex: number, scene: object) {
  const res = await fetchWithAuth(`${API_BASE}/projects/${id}/scene/${sceneIndex}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scene })
  });
  if (!res.ok) throw new Error("Failed to update scene");
  return res.json();
}

export async function saveScript(id: number, scenes: object[]) {
  const res = await fetchWithAuth(`${API_BASE}/projects/${id}/script`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenes })
  });
  if (!res.ok) throw new Error("Failed to save script");
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
