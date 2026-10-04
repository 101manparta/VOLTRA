import React, { useState } from 'react';
import { AlertTriangle, Clock, Gauge, Sparkles, Zap } from 'lucide-react';
import { ChargerMarkerData, ChargerMarkerStatus, ScreenPosition } from '../../../types/map';

export interface ChargerMarkerProps {
  /** Geographic data and operational telemetry for the charger */
  charger: ChargerMarkerData;
  /** Calculated screen pixel coordinates or relative transform */
  position?: ScreenPosition;
  /** Whether this marker is currently active/selected by the user */
  isSelected?: boolean;
  /** Optional click handler to focus/select charger */
  onClick?: (charger: ChargerMarkerData) => void;
  /** Optional hover handler */
  onHover?: (charger: ChargerMarkerData | null) => void;
  /** Custom additional CSS classes */
  className?: string;
  /** Scale factor (e.g. during map zoom) */
  scale?: number;
}

export const ChargerMarker: React.FC<ChargerMarkerProps> = ({
  charger,
  position,
  isSelected = false,
  onClick,
  onHover,
  className = '',
  scale = 1
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Derive status tier and visual color tokens
  const status = charger.status;
  const confidence = charger.confidenceScore;
  const isHighConfidence = confidence >= 90;
  const isHighRisk = confidence < 70 || status === 'OFFLINE';

  const statusStyles: Record<
    ChargerMarkerStatus,
    {
      coreColor: string;
      glowColor: string;
      beamGradient: string;
      ringColor: string;
      labelColor: string;
      badgeBg: string;
      statusText: string;
    }
  > = {
    AVAILABLE: {
      coreColor: 'bg-emerald-400',
      glowColor: 'shadow-[0_0_20px_rgba(52,211,153,0.9)]',
      beamGradient: 'from-emerald-400/70 via-emerald-500/20 to-transparent',
      ringColor: 'border-emerald-400/60',
      labelColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
      statusText: 'Available'
    },
    BUSY: {
      coreColor: 'bg-amber-400',
      glowColor: 'shadow-[0_0_18px_rgba(251,191,36,0.85)]',
      beamGradient: 'from-amber-400/60 via-amber-500/15 to-transparent',
      ringColor: 'border-amber-400/50',
      labelColor: 'text-amber-400',
      badgeBg: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
      statusText: 'Occupied'
    },
    OFFLINE: {
      coreColor: 'bg-rose-500',
      glowColor: 'shadow-[0_0_22px_rgba(244,63,94,0.9)]',
      beamGradient: 'from-rose-500/70 via-rose-600/20 to-transparent',
      ringColor: 'border-rose-500/60',
      labelColor: 'text-rose-400',
      badgeBg: 'bg-rose-950/80 border-rose-500/40 text-rose-300',
      statusText: 'Offline'
    },
    STALE: {
      coreColor: 'bg-slate-400',
      glowColor: 'shadow-[0_0_12px_rgba(148,163,184,0.5)]',
      beamGradient: 'from-slate-400/50 via-slate-500/10 to-transparent',
      ringColor: 'border-slate-500/40',
      labelColor: 'text-slate-400',
      badgeBg: 'bg-slate-900/80 border-slate-700 text-slate-300',
      statusText: 'Stale Ping'
    }
  };

  const styleConfig = statusStyles[status] || statusStyles.AVAILABLE;
  const activeHover = isHovered || isSelected;

  // Calculate inline positioning if 2D/3D projection coordinates are provided
  const styleTransform: React.CSSProperties = position
    ? {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -100%) scale(${scale * (activeHover ? 1.12 : 1)})`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
        zIndex: isSelected ? 40 : activeHover ? 30 : 20
      }
    : {
        transform: `scale(${scale * (activeHover ? 1.12 : 1)})`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      };

  return (
    <div
      style={styleTransform}
      className={`group cursor-pointer select-none relative flex flex-col items-center pointer-events-auto ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(charger);
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.(charger);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHover?.(null);
      }}
      role="button"
      tabIndex={0}
      aria-label={`${charger.name}, ${styleConfig.statusText}, ${charger.confidenceScore}% confidence`}
    >
      {/* 1. FLOATING MINI-HUD TAG (Hover or Selected) */}
      <div
        className={`mb-2 px-2.5 py-1 rounded-xl backdrop-blur-xl border shadow-xl flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${
          isSelected
            ? 'bg-[#0E1524]/95 border-emerald-400/80 shadow-[0_0_24px_rgba(16,185,129,0.35)] scale-105'
            : activeHover
            ? 'bg-[#0E1524]/90 border-white/20'
            : 'bg-black/75 border-white/10 opacity-90'
        }`}
      >
        <span className="text-xs font-semibold text-white tracking-tight font-sans">
          {charger.name.split(' ')[0]}
        </span>
        <span className="text-slate-500 text-[10px]">·</span>
        <span className="font-mono text-xs font-bold text-slate-200 tabular-nums">
          {charger.maxPowerKw}kW
        </span>
        <span className="text-slate-500 text-[10px]">·</span>
        <span
          className={`font-mono text-[11px] font-bold tabular-nums ${styleConfig.labelColor}`}
        >
          {charger.confidenceScore}%
        </span>
        {charger.isRecommended && (
          <Sparkles className="w-3 h-3 text-emerald-400 fill-emerald-400 shrink-0" />
        )}
      </div>

      {/* 2. 3D VERTICAL LIGHT BEAM */}
      <div
        className={`w-[2px] h-8 md:h-11 bg-gradient-to-t ${styleConfig.beamGradient} transition-opacity duration-300 ${
          activeHover ? 'opacity-100 h-12' : 'opacity-70'
        }`}
      />

      {/* 3. 3D CHARGING STATION CORE & PEDESTAL ASSEMBLY */}
      <div className="relative flex items-center justify-center -mt-1">
        {/* Pulsing Outer Energy Halo */}
        <div
          className={`absolute w-9 h-9 rounded-full ${styleConfig.ringColor} border opacity-75 animate-ping pointer-events-none ${
            isHighRisk ? 'border-rose-500 animate-pulse duration-700' : ''
          }`}
          style={{ animationDuration: isHighRisk ? '1.2s' : '2.8s' }}
        />

        {/* Secondary Soft Ambient Glow */}
        <div
          className={`absolute w-7 h-7 rounded-full ${styleConfig.coreColor} opacity-20 blur-md pointer-events-none`}
        />

        {/* 3D Octagonal/Hexagonal Brushed Pedestal Base */}
        <div
          className={`relative z-10 w-7 h-7 rounded-xl bg-gradient-to-b from-[#1E2638] to-[#0A0D15] border ${
            isSelected
              ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]'
              : 'border-white/20 shadow-lg'
          } flex items-center justify-center transition-all duration-200`}
        >
          {/* Glowing Energy Core Center */}
          <div
            className={`w-3 h-3 rounded-full ${styleConfig.coreColor} ${styleConfig.glowColor} flex items-center justify-center transition-transform ${
              activeHover ? 'scale-110' : 'scale-100'
            }`}
          >
            <Zap className="w-2 h-2 text-slate-950 fill-slate-950" />
          </div>
        </div>

        {/* 3D Perspective Elevation Ground Shadow */}
        <div className="absolute -bottom-2 w-8 h-2.5 bg-black/60 rounded-full blur-[2px] pointer-events-none -z-10" />
      </div>

      {/* 4. EXPANDED HOVER POPUP TOOLTIP (On Active Hover) */}
      {activeHover && (
        <div className="absolute bottom-full mb-12 z-50 pointer-events-none min-w-[210px] p-3 rounded-2xl bg-[#090D16]/95 border border-white/15 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {charger.operator || 'EV Network'}
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${styleConfig.badgeBg}`}
            >
              {styleConfig.statusText}
            </span>
          </div>

          <h5 className="text-xs font-bold text-white mt-1.5 line-clamp-1">
            {charger.name}
          </h5>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/[0.06] text-[11px] font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">Confidence</span>
              <span className={`font-bold ${styleConfig.labelColor}`}>
                {charger.confidenceScore}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Availability</span>
              <span className="font-semibold text-slate-200">
                {charger.availableBays !== undefined ? `${charger.availableBays}/${charger.totalBays || 4}` : 'Verified'}
              </span>
            </div>
          </div>

          {charger.queueLength !== undefined && (
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {charger.queueLength === 0 ? '0 Queue' : `${charger.queueLength} waiting`}
              </span>
              <span className="text-emerald-400">
                {charger.isRecommended ? '★ Best Decision' : 'Click to inspect'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
