export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface ActionableAlert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  stationName?: string;
  actionLabel?: string;
  actionType?: 'NAVIGATE' | 'STOP_CHARGE' | 'VIEW_STATION';
  targetId?: string;
  isRead?: boolean;
}
