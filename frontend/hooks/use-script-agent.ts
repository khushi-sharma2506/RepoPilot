import { useState } from "react";
import { sendChatMessage } from "@/lib/pilot-api";
import { Project } from "@/lib/schemas";

export function useScriptAgent(project: Project | null, setProject: (p: Project) => void) {
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([
    { role: "ai", text: "Hi! I'm the Script Editor Agent. Review the script on the left. Want it to be punchier? Need to add a specific feature? Tell me how to change it and I'll update the script instantly." }
  ]);

  const sendMessage = async () => {
    if (!project?.id || !chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const data = await sendChatMessage(project.id, userMsg, chatHistory.slice(-5));
      const aiReply = data.reply || "I've updated the script! Check it out on the left. Anything else?";
      setChatHistory((prev) => [...prev, { role: "ai", text: aiReply }]);
      
      if (data.updated_script) {
        setProject({ ...project, script_json: data.updated_script });
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
    sendMessage
  };
}
