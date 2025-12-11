'use client';

import { Plus } from 'lucide-react';

interface CreateLobbyCardProps {
  onCreate?: () => void;
}

export function CreateLobbyCard({ onCreate }: CreateLobbyCardProps) {
  return (
    <div className="bg-[#16171E] rounded-2xl overflow-hidden w-full flex flex-col border border-[#FFFFFF16] border-dashed min-h-[320px]">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        {/* Title */}
        <h3 className="text-white font-semibold text-lg">Start New Lobby</h3>

        {/* Plus Icon */}
        <div className="w-16 h-16 rounded-full border border-[#FFFFFF29] flex items-center justify-center">
          <Plus className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Create Button - Full width at bottom */}
      <div className="p-4 pt-0">
        <button
          onClick={onCreate}
          className="w-full py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
        >
          Create
        </button>
      </div>
    </div>
  );
}

