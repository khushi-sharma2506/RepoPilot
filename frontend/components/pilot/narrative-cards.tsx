import React from "react";
import { StoryAngle } from "@/lib/schemas";
import { ChevronRight } from "lucide-react";

export function NarrativeCards({ stories, onSelect }: { stories: StoryAngle[]; onSelect: (index: number) => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Choose a Narrative Angle</h2>
        <p className="text-neutral-400">The Story Agent has recommended these angles for your demo.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories.map((story, idx) => (
          <div 
            key={idx}
            onClick={() => onSelect(idx)}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 cursor-pointer hover:border-neutral-700 hover:bg-neutral-800/50 transition-all flex flex-col group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                {story.theme}
              </span>
              <ChevronRight className="text-neutral-600 group-hover:text-white transition-colors" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">{story.title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed flex-1">
              {story.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
