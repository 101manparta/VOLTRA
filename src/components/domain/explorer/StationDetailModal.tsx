import React from 'react';
import { Activity, Check, Clock, CreditCard, Gauge, MapPin, Navigation, ShieldCheck, Wifi, X, Zap } from 'lucide-react';
import { ChargingStation } from '../../../types/station';
import { ConfidenceGauge } from '../../ui/ConfidenceGauge';
import { GlassCard } from '../../ui/GlassCard';
import { StatusIndicator } from '../../ui/StatusIndicator';
import { TactileButton } from '../../ui/TactileButton';

interface StationDetailModalProps {
  station: ChargingStation | null;
  onClose: () => void;
  onStartSession: (station: ChargingStation) => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  station,
  onClose,
  onStartSession
}) => {
  if (!station) return null;

  const confidenceFactors = [
    { label: 'Slot Availability', score: station.confidence.availabilityScore, icon: <Zap className="w-3.5 h-3.5 text-emerald-400" /> },
    { label: 'Session Success Rate', score: station.confidence.handshakeSuccessRate, icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> },
    { label: 'Power Stability', score: station.confidence.powerStabilityScore, icon: <Gauge className="w-3.5 h-3.5 text-emerald-400" /> },
    { label: 'Network Latency', score: station.confidence.networkLatencyScore, icon: <Wifi className="w-3.5 h-3.5 text-emerald-400" /> },
    { label: 'Payment Gateway', score: station.confidence.paymentGatewayUptime, icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0E1422] border border-white/[0.14] rounded-3xl shadow-2xl p-6 md:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Information */}
        <div className="pr-12">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span>{station.operator}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {station.distanceKm} km away
            </span>
            <span>·</span>
            <StatusIndicator lastReportedAt={station.lastReportedAt} variant="compact" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {station.name}
          </h2>
          <p className="text-sm text-slate-300 mt-1">{station.address}</p>
        </div>

        {/* Data Freshness Audit Banner */}
        <div className="mt-4">
          <StatusIndicator lastReportedAt={station.lastReportedAt} variant="detailed" />
        </div>

        {/* Confidence Engine Breakdown Section */}
        <div className="mt-6 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <ConfidenceGauge score={station.confidence.overallScore} size={64} />
            <div className="text-left sm:text-right">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Diagnosis</span>
              <p className="text-xs text-slate-200 font-medium max-w-xs mt-0.5">
                {station.confidence.assessmentSummary}
              </p>
            </div>
          </div>

          {/* Sub-score progress bars */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {confidenceFactors.map((factor, i) => (
              <div key={i} className="flex flex-col gap-1 p-2.5 rounded-xl bg-black/20 border border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    {factor.icon}
                    {factor.label}
                  </span>
                  <span className="font-mono font-bold text-slate-200 tabular-nums">
                    {factor.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bay & Connector Telemetry */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono mb-3">
            Hardware Bay Telemetry ({station.connectors.length} Plugs)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {station.connectors.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">{c.bayNumber}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-slate-300">
                      {c.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    Max: {c.maxPowerKw} kW · Avg: {c.currentPowerKw > 0 ? `${c.currentPowerKw} kW active` : 'Idle'}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-medium ${
                      c.status === 'AVAILABLE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : c.status === 'OCCUPIED'
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {c.status}
                  </span>
                  {c.currentSessionRemainingMinutes !== undefined && (
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      ~{c.currentSessionRemainingMinutes}m left
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & Queue Summary */}
        <div className="mt-6 p-4 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-slate-400">Electricity Tariff:</span>{' '}
            <span className="text-white font-semibold">Rp {station.pricingPerKwh.toLocaleString()} / kWh</span>
          </div>
          <div>
            <span className="text-slate-400">Queue:</span>{' '}
            <span className={station.queueLength === 0 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {station.queueLength === 0 ? '0 Waiting' : `${station.queueLength} cars in queue`}
            </span>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <TactileButton variant="ghost" onClick={onClose}>
            Back to Explorer
          </TactileButton>

          <TactileButton
            variant="primary"
            size="lg"
            icon={<Zap className="w-4 h-4 fill-slate-950 text-slate-950" />}
            onClick={() => {
              onClose();
              onStartSession(station);
            }}
          >
            Plug In & Start Charging
          </TactileButton>
        </div>
      </div>
    </div>
  );
};
