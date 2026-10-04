import React from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BatteryCharging,
  CheckCircle2,
  DollarSign,
  Download,
  Filter,
  Layers,
  Sparkles,
  TrendingDown,
  Truck,
  Zap
} from 'lucide-react';
import { MOCK_FLEET_METRICS, MOCK_FLEET_VEHICLES } from '../services/mock/fleetData';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricDisplay } from '../components/ui/MetricDisplay';
import { TactileButton } from '../components/ui/TactileButton';

export const FleetPage: React.FC = () => {
  const metrics = MOCK_FLEET_METRICS;
  const vehicles = MOCK_FLEET_VEHICLES;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      {/* Fleet Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ENTERPRISE B2B MOBILITY INTELLIGENCE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Fleet Operations Command
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry, tariff arbitrage scheduling, and depot health monitoring across 100 commercial EV assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <TactileButton variant="glass" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
            Export Telemetry Log
          </TactileButton>
          <TactileButton variant="primary" size="sm" icon={<Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />}>
            Run Schedule Optimizer
          </TactileButton>
        </div>
      </div>

      {/* Primary KPI Grid (100 vehicles · 84 Ready · 11 Charging · 5 Attention) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Total Fleet Assets"
            value={metrics.totalVehicles}
            unit="vehicles"
            subtext="Denpasar & Sanur Hubs"
          />
        </GlassCard>

        <GlassCard variant="base" className="p-5 border-emerald-500/20">
          <MetricDisplay
            label="Mission Ready"
            value={metrics.readyCount}
            unit="active"
            trend={`${((metrics.readyCount / metrics.totalVehicles) * 100).toFixed(0)}% available`}
            subtext="Battery > 80%"
          />
        </GlassCard>

        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Depot Charging"
            value={metrics.chargingCount}
            unit="plugged"
            subtext="Avg power 48 kW"
          />
        </GlassCard>

        <GlassCard variant="base" className="p-5 border-rose-500/30">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Requires Attention</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono font-bold text-2xl text-rose-400 tabular-nums">
                {metrics.attentionCount}
              </span>
              <span className="text-xs text-rose-300">vehicles</span>
            </div>
            <span className="text-xs text-rose-300 mt-0.5 flex items-center gap-1 font-mono">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Handshake / Derating
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Cost Optimization & Tariff Arbitrage Card */}
      <GlassCard variant="accent" className="p-6 border-emerald-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <TrendingDown className="w-4 h-4" />
              <span>AI Tariff Arbitrage & Off-Peak Shift</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Estimated Daily Power Cost Optimization
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              By shifting 34 depot overnight charges to off-peak slots (23:00 – 05:00) and preventing peak thermal curtailment, VOLTARA lowers your daily electricity bill.
            </p>
          </div>

          <div className="flex items-center gap-6 p-4 rounded-2xl bg-black/40 border border-white/[0.06] text-xs font-mono">
            <div>
              <span className="text-slate-400 block">Today Unoptimized</span>
              <span className="text-base font-bold text-slate-300 tabular-nums">
                Rp {(metrics.todayChargingCost / 1000000).toFixed(2)}M
              </span>
            </div>
            <span className="text-slate-600 text-lg">→</span>
            <div>
              <span className="text-slate-400 block">Optimized Cost</span>
              <span className="text-base font-bold text-emerald-400 tabular-nums">
                Rp {(metrics.estimatedOptimizedCost / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="pl-4 border-l border-white/[0.08]">
              <span className="text-emerald-400 font-bold block uppercase">Potential Savings</span>
              <span className="text-lg font-bold text-emerald-300 tabular-nums">
                +Rp {(metrics.potentialSavings / 1000).toFixed(0)}K / day
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Vehicle Asset Telemetry Roster */}
      <GlassCard variant="base" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">
            Connected Fleet Vehicle Roster
          </h3>
          <span className="text-xs font-mono text-slate-400">Showing 8 active sample units</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400">
                <th className="pb-3 font-semibold">Plate / ID</th>
                <th className="pb-3 font-semibold">Vehicle Model</th>
                <th className="pb-3 font-semibold">Depot Assignment</th>
                <th className="pb-3 font-semibold">State of Charge</th>
                <th className="pb-3 font-semibold">Operational Status</th>
                <th className="pb-3 font-semibold">Diagnostics / ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 font-bold text-white">{v.plateNumber}</td>
                  <td className="py-3.5 text-slate-200 font-sans">{v.model}</td>
                  <td className="py-3.5 text-slate-400">{v.depotLocation}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold tabular-nums ${v.batteryPercent < 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {v.batteryPercent}%
                      </span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${v.batteryPercent < 30 ? 'bg-rose-400' : 'bg-emerald-400'}`}
                          style={{ width: `${v.batteryPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        v.status === 'READY'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : v.status === 'CHARGING'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-300">
                    {v.issueDescription ? (
                      <span className="text-rose-400 text-xs font-sans">{v.issueDescription}</span>
                    ) : v.estimatedFullChargeTime ? (
                      <span>Ready by {v.estimatedFullChargeTime}</span>
                    ) : (
                      <span className="text-slate-500">Nominal standby</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
