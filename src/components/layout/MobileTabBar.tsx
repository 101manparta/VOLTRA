import React from 'react';
import { Bell, Compass, History, LayoutDashboard, Zap } from 'lucide-react';
import { AppRoute, useApp } from '../../context/AppContext';

export const MobileTabBar: React.FC = () => {
  const { currentRoute, setRoute, unreadAlertsCount } = useApp();

  const tabs: { id: AppRoute; label: string; icon: React.ReactNode }[] = [
    { id: 'explore', label: 'Explorer', icon: <Compass className="w-5 h-5" /> },
    { id: 'session', label: 'Charging', icon: <Zap className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
    { id: 'fleet', label: 'Fleet', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 py-2 bg-[#07090E]/90 backdrop-blur-2xl border-t border-white/[0.08]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentRoute === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setRoute(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.id === 'alerts' && unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
