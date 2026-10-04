import React from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  BatteryCharging,
  Clock,
  Coins,
  Compass,
  Gauge,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LivePowerChart } from '../components/domain/session/LivePowerChart';
import { BatteryLevelVisualizer } from '../components/ui/BatteryLevelVisualizer';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricDisplay } from '../components/ui/MetricDisplay';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { TactileButton } from '../components/ui/TactileButton';

export const LiveSessionPage: React.FC = () => {
  const {
    activeSession,
    setRoute,
    isSimulatingDerate,
    toggleSimulateDerate,
    stopActiveSession
  } = useApp();

  const isCompleted = activeSession.state === 'COMPLETED';

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      {/* Session Top Identity Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span className="text-emerald-400 font-semibold">{activeSession.connectorType} Plug</span>
            <span>·</span>
            <span>{activeSession.stationName}</span>
            <span>·</span>
            <StatusIndicator lastReportedAt={new Date().toISOString()} variant="compact" />
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Live Charging Cockpit
            </h2>
            <StatusIndicator lastReportedAt={new Date().toISOString()} variant="pill" />
          </div>
        </div>

        {/* Simulation Controls for Demonstration */}
        <div className="flex items-center gap-2.5">
          <TactileButton
            variant={isSimulatingDerate ? 'danger' : 'glass'}
            size="sm"
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            onClick={toggleSimulateDerate}
          >
            {isSimulatingDerate ? 'Resolve Derate Anomaly' : 'Simulate Power Throttle (52 -> 31 kW)'}
          </TactileButton>

          {!isCompleted ? (
            <TactileButton
              variant="danger"
              size="sm"
              onClick={stopActiveSession}
            >
              Stop Charging
            </TactileButton>
          ) : (
            <TactileButton
              variant="primary"
              size="sm"
              onClick={() => setRoute('explore')}
            >
              Start New Session
            </TactileButton>
          )}
        </div>
      </div>

      {/* Main Cockpit Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left: Large Circular Battery Visualizer (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl">
          <BatteryLevelVisualizer
            currentSoc={activeSession.currentSocPercent}
            targetSoc={activeSession.targetSocPercent}
            powerKw={activeSession.instantaneousPowerKw}
            isCharging={!isCompleted}
            size="lg"
          />

          <div className="mt-6 flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Elapsed: {Math.floor(activeSession.elapsedSeconds / 60)}m {activeSession.elapsedSeconds % 60}s
            </span>
            <span>·</span>
            <span>Est. Full: {activeSession.estimatedMinutesToTarget} min</span>
          </div>
        </div>

        {/* Right: Real-Time Telemetry Quadrant (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <GlassCard variant="base" className="p-5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Delivered Power
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold font-mono text-white tabular-nums">
                  {activeSession.instantaneousPowerKw.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400">kW</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono mt-1">
                Cabinet capacity 150 kW
              </span>
            </GlassCard>

            <GlassCard variant="base" className="p-5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Energy Transferred
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                  {activeSession.energyDeliveredKwh.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400">kWh</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono mt-1">
                +128 km range added
              </span>
            </GlassCard>

            <GlassCard variant="base" className="p-5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Estimated Time Remaining
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold font-mono text-white tabular-nums">
                  {activeSession.estimatedMinutesToTarget}
                </span>
                <span className="text-xs font-mono text-slate-400">min</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono mt-1">
                To reach {activeSession.targetSocPercent}% target
              </span>
            </GlassCard>

            <GlassCard variant="base" className="p-5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Accumulated Cost
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold font-mono text-white tabular-nums">
                  Rp {activeSession.estimatedCostTotal.toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono mt-1">
                Tariff: Rp {activeSession.tariffPerKwh.toLocaleString()}/kWh
              </span>
            </GlassCard>
          </div>

          {/* Active Live Power Curve Chart */}
          <LivePowerChart
            history={activeSession.powerHistory}
            currentKw={activeSession.instantaneousPowerKw}
            hasDeratingAnomaly={activeSession.hasDeratingAnomaly}
            anomalyMessage={activeSession.anomalyMessage}
          />
        </div>
      </div>

      {/* Target Setting Bar */}
      <GlassCard variant="base" className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Optimized Battery Protection Threshold
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Stopping at 80% preserves battery pack longevity and saves 22 minutes of tapering dwell time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TactileButton variant="glass" size="sm">
            Target 80%
          </TactileButton>
          <TactileButton variant="ghost" size="sm">
            Target 90%
          </TactileButton>
          <TactileButton variant="ghost" size="sm">
            Target 100%
          </TactileButton>
        </div>
      </GlassCard>
    </div>
  );
};
