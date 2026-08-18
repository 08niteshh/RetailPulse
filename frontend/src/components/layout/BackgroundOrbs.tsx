import React from 'react';

export const BackgroundOrbs: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top Left Electric Blue Glow Orb */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/15 blur-[120px] mix-blend-screen animate-pulse" 
        style={{ animationDuration: '8s' }}
      />

      {/* Top Right Vivid Violet Orb */}
      <div 
        className="absolute -top-20 right-10 w-[32rem] h-[32rem] rounded-full bg-violet-600/15 blur-[140px] mix-blend-screen" 
      />

      {/* Center Cyber Cyan Ambient Glow */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-cyan-500/10 blur-[160px] mix-blend-screen" 
      />

      {/* Bottom Left Deep Purple Orb */}
      <div 
        className="absolute bottom-10 -left-20 w-[30rem] h-[30rem] rounded-full bg-purple-700/15 blur-[130px] mix-blend-screen" 
      />

      {/* Bottom Right Emerald Accent Glow */}
      <div 
        className="absolute -bottom-32 right-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen" 
      />

      {/* Faint Perspective Grid Plane */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60" />

      {/* Subtle Depth Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050816]/40 to-[#050816]/90" />
    </div>
  );
};
