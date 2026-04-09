import React from 'react';

const GrainOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none opacity-35">
      <svg className="w-full h-full">
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.65" 
            numOctaves="3" 
            stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
};

export default GrainOverlay;
