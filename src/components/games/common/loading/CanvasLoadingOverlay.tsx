import React from "react";

interface CanvasLoadingOverlayProps {
  show: boolean;
}

export function CanvasLoadingOverlay({ show }: CanvasLoadingOverlayProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="absolute inset-0" style={{ backgroundColor: "#478269" }}>
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-white text-xl font-['Minecraft']">
          Loading Game...
        </span>
      </div>
    </div>
  );
}
