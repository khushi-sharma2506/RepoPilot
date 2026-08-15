import { useState } from "react";
import { sendChatMessage } from "@/lib/pilot-api";
import { Project, Script } from "@/lib/schemas";

type ChatMessage = {
  role: string;
  text: string;
  isProposal?: boolean;
  proposedScript?: Script;
};

export function useScriptAgent(project: Project | null, setProject: (p: Project) => void) {
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Hi! I'm your Director Agent. I can rewrite the whole script, edit a specific scene, or adjust the duration. Try saying:\n• \"Make it 60 seconds\"\n• \"Make scene 2 more exciting\"\n• \"Rewrite everything from a developer's perspective\""
    }
  ]);

  const sendMessage = async (overrideMsg?: string) => {
    const userMsg = (overrideMsg || chatInput).trim();
    if (!project?.id || !userMsg) return;
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    if (!overrideMsg) {
      setChatInput("");
    }
    setChatLoading(true);

    try {
      const data = await sendChatMessage(project.id, userMsg, chatHistory.slice(-6));
      const aiReply = data.reply || "Done! Check the scenes on the left.";

      if (data.updated_script) {
        // Auto-apply immediately (per-scene edits)
        setProject({ ...project, script_json: data.updated_script });
        setChatHistory((prev) => [...prev, { role: "ai", text: aiReply }]);
      } else if (data.proposed_script) {
        // Show with Yes/No confirmation
        setChatHistory((prev) => [
          ...prev,
          {
            role: "ai",
            text: aiReply,
            isProposal: true,
            proposedScript: data.proposed_script,
          },
        ]);
      } else {
        setChatHistory((prev) => [...prev, { role: "ai", text: aiReply }]);
      }
    } catch (e) {
      console.error(e);
      setChatHistory((prev) => [...prev, { role: "ai", text: "Oops, something went wrong. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return {
    chatInput,
    setChatInput,
    chatLoading,
    chatHistory,
    sendMessage,
  };
}
