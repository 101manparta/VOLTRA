import { ActionableAlert } from '../../types/alert';

export const MOCK_ALERTS: ActionableAlert[] = [
  {
    id: 'alt-01',
    timestamp: '2 minutes ago',
    severity: 'WARNING',
    title: 'Charging Speed Derated',
    description: 'Charging speed dropped from 52 kW to 31 kW due to regional transformer load balancing.',
    stationName: 'Kuta Central Fast Bay',
    actionLabel: 'Reroute to Sanur Hub (+17m faster)',
    actionType: 'NAVIGATE',
    targetId: 'spklu-sanur-hub',
    isRead: false
  },
  {
    id: 'alt-02',
    timestamp: '4 minutes ago',
    severity: 'CRITICAL',
    title: 'Hardware Fault Suspected',
    description: 'Charger Bay #02 at Kuta Fast Bay failed 3 consecutive handshakes with visiting vehicles.',
    stationName: 'Kuta Central Fast Bay',
    actionLabel: 'View Diagnostics',
    actionType: 'VIEW_STATION',
    targetId: 'spklu-kuta-fast',
    isRead: false
  },
  {
    id: 'alt-03',
    timestamp: '9 minutes ago',
    severity: 'INFO',
    title: 'Faster Alternative Freed Up',
    description: 'An ultra-fast 150 kW CCS2 bay just completed charging 1.8 km from your current heading.',
    stationName: 'Sanur Charging Hub',
    actionLabel: 'Switch Destination',
    actionType: 'NAVIGATE',
    targetId: 'spklu-sanur-hub',
    isRead: true
  },
  {
    id: 'alt-04',
    timestamp: '18 minutes ago',
    severity: 'WARNING',
    title: 'Telemetry Freshness Warning',
    description: 'Your selected Ubud station has not pushed a telemetry heartbeat for over 21 minutes.',
    stationName: 'Ubud Valley Eco Point',
    actionLabel: 'Review Stale Notice',
    actionType: 'VIEW_STATION',
    targetId: 'spklu-ubud-valley',
    isRead: true
  }
];
