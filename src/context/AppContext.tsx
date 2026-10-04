import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActionableAlert } from '../types/alert';
import { LiveChargingSession } from '../types/session';
import { ChargingStation, StationRecommendation } from '../types/station';
import { alertService } from '../services/alertService';
import { INITIAL_LIVE_SESSION } from '../services/mock/sessionData';
import { sessionService } from '../services/sessionService';
import { stationService } from '../services/stationService';

export type AppRoute = 'landing' | 'explore' | 'session' | 'history' | 'fleet' | 'alerts';

interface AppContextType {
  currentRoute: AppRoute;
  setRoute: (route: AppRoute) => void;
  stations: ChargingStation[];
  selectedStation: ChargingStation | null;
  setSelectedStation: (station: ChargingStation | null) => void;
  recommendation: StationRecommendation | null;
  activeSession: LiveChargingSession;
  alerts: ActionableAlert[];
  unreadAlertsCount: number;
  filterConnector: string;
  setFilterConnector: (type: string) => void;
  filterMinPower: number;
  setFilterMinPower: (kw: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSimulatingDerate: boolean;
  toggleSimulateDerate: () => void;
  startChargingAtStation: (station: ChargingStation) => void;
  stopActiveSession: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('landing');
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [recommendation, setRecommendation] = useState<StationRecommendation | null>(null);
  const [activeSession, setActiveSession] = useState<LiveChargingSession>(INITIAL_LIVE_SESSION);
  const [alerts, setAlerts] = useState<ActionableAlert[]>([]);
  const [filterConnector, setFilterConnector] = useState<string>('ALL');
  const [filterMinPower, setFilterMinPower] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulatingDerate, setIsSimulatingDerate] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    stationService.getStations().then((data) => {
      setStations(data);
    });
    stationService.getActiveRecommendation().then((rec) => {
      setRecommendation(rec);
    });
    alertService.getAlerts().then((items) => {
      setAlerts(items);
    });
  }, []);

  // Sync hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as AppRoute;
      if (['landing', 'explore', 'session', 'history', 'fleet', 'alerts'].includes(hash)) {
        setCurrentRoute(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const setRoute = (route: AppRoute) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Real-time ticking simulation for live charging session
  useEffect(() => {
    if (activeSession.state !== 'CHARGING') return;

    const timer = setInterval(() => {
      setActiveSession((prev) => {
        // Slightly fluctuate power between 47.8 and 48.6 kW unless derated
        const basePower = isSimulatingDerate ? 31.2 : 48.2;
        const jitter = (Math.random() - 0.5) * 0.4;
        const currentPower = Math.max(10, Number((basePower + jitter).toFixed(1)));

        // Increment delivered energy
        const energyIncrement = (currentPower / 3600) * 2; // 2 seconds tick
        const newEnergy = Number((prev.energyDeliveredKwh + energyIncrement).toFixed(2));
        const newCost = Math.round(newEnergy * prev.tariffPerKwh);

        // SoC progression
        let newSoc = prev.currentSocPercent;
        if (Math.random() > 0.85 && newSoc < prev.targetSocPercent) {
          newSoc = prev.currentSocPercent + 1;
        }

        return {
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 2,
          instantaneousPowerKw: currentPower,
          energyDeliveredKwh: newEnergy,
          estimatedCostTotal: newCost,
          currentSocPercent: newSoc,
          hasDeratingAnomaly: isSimulatingDerate,
          anomalyMessage: isSimulatingDerate
            ? 'Charging speed throttled from 52.4 kW to 31.2 kW due to regional transformer load management.'
            : undefined
        };
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [activeSession.state, isSimulatingDerate]);

  const toggleSimulateDerate = () => {
    setIsSimulatingDerate((prev) => {
      const next = !prev;
      if (next) {
        // Push an actionable alert
        const newAlert: ActionableAlert = {
          id: `alt-${Date.now()}`,
          timestamp: 'Just now',
          severity: 'WARNING',
          title: 'Live Charging Power Derated',
          description: 'Station output dropped from 48.2 kW to 31.2 kW. Sanur Hub Bay 02 is open 4.2 km away.',
          stationName: 'Active Session',
          actionLabel: 'View Alternative',
          actionType: 'NAVIGATE',
          targetId: 'spklu-sanur-hub',
          isRead: false
        };
        setAlerts((curr) => [newAlert, ...curr]);
      }
      return next;
    });
  };

  const startChargingAtStation = (station: ChargingStation) => {
    const ccsBay = station.connectors.find(c => c.status === 'AVAILABLE') || station.connectors[0];
    setActiveSession({
      sessionId: `volt-sess-${Math.floor(Math.random() * 90000 + 10000)}`,
      stationId: station.id,
      stationName: station.name,
      connectorId: ccsBay.id,
      connectorType: ccsBay.type,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      state: 'CHARGING',
      currentSocPercent: 42,
      targetSocPercent: 80,
      instantaneousPowerKw: ccsBay.maxPowerKw > 60 ? 52.4 : 22.0,
      energyDeliveredKwh: 0.1,
      estimatedMinutesToTarget: 24,
      estimatedCostTotal: 0,
      currency: station.currency,
      tariffPerKwh: station.pricingPerKwh,
      powerHistory: [
        { timestamp: 'Just now', powerKw: ccsBay.maxPowerKw > 60 ? 52.4 : 22.0, socPercent: 42, voltageV: 415, currentA: 126 }
      ],
      hasDeratingAnomaly: false
    });
    setRoute('session');
  };

  const stopActiveSession = () => {
    setActiveSession(prev => ({
      ...prev,
      state: 'COMPLETED'
    }));
  };

  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        setRoute,
        stations,
        selectedStation,
        setSelectedStation,
        recommendation,
        activeSession,
        alerts,
        unreadAlertsCount,
        filterConnector,
        setFilterConnector,
        filterMinPower,
        setFilterMinPower,
        searchQuery,
        setSearchQuery,
        isSimulatingDerate,
        toggleSimulateDerate,
        startChargingAtStation,
        stopActiveSession
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
