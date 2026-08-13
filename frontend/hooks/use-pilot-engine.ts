import { useState, useEffect } from "react";
import { Project } from "@/lib/schemas";
import { analyzeRepo, pollProjectStatus, generateScript } from "@/lib/pilot-api";
import { useRouter, useSearchParams } from "next/navigation";

export type AppStatus = "idle" | "analyzing" | "stories" | "generating_script" | "script_editing" | "preview" | "failed";

export function usePilotEngine() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("projectId");

  const [status, setStatus] = useState<AppStatus>("idle");
  const [project, setProject] = useState<Project | null>(null);
  const [progress, setProgress] = useState<string>("Initializing...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialProjectId && status === "idle") {
      pollProjectStatus(parseInt(initialProjectId))
        .then((data) => {
          setProject(data);
          if (data.status === "failed") {
            setStatus("failed");
            setErrorMsg(data.error_message || "Analysis failed.");
          } else if (data.script_json) {
            setStatus("preview"); // Default to preview if script exists
          } else if (data.story_json) {
            setStatus("stories");
          } else if (data.status === "analyzing") {
            setStatus("analyzing");
          }
        })
        .catch(console.error);
    }
  }, [initialProjectId, status]);

  useEffect(() => {
    if (project?.id) {
      router.replace(`?projectId=${project.id}`, { scroll: false });
    }
  }, [project?.id, router]);

  const startAnalysis = async (url: string) => {
    setStatus("analyzing");
    setProgress("Connecting to backend...");
    setErrorMsg(null);
    try {
      const data = await analyzeRepo(url);
      setProject(data);
    } catch (err) {
      console.error(err);
      setStatus("failed");
      setErrorMsg(err instanceof Error ? err.message : "Failed to connect to backend");
    }
  };

  useEffect(() => {
    if (status === "analyzing" && project?.id) {
      const interval = setInterval(async () => {
        try {
          const data = await pollProjectStatus(project.id);
          if (data.progress) {
            setProgress(data.progress);
          }
          if (data.status === "complete") {
            setProject(data);
            setStatus("stories");
            clearInterval(interval);
          } else if (data.status === "failed") {
            setProject(data);
            setStatus("failed");
            setErrorMsg(data.error_message || "Analysis failed due to an unknown error.");
            clearInterval(interval);
          }
        } catch (e) {
          console.error(e);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status, project?.id]);

  const selectStoryAngle = async (index: number) => {
    if (!project?.id) return;
    setStatus("generating_script");
    try {
      const data = await generateScript(project.id, index);
      setProject({ ...project, script_json: data });
      setStatus("script_editing");
    } catch (err) {
      console.error(err);
      setStatus("stories");
    }
  };

  const resetPilot = () => {
    setStatus("idle");
    setProject(null);
    setErrorMsg(null);
    router.replace("?", { scroll: false });
  };

  return {
    status,
    setStatus,
    project,
    setProject,
    progress,
    errorMsg,
    startAnalysis,
    selectStoryAngle,
    resetPilot
  };
}
