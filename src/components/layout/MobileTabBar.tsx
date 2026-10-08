import React from 'react';
import { Bell, Bot, Compass, History, LayoutDashboard, Server, Shield, User, Zap } from 'lucide-react';
import { AppRoute, useApp } from '../../context/AppContext';

export const MobileTabBar: React.FC = () => {
  const { currentRoute, setRoute, unreadAlertsCount, currentUser, setIsAuthModalOpen } = useApp();

  const isOperator = currentUser.role === 'OPERATOR';
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 py-2 bg-[#07090E]/95 backdrop-blur-2xl border-t border-white/[0.08]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => setRoute('explore')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
            currentRoute === 'explore' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Explorer</span>
        </button>

        <button
          onClick={() => setRoute('office')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
            currentRoute === 'office' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">AI Office</span>
        </button>

        <button
          onClick={() => setRoute('session')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
            currentRoute === 'session' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Cockpit</span>
        </button>

        {isOperator ? (
          <button
            onClick={() => setRoute('operator')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              currentRoute === 'operator' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Operator</span>
          </button>
        ) : isAdmin ? (
          <button
            onClick={() => setRoute('admin')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              currentRoute === 'admin' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => setRoute('fleet')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              currentRoute === 'fleet' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Fleet</span>
          </button>
        )}

        <button
          onClick={() => setRoute('alerts')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
            currentRoute === 'alerts' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-5 h-5" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
          )}
          <span className="text-[10px] mt-1 font-medium">Alerts</span>
        </button>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all text-slate-400 hover:text-emerald-400"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">{currentUser.role}</span>
        </button>
      </div>
    </div>
  );
};
