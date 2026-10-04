import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, AlertTriangle, HelpCircle, Radio, Wifi } from 'lucide-react';

export type FreshnessLevel = 'live' | 'recent' | 'stale' | 'unknown';

export interface StatusIndicatorProps {
  /** ISO 8601 string or numeric timestamp */
  lastReportedAt?: string | number | null;
  /** Visual presentation mode */
  variant?: 'compact' | 'detailed' | 'pill';
  /** Whether to render functional status glyph */
  showIcon?: boolean;
  /** Whether to display exact counting seconds when in live state */
  showExactSeconds?: boolean;
  /** Optional custom label to prefix */
  label?: string;
  /** Additional CSS class names */
  className?: string;
}

export interface FreshnessMeta {
  level: FreshnessLevel;
  secondsAgo: number;
  displayText: string;
  title: string;
  explanation: string;
  ariaLabel: string;
}

export function calculateFreshness(lastReportedAt?: string | number | null, showExactSeconds = true): FreshnessMeta {
  if (!lastReportedAt) {
    return {
      level: 'unknown',
      secondsAgo: Infinity,
      displayText: 'Telemetry unknown',
      title: 'UNKNOWN TELEMETRY',
      explanation: 'No recent heartbeat logged from charger cabinet.',
      ariaLabel: 'Data freshness: Unknown telemetry'
    };
  }

  const timeMs = typeof lastReportedAt === 'number' ? lastReportedAt : new Date(lastReportedAt).getTime();
  if (isNaN(timeMs)) {
    return {
      level: 'unknown',
      secondsAgo: Infinity,
      displayText: 'Telemetry unknown',
      title: 'UNKNOWN TELEMETRY',
      explanation: 'Timestamp could not be parsed.',
      ariaLabel: 'Data freshness: Unknown telemetry'
    };
  }

  const secondsAgo = Math.max(0, Math.floor((Date.now() - timeMs) / 1000));

  if (secondsAgo <= 35) {
    const timeText = showExactSeconds ? `${secondsAgo}s ago` : 'just now';
    return {
      level: 'live',
      secondsAgo,
      displayText: `Updated ${timeText}`,
      title: 'LIVE TELEMETRY',
      explanation: 'Active telemetry stream. Power and availability verified within 35 seconds.',
      ariaLabel: `Data freshness: Live telemetry, updated ${secondsAgo} seconds ago`
    };
  }

  if (secondsAgo < 300) {
    const mins = Math.max(1, Math.floor(secondsAgo / 60));
    return {
      level: 'recent',
      secondsAgo,
      displayText: `Updated ${mins}m ago`,
      title: 'RECENT TELEMETRY',
      explanation: 'Heartbeat within standard polling interval. Minor in-flight variance possible.',
      ariaLabel: `Data freshness: Recent data, updated ${mins} minutes ago`
    };
  }

  const mins = Math.floor(secondsAgo / 60);
  return {
    level: 'stale',
    secondsAgo,
    displayText: `Last updated ${mins}m ago`,
    title: 'STALE DATA NOTICE',
    explanation: 'Cabinet has missed multiple heartbeats. Bay availability cannot be guaranteed.',
    ariaLabel: `Data freshness: Stale data, last updated ${mins} minutes ago`
  };
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  lastReportedAt,
  variant = 'compact',
  showIcon = true,
  showExactSeconds = true,
  label,
  className = ''
}) => {
  const [, setTick] = useState(0);

  // Update second counter periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 10000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const meta = calculateFreshness(lastReportedAt, showExactSeconds);

  // Accessible visual design: color + shape + icon ensures no hue-only state signaling
  const statusConfig = {
    live: {
      dotBg: 'bg-emerald-400',
      dotGlow: 'shadow-[0_0_8px_rgba(52,211,153,0.8)]',
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
      icon: <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
    },
    recent: {
      dotBg: 'bg-amber-400',
      dotGlow: '',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
      icon: <Wifi className="w-3 h-3 text-amber-400" />
    },
    stale: {
      dotBg: 'bg-rose-400',
      dotGlow: 'shadow-[0_0_8px_rgba(244,63,94,0.6)]',
      textColor: 'text-rose-400',
      badgeBg: 'bg-rose-950/40 border-rose-500/30 text-rose-300',
      icon: <AlertTriangle className="w-3 h-3 text-rose-400" />
    },
    unknown: {
      dotBg: 'bg-slate-400',
      dotGlow: '',
      textColor: 'text-slate-400',
      badgeBg: 'bg-slate-900/60 border-slate-700 text-slate-300',
      icon: <HelpCircle className="w-3 h-3 text-slate-400" />
    }
  };

  const config = statusConfig[meta.level];

  // 1. Compact Variant (for lists, table headers, compact card corners)
  if (variant === 'compact') {
    return (
      <div
        role="status"
        aria-label={meta.ariaLabel}
        title={`${meta.title}: ${meta.explanation}`}
        className={`inline-flex items-center gap-1.5 text-xs font-mono tabular-nums select-none ${className}`}
      >
        <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
          {meta.level === 'live' && (
            <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
          )}
          <span className={`w-1.5 h-1.5 rounded-full ${config.dotBg} ${config.dotGlow}`} />
        </span>
        {label && <span className="text-slate-400 font-sans">{label}</span>}
        <span className={`${config.textColor} font-medium tracking-tight`}>
          {meta.displayText}
        </span>
      </div>
    );
  }

  // 2. Pill Variant (for floating cockpits, navigation ribbons, interactive overlays)
  if (variant === 'pill') {
    return (
      <div
        role="status"
        aria-label={meta.ariaLabel}
        title={`${meta.title}: ${meta.explanation}`}
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border backdrop-blur-md text-xs font-mono tabular-nums ${config.badgeBg} ${className}`}
      >
        {showIcon && config.icon}
        <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
          {meta.level === 'live' && (
            <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
          )}
          <span className={`w-1.5 h-1.5 rounded-full ${config.dotBg}`} />
        </span>
        <span className="font-semibold">{meta.displayText}</span>
      </div>
    );
  }

  // 3. Detailed Variant (for station audit view, diagnostics breakdown)
  return (
    <div
      role="status"
      aria-label={meta.ariaLabel}
      className={`flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md ${className}`}
    >
      <div className={`p-2 rounded-xl border shrink-0 ${config.badgeBg}`}>
        {config.icon}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono font-bold tracking-wider uppercase ${config.textColor}`}>
              {meta.title}
            </span>
            <span className="text-slate-600 font-mono">·</span>
            <span className="text-xs font-mono font-semibold text-slate-200 tabular-nums">
              {meta.displayText}
            </span>
          </div>

          <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
            {meta.level === 'live' && (
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
            )}
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotBg} ${config.dotGlow}`} />
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
          {meta.explanation}
        </p>
      </div>
    </div>
  );
};

// Backwards compatibility alias
export const FreshnessIndicator: React.FC<StatusIndicatorProps> = (props) => {
  return <StatusIndicator {...props} />;
};
