import React from 'react';
import { Navigation, ShieldCheck } from 'lucide-react';
import { ScreenPosition } from '../../../types/map';

export interface VehicleMarkerProps {
  position?: ScreenPosition;
  headingDegrees?: number;
  batteryPercent?: number;
  model?: string;
  onClick?: () => void;
  className?: string;
}

export const VehicleMarker: React.FC<VehicleMarkerProps> = ({
  position,
  headingDegrees = 32,
  batteryPercent = 76,
  model = 'Your EV',
  onClick,
  className = ''
}) => {
  const styleTransform: React.CSSProperties = position
    ? {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 45
      }
    : {};

  return (
    <div
      style={styleTransform}
      onClick={onClick}
      className={`group cursor-pointer select-none flex flex-col items-center pointer-events-auto ${className}`}
      role="button"
      tabIndex={0}
      aria-label={`${model}, ${batteryPercent}% battery remaining`}
    >
      {/* Floating Micro Tag */}
      <div className="mb-2 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-400/40 backdrop-blur-md shadow-lg flex items-center gap-1.5 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-[11px] font-sans font-semibold text-white tracking-tight">{model}</span>
        <span className="text-slate-400 text-[10px]">·</span>
        <span className="font-mono text-[11px] font-bold text-blue-300 tabular-nums">
          {batteryPercent}%
        </span>
      </div>

      {/* 3D Vehicle Marker with Radar Pulse Ring */}
      <div className="relative flex items-center justify-center">
        {/* Soft Radial Radar Pulse */}
        <div className="absolute w-12 h-12 rounded-full border border-blue-400/40 animate-ping opacity-60 pointer-events-none" />
        <div className="absolute w-8 h-8 rounded-full bg-blue-500/15 pointer-events-none" />

        {/* Directional Vehicle Node */}
        <div className="relative z-10 w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 border border-white shadow-[0_0_20px_rgba(59,130,246,0.8)] flex items-center justify-center transition-transform group-hover:scale-110">
          <Navigation
            className="w-3.5 h-3.5 text-slate-950 fill-slate-950 transition-transform"
            style={{ transform: `rotate(${headingDegrees}deg)` }}
          />
        </div>

        {/* Ground Drop Shadow */}
        <div className="absolute -bottom-1.5 w-6 h-2 bg-black/60 rounded-full blur-[2px] pointer-events-none" />
      </div>
    </div>
  );
};
