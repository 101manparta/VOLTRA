import React, { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';

export type StationStatus = 'available' | 'busy' | 'offline' | 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export interface ChargerMarkerProps {
  /** Geographic latitude */
  latitude: number;
  /** Geographic longitude */
  longitude: number;
  /** Operational availability status */
  status: StationStatus;
  /** Optional station display name */
  stationName?: string;
  /** Optional power rating in kW */
  powerKw?: number;
  /** Optional charging confidence score (0 - 100) */
  confidenceScore?: number;
  /** Whether the station is actively selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Optional pixel coordinates if rendered in projected canvas */
  pixelPosition?: { x: number; y: number };
  /** Optional custom CSS classes */
  className?: string;
}

export const ChargerMarker: React.FC<ChargerMarkerProps> = ({
  latitude,
  longitude,
  status,
  stationName,
  powerKw,
  confidenceScore,
  isSelected = false,
  onClick,
  pixelPosition,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Normalize status to lowercase
  const normalizedStatus = status.toLowerCase() as 'available' | 'busy' | 'offline';

  // Dynamic 3D lighting, glow, and beam styling based on availability
  const statusThemes = {
    available: {
      coreBg: 'bg-emerald-400',
      coreGlow: 'shadow-[0_0_20px_rgba(52,211,153,0.95)]',
      beamGradient: 'from-emerald-400/80 via-emerald-500/25 to-transparent',
      ringBorder: 'border-emerald-400/60',
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
      label: 'Available'
    },
    busy: {
      coreBg: 'bg-amber-400',
      coreGlow: 'shadow-[0_0_18px_rgba(251,191,36,0.9)]',
      beamGradient: 'from-amber-400/70 via-amber-500/20 to-transparent',
      ringBorder: 'border-amber-400/50',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
      label: 'Busy'
    },
    offline: {
      coreBg: 'bg-rose-500',
      coreGlow: 'shadow-[0_0_22px_rgba(244,63,94,0.95)]',
      beamGradient: 'from-rose-500/80 via-rose-600/25 to-transparent',
      ringBorder: 'border-rose-500/60',
      textColor: 'text-rose-400',
      badgeBg: 'bg-rose-950/80 border-rose-500/40 text-rose-300',
      label: 'Offline'
    }
  };

  const currentTheme = statusThemes[normalizedStatus] || statusThemes.available;
  const activeElevated = isHovered || isSelected;

  // Positioning style if screen coordinates are provided
  const containerStyle: React.CSSProperties = pixelPosition
    ? {
        position: 'absolute',
        left: `${pixelPosition.x}px`,
        top: `${pixelPosition.y}px`,
        transform: `translate(-50%, -100%) scale(${activeElevated ? 1.12 : 1})`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
        zIndex: isSelected ? 40 : isHovered ? 35 : 20
      }
    : {
        transform: `scale(${activeElevated ? 1.12 : 1})`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      };

  return (
    <div
      style={containerStyle}
      className={`group cursor-pointer select-none relative flex flex-col items-center pointer-events-auto ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${stationName || 'EV Charger'} at lat: ${latitude}, lng: ${longitude}, status: ${currentTheme.label}`}
    >
      {/* 1. FLOATING 3D GLASS HUD TAG */}
      {(stationName || powerKw || confidenceScore) && (
        <div
          className={`mb-2 px-2.5 py-1 rounded-xl backdrop-blur-xl border shadow-xl flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${
            isSelected
              ? 'bg-[#0E1524]/95 border-emerald-400/80 shadow-[0_0_24px_rgba(16,185,129,0.35)] scale-105'
              : activeElevated
              ? 'bg-[#0E1524]/90 border-white/20'
              : 'bg-black/75 border-white/10 opacity-90'
          }`}
        >
          {stationName && (
            <span className="text-xs font-semibold text-white tracking-tight font-sans">
              {stationName.split(' ')[0]}
            </span>
          )}
          {powerKw !== undefined && (
            <>
              <span className="text-slate-500 text-[10px]">·</span>
              <span className="font-mono text-xs font-bold text-slate-200 tabular-nums">
                {powerKw}kW
              </span>
            </>
          )}
          {confidenceScore !== undefined && (
            <>
              <span className="text-slate-500 text-[10px]">·</span>
              <span className={`font-mono text-[11px] font-bold tabular-nums ${currentTheme.textColor}`}>
                {confidenceScore}%
              </span>
            </>
          )}
          {confidenceScore && confidenceScore >= 95 && (
            <Sparkles className="w-3 h-3 text-emerald-400 fill-emerald-400 shrink-0" />
          )}
        </div>
      )}

      {/* 2. 3D VERTICAL LIGHT BEAM (anchors the location into 3D perspective) */}
      <div
        className={`w-[2px] h-9 md:h-11 bg-gradient-to-t ${currentTheme.beamGradient} transition-all duration-300 ${
          activeElevated ? 'opacity-100 h-12' : 'opacity-70'
        }`}
      />

      {/* 3. 3D BEVELED HARDWARE PEDESTAL & GLOWING ENERGY CORE */}
      <div className="relative flex items-center justify-center -mt-1">
        {/* Pulsing Outer Energy Halo */}
        <div
          className={`absolute w-9 h-9 rounded-full ${currentTheme.ringBorder} border opacity-70 animate-ping pointer-events-none ${
            normalizedStatus === 'offline' ? 'border-rose-500 animate-pulse duration-700' : ''
          }`}
          style={{ animationDuration: normalizedStatus === 'offline' ? '1.2s' : '2.8s' }}
        />

        {/* Ambient Soft Glow */}
        <div
          className={`absolute w-7 h-7 rounded-full ${currentTheme.coreBg} opacity-25 blur-md pointer-events-none`}
        />

        {/* 3D Beveled Hexagonal/Octagonal Pedestal Housing */}
        <div
          className={`relative z-10 w-7 h-7 rounded-xl bg-gradient-to-b from-[#212A3E] via-[#141A29] to-[#0A0D15] border ${
            isSelected
              ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.45)]'
              : 'border-white/20 shadow-lg'
          } flex items-center justify-center transition-all duration-200`}
        >
          {/* Glowing Energy Core Center with Lightning Glyph */}
          <div
            className={`w-3.5 h-3.5 rounded-full ${currentTheme.coreBg} ${currentTheme.coreGlow} flex items-center justify-center transition-transform ${
              activeElevated ? 'scale-115' : 'scale-100'
            }`}
          >
            <Zap className="w-2 h-2 text-slate-950 fill-slate-950" />
          </div>
        </div>

        {/* 3D Perspective Elevation Ground Drop Shadow */}
        <div className="absolute -bottom-2 w-8 h-2.5 bg-black/70 rounded-full blur-[2px] pointer-events-none -z-10" />
      </div>

      {/* 4. EXPANDED HOVER / SELECTION GLASS CARD */}
      {isHovered && (
        <div className="absolute bottom-full mb-12 z-50 pointer-events-none min-w-[200px] p-3 rounded-2xl bg-[#090D16]/95 border border-white/15 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              EV Intelligence
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${currentTheme.badgeBg}`}
            >
              {currentTheme.label}
            </span>
          </div>

          {stationName && (
            <h5 className="text-xs font-bold text-white mt-1.5 line-clamp-1 font-sans">
              {stationName}
            </h5>
          )}

          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Lat: {latitude.toFixed(4)} · Lng: {longitude.toFixed(4)}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/[0.06] text-[11px] font-mono">
            {confidenceScore !== undefined && (
              <div>
                <span className="text-slate-400 text-[10px] block">Confidence</span>
                <span className={`font-bold ${currentTheme.textColor}`}>
                  {confidenceScore}%
                </span>
              </div>
            )}
            {powerKw !== undefined && (
              <div>
                <span className="text-slate-400 text-[10px] block">Max Output</span>
                <span className="font-semibold text-slate-200">
                  {powerKw} kW
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChargerMarker;
