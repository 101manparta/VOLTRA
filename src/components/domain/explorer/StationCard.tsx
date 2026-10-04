import React from 'react';
import { ArrowUpRight, Clock, Gauge, MapPin, Zap } from 'lucide-react';
import { ChargingStation } from '../../../types/station';
import { ConfidenceGauge } from '../../ui/ConfidenceGauge';
import { GlassCard } from '../../ui/GlassCard';
import { StatusIndicator } from '../../ui/StatusIndicator';
import { TactileButton } from '../../ui/TactileButton';

interface StationCardProps {
  station: ChargingStation;
  onSelect: (station: ChargingStation) => void;
  onStartSession: (station: ChargingStation) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  onSelect,
  onStartSession
}) => {
  const availableConnectors = station.connectors.filter(c => c.status === 'AVAILABLE').length;
  const totalConnectors = station.connectors.length;
  const highestPowerKw = Math.max(...station.connectors.map(c => c.maxPowerKw));

  return (
    <GlassCard
      variant={station.isRecommended ? 'accent' : 'interactive'}
      className="p-5 flex flex-col justify-between gap-4 transition-all duration-200"
      onClick={() => onSelect(station)}
    >
      <div>
        {/* Top Metadata Line */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-slate-200">{station.operator}</span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {station.distanceKm} km
            </span>
          </div>
          <StatusIndicator lastReportedAt={station.lastReportedAt} variant="compact" />
        </div>

        {/* Title and Confidence Lockup */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold text-white tracking-tight leading-snug">
              {station.name}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{station.address}</p>
          </div>
          <ConfidenceGauge score={station.confidence.overallScore} size={48} showLabel={false} />
        </div>

        {/* Vital Stats Matrix */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/[0.06] text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Available</span>
            <span className="font-mono font-semibold text-slate-200 mt-0.5">
              <span className={availableConnectors > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {availableConnectors}
              </span>
              /{totalConnectors} bays
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Observed Speed</span>
            <span className="font-mono font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-400" />
              {station.averageObservedPowerKw.toFixed(0)} kW
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Queue Delay</span>
            <span className="font-mono font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {station.queueLength === 0 ? '0 queue' : `${station.estimatedWaitMinutes}m wait`}
            </span>
          </div>
        </div>

        {/* Connector Pills List (Unboxed typography, no pill slop) */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] font-mono text-slate-400">
          {station.connectors.map((c) => (
            <span
              key={c.id}
              className={`px-2 py-0.5 rounded-md border text-[11px] font-mono ${
                c.status === 'AVAILABLE'
                  ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                  : c.status === 'OCCUPIED'
                  ? 'border-slate-700 text-slate-400 bg-slate-800/40'
                  : 'border-rose-500/30 text-rose-400 bg-rose-500/10 line-through'
              }`}
            >
              {c.type} {c.maxPowerKw}kW
            </span>
          ))}
          <span className="ml-auto text-slate-400 text-xs">
            Rp {station.pricingPerKwh.toLocaleString()}/kWh
          </span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(station);
          }}
          className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          View Full Breakdown
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <TactileButton
          variant="glass"
          size="sm"
          icon={<Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />}
          onClick={(e) => {
            e.stopPropagation();
            onStartSession(station);
          }}
        >
          Charge Here
        </TactileButton>
      </div>
    </GlassCard>
  );
};
