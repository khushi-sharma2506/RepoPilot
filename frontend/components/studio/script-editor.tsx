import React, { useRef, useEffect } from "react";
import { Script } from "@/lib/schemas";
import { Send } from "lucide-react";

export function ScriptEditor({ 
  script, 
  chatHistory, 
  chatInput, 
  setChatInput, 
  chatLoading, 
  sendMessage 
}: { 
  script: Script;
  chatHistory: { role: string; text: string }[];
  chatInput: string;
  setChatInput: (v: string) => void;
  chatLoading: boolean;
  sendMessage: () => void;
}) {
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, chatLoading]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col items-center mb-8 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-2 text-center">Refine Your Script</h2>
        <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 text-center">Chat with the Director Agent to adjust scenes, tone, or timing.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto min-h-[500px] lg:h-[70vh] lg:min-h-[600px]">
        {/* Left: Script Preview */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col h-full shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
            <h3 className="text-lg font-bold text-center text-neutral-900 dark:text-white">Current Script Scenes</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-6 space-y-4">
            {script?.scenes?.map((scene, idx) => (
              <div key={idx} className="p-4 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div className="text-xs font-mono text-neutral-500 text-center mb-2 flex justify-between">
                  <span>SCENE {scene.scene_number}</span>
                  <span className="text-blue-600 dark:text-blue-400">{scene.duration_seconds}s</span>
                </div>
                <div className="text-sm font-medium mb-2 text-center text-neutral-800 dark:text-neutral-200">🎥 {scene.visual_hint}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center italic">🎙️ "{scene.narration}"</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Chatbot */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col h-[500px] lg:h-full shadow-2xl overflow-hidden mt-8 lg:mt-0">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
            <h3 className="text-lg font-bold text-center text-neutral-900 dark:text-white">Director Agent</h3>
          </div>
          <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto space-y-6">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-md ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-sm"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-2xl rounded-bl-sm p-4 text-sm flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Make it punchier, focus on the backend..."
                disabled={chatLoading}
                className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full px-6 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 shadow-inner"
              />
              <button 
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-50 transition-opacity"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
