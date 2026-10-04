import React from 'react';
import { ArrowRight, CheckCircle2, Navigation, Sparkles, Zap } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ConfidenceGauge } from '../../ui/ConfidenceGauge';
import { GlassCard } from '../../ui/GlassCard';
import { TactileButton } from '../../ui/TactileButton';

export const DecisionCard: React.FC = () => {
  const { recommendation, stations, setSelectedStation, startChargingAtStation } = useApp();

  if (!recommendation) return null;

  const targetStation = stations.find(s => s.id === recommendation.recommendedStationId);
  if (!targetStation) return null;

  return (
    <GlassCard variant="accent" className="p-5 md:p-6 relative overflow-hidden border-emerald-500/30">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          {/* Header indicator */}
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="tracking-wider uppercase">INTELLIGENCE RECOMMENDATION</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Net saving {recommendation.netTimeSavedMinutes} min</span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            {recommendation.title}
          </h3>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {recommendation.headlineReason}
          </p>

          {/* Evidence Checklist */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
            {recommendation.reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-black/20 p-2 rounded-xl border border-white/[0.04]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action & Metric Lockup */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/[0.08]">
          <ConfidenceGauge score={targetStation.confidence.overallScore} size={60} />

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <TactileButton
              variant="secondary"
              size="sm"
              icon={<Navigation className="w-3.5 h-3.5 text-slate-900" />}
              onClick={() => setSelectedStation(targetStation)}
            >
              Examine Station
            </TactileButton>

            <TactileButton
              variant="primary"
              size="sm"
              icon={<Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />}
              onClick={() => startChargingAtStation(targetStation)}
            >
              Plug In Here
            </TactileButton>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
