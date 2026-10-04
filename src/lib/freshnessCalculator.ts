/**
 * VOLTARA Freshness Calculation Engine
 * 
 * Strict deterministic classification:
 * - < 30 seconds: LIVE
 * - 30 seconds - 5 minutes: RECENT
 * - 5 - 20 minutes: STALE
 * - > 20 minutes: VERY_STALE
 */

export type FreshnessClassification = 'LIVE' | 'RECENT' | 'STALE' | 'VERY_STALE';

export interface FreshnessInfo {
  status: FreshnessClassification;
  ageSeconds: number;
  label: string;
  formattedRelative: string;
  isStale: boolean;
}

export function calculateFreshness(lastReportedAt: string | Date | number | null | undefined): FreshnessInfo {
  if (!lastReportedAt) {
    return {
      status: 'VERY_STALE',
      ageSeconds: 999999,
      label: 'Data Tidak Tersedia',
      formattedRelative: 'Unknown',
      isStale: true
    };
  }

  const reportTime = typeof lastReportedAt === 'number' 
    ? lastReportedAt 
    : new Date(lastReportedAt).getTime();
  
  const now = Date.now();
  const ageSeconds = Math.max(0, Math.floor((now - reportTime) / 1000));

  let status: FreshnessClassification = 'VERY_STALE';
  let label = 'Sangat Kedaluwarsa';
  let formattedRelative = '';

  if (ageSeconds < 30) {
    status = 'LIVE';
    label = 'Real-time Langsung';
    formattedRelative = ageSeconds <= 2 ? 'Baru saja' : `${ageSeconds} detik lalu`;
  } else if (ageSeconds < 300) { // 5 minutes
    status = 'RECENT';
    label = 'Baru Diperbarui';
    const mins = Math.floor(ageSeconds / 60);
    formattedRelative = mins <= 1 ? '1 menit lalu' : `${mins} menit lalu`;
  } else if (ageSeconds < 1200) { // 20 minutes
    status = 'STALE';
    label = 'Data Tertunda';
    const mins = Math.floor(ageSeconds / 60);
    formattedRelative = `${mins} menit lalu`;
  } else {
    status = 'VERY_STALE';
    label = 'Kedaluwarsa (>20m)';
    const mins = Math.floor(ageSeconds / 60);
    formattedRelative = mins < 60 ? `${mins} menit lalu` : `${Math.floor(mins / 60)} jam lalu`;
  }

  return {
    status,
    ageSeconds,
    label,
    formattedRelative,
    isStale: status === 'STALE' || status === 'VERY_STALE'
  };
}
