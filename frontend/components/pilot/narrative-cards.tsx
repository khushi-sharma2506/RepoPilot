"use client";
import React from "react";
import { StoryAngle } from "@/lib/schemas";
import { ChevronRight, Clock } from "lucide-react";

const DURATION_OPTIONS = [
  { label: "30 sec", value: 30, desc: "Perfect for a social reel" },
  { label: "1 min", value: 60, desc: "Ideal for LinkedIn / X" },
  { label: "2 min", value: 120, desc: "Great for hackathon demos" },
  { label: "3 min", value: 180, desc: "Full product walkthrough" },
];

export function NarrativeCards({
  stories,
  onSelect,
  targetDuration,
  setTargetDuration,
}: {
  stories: StoryAngle[];
  onSelect: (index: number) => void;
  targetDuration: number;
  setTargetDuration: (d: number) => void;
}) {
  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Choose a Narrative Angle</h2>
        <p className="text-neutral-600 dark:text-neutral-400">The Story Agent has recommended these angles for your demo.</p>
      </div>

      {/* Duration Selector */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Target Video Duration</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTargetDuration(opt.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                targetDuration === opt.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                  : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
              }`}
            >
              <div className="font-bold text-sm">{opt.label}</div>
              <div className="text-xs mt-0.5 opacity-70">{opt.desc}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">Custom (sec):</span>
          <input
            type="number"
            min={15}
            max={600}
            value={targetDuration}
            onChange={(e) => setTargetDuration(Math.max(15, parseInt(e.target.value) || 75))}
            className="w-24 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            → AI will generate ~{Math.max(5, Math.round(targetDuration / 7))} scenes
          </span>
        </div>
      </div>

      {/* Story Angle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories.map((story, idx) => (
          <div
            key={idx}
            onClick={() => onSelect(idx)}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 cursor-pointer hover:border-blue-400 dark:hover:border-neutral-600 hover:shadow-md transition-all flex flex-col group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                {story.theme}
              </span>
              <ChevronRight className="text-neutral-400 dark:text-neutral-600 group-hover:text-blue-500 dark:group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{story.title}</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed flex-1">
              {story.description}
            </p>
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
              ~{Math.max(5, Math.round(targetDuration / 7))} scenes · ~{targetDuration}s
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
