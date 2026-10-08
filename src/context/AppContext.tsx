import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActionableAlert } from '../types/alert';
import { LiveChargingSession } from '../types/session';
import { ChargingStation, StationRecommendation } from '../types/station';
import { alertService } from '../services/alertService';
import { authService, UserProfile, UserRole } from '../services/authService';
import { INITIAL_LIVE_SESSION } from '../services/mock/sessionData';
import { sessionService } from '../services/sessionService';
import { stationService } from '../services/stationService';
import { realtimeManager } from '../lib/supabase/realtime';

export type AppRoute = 'landing' | 'explore' | 'session' | 'history' | 'fleet' | 'alerts' | 'operator' | 'admin' | 'office';

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
  // Auth & Roles
  currentUser: UserProfile;
  switchRole: (role: UserRole) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isSupabaseLive: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isLoadingStations: boolean;
  refreshStations: () => Promise<void>;
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
  const [isLoadingStations, setIsLoadingStations] = useState<boolean>(true);

  // Auth & Multi-tenant State
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr-001',
    email: 'driver.bali@voltara.io',
    fullName: 'I Wayan Arya (EV Driver)',
    role: 'USER',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const isSupabaseLive = authService.isConfigured();

  // Load initial profile & data
  const refreshStations = async () => {
    setIsLoadingStations(true);
    try {
      const data = await stationService.getStations({
        searchQuery,
        connectorType: filterConnector,
        minPowerKw: filterMinPower,
      });
      setStations(data);
      const rec = await stationService.getActiveRecommendation();
      setRecommendation(rec);
    } catch (err) {
      console.warn('Error fetching stations:', err);
    } finally {
      setIsLoadingStations(false);
    }
  };

  useEffect(() => {
    authService.getCurrentProfile().then((p) => setCurrentUser(p));
    refreshStations();
    alertService.getAlerts().then((items) => setAlerts(items));
    sessionService.getActiveSession().then((s) => setActiveSession(s));
  }, []);

  // Set up Supabase Realtime subscriptions
  useEffect(() => {
    const channel = realtimeManager.subscribeToChargers((payload) => {
      if (payload.eventType === 'UPDATE' && payload.newRecord) {
        setStations((prev) =>
          prev.map((s) =>
            s.id === payload.newRecord.id
              ? {
                  ...s,
                  status: payload.newRecord.status,
                  queueLength: payload.newRecord.queue_length ?? s.queueLength,
                  confidence: {
                    ...s.confidence,
                    overallScore: payload.newRecord.confidence_score ?? s.confidence.overallScore,
                  },
                  lastReportedAt: payload.newRecord.last_reported_at || new Date().toISOString(),
                }
              : s
          )
        );
      }
    });

    return () => {
      realtimeManager.unsubscribe(channel);
    };
  }, []);

  // Sync hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as AppRoute;
      if (['landing', 'explore', 'session', 'history', 'fleet', 'alerts', 'operator', 'admin'].includes(hash)) {
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

  // Switch Role
  const switchRole = async (role: UserRole) => {
    const profile = await authService.switchDemoPersona(role);
    setCurrentUser(profile);
    if (role === 'OPERATOR') {
      setRoute('operator');
    } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      setRoute('admin');
    } else if (role === 'FLEET_MANAGER') {
      setRoute('fleet');
    }
  };

  const signIn = async (email: string, pass: string) => {
    const res = await authService.signIn(email, pass);
    if (res.success && res.profile) {
      setCurrentUser(res.profile);
    }
    return res;
  };

  const signUp = async (email: string, pass: string, name: string) => {
    return await authService.signUp(email, pass, name, currentUser.role);
  };

  const signOut = async () => {
    await authService.signOut();
    setCurrentUser({
      id: 'usr-guest',
      email: 'guest@voltara.io',
      fullName: 'Tamu (Guest)',
      role: 'USER',
    });
    setRoute('landing');
  };

  // Real-time ticking simulation for live charging session
  useEffect(() => {
    if (activeSession.state !== 'CHARGING') return;

    const timer = setInterval(() => {
      setActiveSession((prev) => {
        const basePower = isSimulatingDerate ? 31.2 : 48.2;
        const jitter = (Math.random() - 0.5) * 0.4;
        const currentPower = Math.max(10, Number((basePower + jitter).toFixed(1)));

        const energyIncrement = (currentPower / 3600) * 2;
        const newEnergy = Number((prev.energyDeliveredKwh + energyIncrement).toFixed(2));
        const newCost = Math.round(newEnergy * prev.tariffPerKwh);

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
            : undefined,
        };
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [activeSession.state, isSimulatingDerate]);

  const toggleSimulateDerate = () => {
    setIsSimulatingDerate((prev) => {
      const next = !prev;
      if (next) {
        const newAlert: ActionableAlert = {
          id: `alt-${Date.now()}`,
          timestamp: 'Baru saja',
          severity: 'WARNING',
          title: 'Live Charging Power Derated',
          description: 'Station output dropped from 48.2 kW to 31.2 kW. Sanur Hub Bay 02 is open 4.2 km away.',
          stationName: 'Active Session',
          actionLabel: 'View Alternative',
          actionType: 'NAVIGATE',
          targetId: 'spklu-sanur-hub',
          isRead: false,
        };
        setAlerts((curr) => [newAlert, ...curr]);
      }
      return next;
    });
  };

  const startChargingAtStation = async (station: ChargingStation) => {
    const ccsBay = station.connectors.find((c) => c.status === 'AVAILABLE') || station.connectors[0];
    const newSession = await sessionService.startSession(
      station.id,
      station.name,
      ccsBay.id,
      ccsBay.type
    );
    setActiveSession(newSession);
    setRoute('session');
  };

  const stopActiveSession = async () => {
    await sessionService.stopSession(activeSession);
    setActiveSession((prev) => ({
      ...prev,
      state: 'COMPLETED',
    }));
  };

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

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
        stopActiveSession,
        currentUser,
        switchRole,
        signIn,
        signUp,
        signOut,
        isSupabaseLive,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isLoadingStations,
        refreshStations,
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
