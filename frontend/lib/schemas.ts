export interface Scene {
  scene_number: number;
  visual_hint: string;
  narration: string;
  duration_seconds: number;
  audio_url?: string;
}

export interface Script {
  scenes: Scene[];
}

export interface StoryAngle {
  title: string;
  theme: string;
  description: string;
}

export interface Project {
  id: number;
  github_url: string;
  status: string;
  repo_analysis_json: any;
  story_json: StoryAngle[];
  script_json: Script;
  created_at: string;
  updated_at: string;
}

export interface Voice {
  ShortName: string;
  FriendlyName: string;
  Gender: string;
}
