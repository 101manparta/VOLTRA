import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Gauge,
  Layers,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfidenceGauge } from '../components/ui/ConfidenceGauge';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { TactileButton } from '../components/ui/TactileButton';

export const LandingPage: React.FC = () => {
  const { setRoute, stations, startChargingAtStation } = useApp();
  const sampleStation = stations[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative px-4 pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden flex flex-col items-center text-center">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-emerald-400 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>REAL-TIME EV CHARGING INTELLIGENCE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.08] [text-wrap:balance]">
            Know your charge before you drive.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed [text-wrap:balance]">
            Stop gambling on broken plugs, ghost queues, and thermal derating. VOLTARA calculates explainable charging confidence so you arrive at chargers that actually work.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <TactileButton
              variant="primary"
              size="lg"
              icon={<Compass className="w-5 h-5 text-slate-950" />}
              onClick={() => setRoute('explore')}
              className="w-full sm:w-auto"
            >
              Open Charging Explorer
            </TactileButton>

            <TactileButton
              variant="glass"
              size="lg"
              icon={<Zap className="w-5 h-5 text-emerald-400" />}
              onClick={() => setRoute('session')}
              className="w-full sm:w-auto"
            >
              View Live Cockpit Demo
            </TactileButton>
          </div>

          <div className="mt-6 flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>✓ Zero phantom stalls</span>
            <span>·</span>
            <span>✓ Real-time telemetry freshness</span>
            <span>·</span>
            <span>✓ B2B Fleet ready</span>
          </div>
        </div>

        {/* 2. INTERACTIVE PRODUCT PREVIEW CARD */}
        <div className="w-full max-w-4xl mx-auto mt-14 sm:mt-20">
          <GlassCard variant="elevated" className="p-6 md:p-8 text-left border-white/15 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="font-semibold text-slate-200">Live Decision Feed</span>
                  <span>·</span>
                  <StatusIndicator lastReportedAt={sampleStation?.lastReportedAt || new Date().toISOString()} variant="compact" />
                </div>
                <h3 className="text-2xl font-bold text-white mt-1">
                  Sanur Charging Hub
                </h3>
                <p className="text-xs text-slate-300">Jl. Bypass Ngurah Rai No. 88 · 4.2 km away</p>
              </div>

              <div className="flex items-center gap-3">
                <ConfidenceGauge score={96} size={64} />
              </div>
            </div>

            {/* Recommendation banner inside preview */}
            <div className="mt-5 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-400">
                    VOLTARA Recommends this station
                  </span>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">
                    Estimated 17 minutes faster than closer Kuta stall (due to 0 queue & verified 52.4 kW output).
                  </p>
                </div>
              </div>

              <TactileButton
                variant="primary"
                size="sm"
                icon={<Navigation className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />}
                onClick={() => setRoute('explore')}
              >
                Inspect
              </TactileButton>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                <span className="text-slate-400">Available Bays</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">2 / 4</p>
                <span className="text-[10px] text-slate-500">CCS2 & Type 2</span>
              </div>
              <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                <span className="text-slate-400">Observed Speed</span>
                <p className="text-lg font-bold text-white mt-1">52.4 kW</p>
                <span className="text-[10px] text-slate-500">Rated for 150 kW</span>
              </div>
              <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                <span className="text-slate-400">Wait Estimate</span>
                <p className="text-lg font-bold text-white mt-1">0 Queue</p>
                <span className="text-[10px] text-slate-500">Immediate Plug</span>
              </div>
              <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                <span className="text-slate-400">Handshake Success</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">98%</p>
                <span className="text-[10px] text-slate-500">38 sessions in 24h</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 3. THE CORE PRINCIPLE: DATA -> UNDERSTAND -> DECIDE -> ACT */}
      <section className="px-4 py-20 bg-[#090D15] border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
              The Decision Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              From raw telemetry to confident action.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3">
              Finding a charger isn't the problem. Knowing whether it will successfully charge your car at full speed without a 40-minute wait is what matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard variant="base" className="p-6">
              <span className="font-mono text-2xl font-bold text-emerald-400">01</span>
              <h4 className="text-lg font-bold text-white mt-3">DATA</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Direct CPO telemetry, real-time power fluctuation feeds, hardware handshake logs, and timestamped queue records.
              </p>
            </GlassCard>

            <GlassCard variant="base" className="p-6">
              <span className="font-mono text-2xl font-bold text-emerald-400">02</span>
              <h4 className="text-lg font-bold text-white mt-3">UNDERSTAND</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Deconstruct reliability into 5 transparent vectors: slot availability, session success rate, power stability, network ping, and payment health.
              </p>
            </GlassCard>

            <GlassCard variant="base" className="p-6">
              <span className="font-mono text-2xl font-bold text-emerald-400">03</span>
              <h4 className="text-lg font-bold text-white mt-3">DECIDE</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Synthesize travel distance, queue delay, and charging speed into clear comparative tradeoffs. "17 minutes faster than closer stall."
              </p>
            </GlassCard>

            <GlassCard variant="base" className="p-6">
              <span className="font-mono text-2xl font-bold text-emerald-400">04</span>
              <h4 className="text-lg font-bold text-white mt-3">ACT</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Direct navigation with pre-conditioning recommendations and 1-click active session monitoring on your cockpit screen.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 4. DATA FRESHNESS & TRUST MANIFESTO */}
      <section className="px-4 py-20 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
            Zero Guesswork
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
            The Trust & Freshness Standard
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            We never pretend stale data is real-time. VOLTARA explicitly communicates the exact age of every telemetry ping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard variant="base" className="p-6 border-emerald-500/20">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>LIVE TELEMETRY</span>
            </div>
            <h4 className="text-base font-semibold text-white mt-3">Updated &lt; 30s ago</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Hardware heartbeat active. Live kilowatt readings, instant bay status changes, and active session countdowns.
            </p>
          </GlassCard>

          <GlassCard variant="base" className="p-6 border-amber-500/20">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>RECENT DATA</span>
            </div>
            <h4 className="text-base font-semibold text-white mt-3">Updated 1m – 5m ago</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Acceptable accuracy for route planning. Confidence score applies minor discount for potential in-transit occupancy.
            </p>
          </GlassCard>

          <GlassCard variant="base" className="p-6 border-rose-500/20">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>STALE DATA NOTICE</span>
            </div>
            <h4 className="text-base font-semibold text-white mt-3">Updated &gt; 15m ago</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Explicit warning displayed. Network drop or cellular timeout at charger cabinet. Recommendation demoted.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="px-4 py-20 bg-gradient-to-b from-[#07090E] to-[#0A0E17] border-t border-white/[0.08] text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white [text-wrap:balance]">
            Experience EV intelligence built for certainty.
          </h2>
          <p className="text-slate-300 mt-4 max-w-xl text-sm sm:text-base">
            Join drivers and fleet operators using VOLTARA to eliminate charging anxiety across urban and intercity routes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <TactileButton
              variant="primary"
              size="lg"
              icon={<Compass className="w-5 h-5 text-slate-950" />}
              onClick={() => setRoute('explore')}
            >
              Open Charging Explorer
            </TactileButton>

            <TactileButton
              variant="glass"
              size="lg"
              onClick={() => setRoute('fleet')}
            >
              Explore Fleet SaaS
            </TactileButton>
          </div>
        </div>
      </section>
    </div>
  );
};
