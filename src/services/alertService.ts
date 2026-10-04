import { ActionableAlert } from '../types/alert';
import { MOCK_ALERTS } from './mock/alertsData';

export const alertService = {
  async getAlerts(): Promise<ActionableAlert[]> {
    return [...MOCK_ALERTS];
  }
};
