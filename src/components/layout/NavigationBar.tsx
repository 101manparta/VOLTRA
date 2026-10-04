import React from 'react';
import { Activity, Bell, Compass, History, LayoutDashboard, Zap } from 'lucide-react';
import { AppRoute, useApp } from '../../context/AppContext';
import { TactileButton } from '../ui/TactileButton';

export const NavigationBar: React.FC = () => {
  const { currentRoute, setRoute, unreadAlertsCount, activeSession } = useApp();

  const navLinks: { id: AppRoute; label: string; icon: React.ReactNode }[] = [
    { id: 'explore', label: 'Explorer', icon: <Compass className="w-4 h-4" /> },
    { id: 'session', label: 'Live Cockpit', icon: <Zap className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'fleet', label: 'Fleet SaaS', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 lg:px-8 py-3.5 bg-[#07090E]/80 backdrop-blur-2xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setRoute('landing')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
              VOLTARA
              <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.08] text-emerald-400 font-normal">
                INTELLIGENCE
              </span>
            </span>
          </div>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setRoute(link.id)}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-150 flex items-center gap-1.5 select-none ${
                  isActive
                    ? 'text-white bg-white/[0.08] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.id === 'alerts' && unreadAlertsCount > 0 && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Live session quick glance / CTA */}
        <div className="flex items-center gap-2.5">
          {activeSession.state === 'CHARGING' && (
            <button
              onClick={() => setRoute('session')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-mono text-emerald-300 font-semibold tabular-nums">
                {activeSession.currentSocPercent}% · {activeSession.instantaneousPowerKw} kW
              </span>
            </button>
          )}

          <TactileButton
            variant="glass"
            size="sm"
            onClick={() => setRoute(currentRoute === 'explore' ? 'landing' : 'explore')}
          >
            {currentRoute === 'explore' ? 'Overview' : 'Launch Explorer'}
          </TactileButton>
        </div>
      </div>
    </header>
  );
};
