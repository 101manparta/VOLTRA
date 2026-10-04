import { HistoricSession, LiveChargingSession } from '../types/session';
import { INITIAL_LIVE_SESSION, MOCK_HISTORIC_SESSIONS } from './mock/sessionData';

export const sessionService = {
  async getActiveSession(): Promise<LiveChargingSession> {
    return { ...INITIAL_LIVE_SESSION };
  },

  async getSessionHistory(): Promise<HistoricSession[]> {
    return [...MOCK_HISTORIC_SESSIONS];
  }
};
