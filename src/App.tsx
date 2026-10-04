/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthModal } from './components/auth/AuthModal';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { NavigationBar } from './components/layout/NavigationBar';
import { AdminPage } from './pages/AdminPage';
import { AlertsPage } from './pages/AlertsPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { FleetPage } from './pages/FleetPage';
import { HistoryPage } from './pages/HistoryPage';
import { LandingPage } from './pages/LandingPage';
import { LiveSessionPage } from './pages/LiveSessionPage';
import { OperatorPage } from './pages/OperatorPage';

const AppContent: React.FC = () => {
  const { currentRoute, isAuthModalOpen, setIsAuthModalOpen } = useApp();

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans pb-16 md:pb-0 relative selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Ambient background light gradients */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/5 via-teal-500/0 to-transparent pointer-events-none -z-10" />

      {/* Primary Top Bar Contract */}
      <NavigationBar />

      {/* Main Screen Router */}
      <main className="flex-1">
        {currentRoute === 'landing' && <LandingPage />}
        {currentRoute === 'explore' && <ExplorerPage />}
        {currentRoute === 'session' && <LiveSessionPage />}
        {currentRoute === 'history' && <HistoryPage />}
        {currentRoute === 'fleet' && <FleetPage />}
        {currentRoute === 'alerts' && <AlertsPage />}
        {currentRoute === 'operator' && <OperatorPage />}
        {currentRoute === 'admin' && <AdminPage />}
      </main>

      {/* Auth & RBAC Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Footer (Quiet editorial, zero telemetry tickers) */}
      <footer className="w-full py-8 border-t border-white/[0.06] text-xs font-mono text-slate-500 text-center px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">VOLTARA</span>
            <span>·</span>
            <span>Real-time EV Mobility Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Data Transparency</span>
            <span>·</span>
            <span>CPO Connectors</span>
            <span>·</span>
            <span>ISO 15118 Compliant</span>
          </div>

          <div>
            © 2026 VOLTARA Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Mobile Tab Bar */}
      <MobileTabBar />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
