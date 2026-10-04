import React from 'react';
import { ArrowUpRight, Calendar, CheckCircle2, Clock, DollarSign, Download, Gauge, Zap } from 'lucide-react';
import { MOCK_HISTORIC_SESSIONS } from '../services/mock/sessionData';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricDisplay } from '../components/ui/MetricDisplay';
import { TactileButton } from '../components/ui/TactileButton';

export const HistoryPage: React.FC = () => {
  const sessions = MOCK_HISTORIC_SESSIONS;

  const totalEnergy = sessions.reduce((acc, s) => acc + s.energyKwh, 0);
  const totalCost = sessions.reduce((acc, s) => acc + s.totalCost, 0);
  const avgSpeed = (sessions.reduce((acc, s) => acc + s.averagePowerKw, 0) / sessions.length).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Audit Ledger
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Charging History & Efficiency
          </h2>
        </div>

        <TactileButton variant="glass" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
          Export Tax CSV
        </TactileButton>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Month Sessions"
            value="14"
            unit="charges"
            subtext="98.2% completion rate"
          />
        </GlassCard>

        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Total Energy"
            value="382.4"
            unit="kWh"
            subtext="~1,920 km range"
          />
        </GlassCard>

        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Total Billed"
            value="Rp 942.8K"
            subtext="Avg Rp 67.3K / charge"
          />
        </GlassCard>

        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Mean Delivery Speed"
            value={avgSpeed}
            unit="kW"
            trend="+12% vs last month"
          />
        </GlassCard>
      </div>

      {/* Historical Sessions Table */}
      <GlassCard variant="base" className="p-6 overflow-hidden">
        <h3 className="text-base font-semibold text-white mb-4">
          Recent Charging Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400">
                <th className="pb-3 font-semibold">Station / Hub</th>
                <th className="pb-3 font-semibold">Date & Time</th>
                <th className="pb-3 font-semibold">Duration</th>
                <th className="pb-3 font-semibold">Energy (kWh)</th>
                <th className="pb-3 font-semibold">Avg Speed</th>
                <th className="pb-3 font-semibold">Total Cost</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 font-sans">
                    <span className="font-semibold text-white text-sm block">{s.stationName}</span>
                    <span className="text-xs text-slate-400 font-mono">{s.operator} · {s.connectorType}</span>
                  </td>
                  <td className="py-4 text-slate-300">{s.date}</td>
                  <td className="py-4 text-slate-300">{s.durationMinutes} min</td>
                  <td className="py-4 text-emerald-400 font-bold tabular-nums">{s.energyKwh} kWh</td>
                  <td className="py-4 text-slate-200 tabular-nums">{s.averagePowerKw} kW</td>
                  <td className="py-4 text-white font-semibold tabular-nums">
                    Rp {s.totalCost.toLocaleString()}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        s.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {s.status}
                    </span>
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
