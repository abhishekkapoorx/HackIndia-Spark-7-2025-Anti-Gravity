// components/JustiFiLogo.tsx
import React from "react";

export default function JustiFiLogo({className}: {className?: string}) {
  return (
    
    <div className={`inline-flex items-center ${className}`}>
      {/* “Justi” in a rounded block */}
      <span className="bg-cyan-500 text-white font-bold text-2xl px-3 py-1 rounded-md">
        Justi
      </span>
      {/* “Fi” in matching accent color */}
      <span className="ml-1 text-cyan-500 font-bold text-2xl">
        Fi
      </span>
    </div>
  );
}
