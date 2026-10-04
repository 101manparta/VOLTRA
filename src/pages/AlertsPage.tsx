import React from 'react';
import { AlertTriangle, Bell, Check, Info, Navigation, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/ui/GlassCard';
import { TactileButton } from '../components/ui/TactileButton';

export const AlertsPage: React.FC = () => {
  const { alerts, setRoute, setSelectedStation, stations } = useApp();

  const handleAction = (alert: any) => {
    if (alert.targetId) {
      const station = stations.find(s => s.id === alert.targetId);
      if (station) {
        setSelectedStation(station);
        setRoute('explore');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Real-Time Operational Feed
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            System & Charging Alerts
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-slate-300">
            {alerts.length} Incident Signals
          </span>
        </div>
      </div>

      {/* Alert Cards Feed */}
      <div className="flex flex-col gap-4">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isWarning = alert.severity === 'WARNING';

          return (
            <GlassCard
              key={alert.id}
              variant={isCritical ? 'base' : 'base'}
              className={`p-6 transition-all duration-200 ${
                isCritical
                  ? 'border-rose-500/30 bg-rose-950/10'
                  : isWarning
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : 'border-white/[0.08]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isCritical ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono mb-1">
                      <span
                        className={`font-semibold uppercase ${
                          isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">{alert.timestamp}</span>
                      {alert.stationName && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-300 font-sans">{alert.stationName}</span>
                        </>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white">
                      {alert.title}
                    </h4>

                    <p className="text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
                      {alert.description}
                    </p>
                  </div>
                </div>

                {alert.actionLabel && (
                  <div className="shrink-0 pt-2 sm:pt-0">
                    <TactileButton
                      variant={isCritical ? 'danger' : 'glass'}
                      size="sm"
                      icon={<Navigation className="w-3.5 h-3.5" />}
                      onClick={() => handleAction(alert)}
                    >
                      {alert.actionLabel}
                    </TactileButton>
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
