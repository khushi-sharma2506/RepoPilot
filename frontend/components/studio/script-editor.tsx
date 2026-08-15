"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Script, Scene } from "@/lib/schemas";
import { Send, Undo2, Redo2, Pencil, Check, X, Plus, Trash2, ChevronLeft, Sparkles } from "lucide-react";
import { updateScene } from "@/lib/pilot-api";

// ─── Per-Scene Edit Card ───────────────────────────────────────────────
function SceneCard({
  scene,
  idx,
  projectId,
  onSave,
  onDelete,
  onAddAfter,
  onAskAI,
}: {
  scene: Scene;
  idx: number;
  projectId: number;
  onSave: (idx: number, updated: Scene) => void;
  onDelete: (idx: number) => void;
  onAddAfter: (idx: number) => void;
  onAskAI: (idx: number, prompt: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(scene);
  const [saving, setSaving] = useState(false);

  // Sync draft if parent updates this scene
  useEffect(() => { setDraft(scene); }, [scene]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateScene(projectId, idx, draft);
      onSave(idx, draft);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Estimated narration time: ~2.5 words/sec
  const wordCount = scene.narration.trim().split(/\s+/).length;
  const estimatedSecs = Math.ceil(wordCount / 2.5);
  const mismatch = scene.duration_seconds < estimatedSecs;

  return (
    <div className={`rounded-xl border transition-all ${editing ? "border-blue-400 dark:border-blue-500 shadow-lg" : "border-neutral-200 dark:border-neutral-800"} bg-white dark:bg-neutral-950 overflow-hidden`}>
      {/* Scene header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden pr-2">
          <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 shrink-0">SCENE {scene.scene_number}</span>
          {mismatch && !editing && (
            <button
              onClick={() => {
                const snapped = { ...scene, duration_seconds: estimatedSecs + 0.5 };
                onSave(idx, snapped);
              }}
              className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800/50 transition cursor-pointer flex items-center gap-1 shadow-sm shrink-0 md:shrink text-left leading-tight"
              title={`Narration takes ~${estimatedSecs}s to speak but scene is only ${scene.duration_seconds}s. Click to auto-fix.`}
            >
              <span className="hidden sm:inline">⚠ Voice cut off <span className="opacity-50">|</span> Click to snap to ~{estimatedSecs + 0.5}s</span>
              <span className="sm:hidden">⚠ Voice cut off<br/><span className="opacity-75">Click to snap to ~{estimatedSecs + 0.5}s</span></span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-neutral-400 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                <Pencil size={14} />
              </button>
              <button onClick={() => onAddAfter(idx)} className="p-1.5 rounded-lg text-neutral-400 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                <Plus size={14} />
              </button>
              <button onClick={() => onDelete(idx)} className="p-1.5 rounded-lg text-neutral-400 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving} className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
                <Check size={14} />
              </button>
              <button onClick={() => { setDraft(scene); setEditing(false); }} className="p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scene body */}
      <div className="p-4 space-y-3">
        {editing ? (
          <>
            <div>
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1 block">Visual Hint</label>
              <input
                value={draft.visual_hint}
                onChange={(e) => setDraft({ ...draft, visual_hint: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1 block">Narration</label>
              <textarea
                rows={3}
                value={draft.narration}
                onChange={(e) => setDraft({ ...draft, narration: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <div className="text-xs text-neutral-400 dark:text-neutral-400 mt-1">
                ~{draft.narration.trim().split(/\s+/).length} words · ~{Math.ceil(draft.narration.trim().split(/\s+/).length / 2.5)}s to speak
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={14} />
                Ask AI to rewrite this scene
              </label>
              <form 
                className="relative flex items-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('aiPrompt') as HTMLInputElement;
                  if (input.value.trim()) {
                    onAskAI(idx, input.value.trim());
                    input.value = '';
                    setEditing(false); // Close edit mode and let AI take over
                  }
                }}
              >
                <input
                  name="aiPrompt"
                  type="text"
                  placeholder="e.g. 'Make it exactly 10s' or 'Make it sound technical'"
                  className="w-full text-sm pl-3 pr-10 py-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 text-neutral-900 dark:text-white placeholder-blue-400/60 dark:placeholder-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button type="submit" className="absolute right-2 p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition">
                  <Send size={14} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 italic">🎥 {scene.visual_hint}</div>
            <div className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">"{scene.narration}"</div>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${mismatch ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`}>
                {scene.duration_seconds}s scene
              </span>
              <span className="text-neutral-400 dark:text-neutral-400">~{estimatedSecs}s to speak</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Script Editor ───────────────────────────────────────────────
export function ScriptEditor({
  script,
  chatHistory,
  chatInput,
  setChatInput,
  chatLoading,
  sendMessage,
  projectId,
  onScriptChange,
  onBack,
}: {
  script: Script;
  chatHistory: { role: string; text: string; isProposal?: boolean; proposedScript?: any }[];
  chatInput: string;
  setChatInput: (v: string) => void;
  chatLoading: boolean;
  sendMessage: (overrideMsg?: string) => void;
  projectId: number;
  onScriptChange: (updated: Script) => void;
  onBack: () => void;
}) {
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [undoStack, setUndoStack] = useState<Script[]>([]);
  const [redoStack, setRedoStack] = useState<Script[]>([]);
  const [mobileTab, setMobileTab] = useState<"script" | "chat">("script");

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, chatLoading]);

  const pushUndo = useCallback((prev: Script) => {
    setUndoStack((s) => [...s.slice(-19), prev]);
    setRedoStack([]);
  }, []);

  const handleUndo = () => {
    if (!undoStack.length) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, script]);
    setUndoStack((s) => s.slice(0, -1));
    onScriptChange(prev);
  };

  const handleRedo = () => {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((s) => [...s, script]);
    setRedoStack((r) => r.slice(0, -1));
    onScriptChange(next);
  };

  const handleSceneSave = (idx: number, updated: Scene) => {
    pushUndo(script);
    const scenes = [...script.scenes];
    scenes[idx] = updated;
    onScriptChange({ scenes });
  };

  const handleDeleteScene = (idx: number) => {
    if (script.scenes.length <= 1) return;
    pushUndo(script);
    const scenes = script.scenes.filter((_, i) => i !== idx).map((s, i) => ({ ...s, scene_number: i + 1 }));
    onScriptChange({ scenes });
  };

  const handleAddSceneAfter = (idx: number) => {
    pushUndo(script);
    const newScene: Scene = {
      scene_number: idx + 2,
      visual_hint: "New scene — describe what to show on screen",
      narration: "Add your narration here.",
      duration_seconds: 8,
    };
    const scenes = [
      ...script.scenes.slice(0, idx + 1),
      newScene,
      ...script.scenes.slice(idx + 1),
    ].map((s, i) => ({ ...s, scene_number: i + 1 }));
    onScriptChange({ scenes });
  };

  const totalDuration = script.scenes.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  const totalMins = Math.floor(totalDuration / 60);
  const totalSecs = Math.round(totalDuration % 60);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      {/* Back button + header */}
      <div className="flex flex-col items-center mb-6 px-4 relative pt-10 md:pt-0">
        <button
          onClick={onBack}
          className="absolute left-4 top-0 md:top-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
        >
          <ChevronLeft size={16} /> <span className="hidden sm:inline">Change Angle</span><span className="sm:hidden">Back</span>
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-1 text-center">Script Studio</h2>
        <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 text-center">Edit scenes directly or chat with the Director Agent.</p>
      </div>

      {/* Total Duration Bar */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 md:px-5 py-3 shadow-sm">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 hidden sm:inline">Total Duration:</span>
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 sm:hidden">Duration:</span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {totalMins > 0 ? `${totalMins}m ` : ""}{totalSecs}s
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-400">({script.scenes.length} scenes)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={!undoStack.length}
            title="Undo"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <Undo2 size={14} />
            {undoStack.length > 0 && <span className="text-[10px] bg-neutral-200 dark:bg-neutral-700 px-1.5 rounded-full">{undoStack.length}</span>}
          </button>
          <button
            onClick={handleRedo}
            disabled={!redoStack.length}
            title="Redo"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <Redo2 size={14} />
            {redoStack.length > 0 && <span className="text-[10px] bg-neutral-200 dark:bg-neutral-700 px-1.5 rounded-full">{redoStack.length}</span>}
          </button>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="lg:hidden flex bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl mb-6 w-full max-w-sm mx-auto">
        <button
          onClick={() => setMobileTab("script")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${mobileTab === "script" ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
        >
          Script Scenes
        </button>
        <button
          onClick={() => setMobileTab("chat")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${mobileTab === "chat" ? "bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
        >
          <Sparkles size={14} /> Director AI
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left: Scene Cards */}
        <div className={`${mobileTab === "script" ? "block" : "hidden"} lg:block space-y-3 max-h-[75vh] overflow-y-auto pr-1`}>
          {script?.scenes?.map((scene, idx) => (
            <SceneCard
              key={idx}
              scene={scene}
              idx={idx}
              projectId={projectId}
              onSave={handleSceneSave}
              onDelete={handleDeleteScene}
              onAddAfter={handleAddSceneAfter}
              onAskAI={(sceneIdx, prompt) => {
                sendMessage(`For Scene ${sceneIdx + 1}: ${prompt}`);
                setMobileTab("chat");
              }}
            />
          ))}
          {/* Add scene at end */}
          <button
            onClick={() => handleAddSceneAfter(script.scenes.length - 1)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-400 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition text-sm flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Scene
          </button>
        </div>

        {/* Right: Director Agent Chat */}
        <div className={`${mobileTab === "chat" ? "flex" : "hidden"} lg:flex bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex-col h-[65vh] lg:h-[75vh] shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
            <h3 className="text-base font-bold text-center text-neutral-900 dark:text-white">Director Agent</h3>
            <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-0.5">Try: "make it 60 seconds" · "make scene 2 punchier"</p>
          </div>

          <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatHistory.map((msg, idx) => (
              <div key={idx}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
                {/* Proposal yes/no buttons */}
                {msg.isProposal && msg.proposedScript && (
                  <div className="flex justify-start mt-2 gap-2 ml-1">
                    <button
                      onClick={() => {
                        pushUndo(script);
                        onScriptChange(msg.proposedScript);
                      }}
                      className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shadow"
                    >
                      ✓ Yes, Apply
                    </button>
                    <button
                      className="px-4 py-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-300 dark:hover:bg-neutral-600 transition"
                    >
                      ✗ No, Keep
                    </button>
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-2xl rounded-bl-sm p-3.5 text-sm flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Make it 60 seconds, focus on the API..."
                disabled={chatLoading}
                className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-40 transition"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
