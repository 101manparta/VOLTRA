import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Globe,
  HardDrive,
  Layers,
  Lock,
  RefreshCw,
  Server,
  Shield,
  Users,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricDisplay } from '../components/ui/MetricDisplay';
import { TactileButton } from '../components/ui/TactileButton';

export const AdminPage: React.FC = () => {
  const { currentUser, isSupabaseLive, stations, alerts } = useApp();

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  const mockAuditLogs = [
    {
      id: 'log-01',
      timestamp: '1 menit lalu',
      actor: 'system.daemon@voltara.io',
      action: 'SPKLU_LOCATION_SYNC',
      details: 'PostGIS ST_DWithin calculated for 8 Bali hubs',
      status: 'SUCCESS'
    },
    {
      id: 'log-02',
      timestamp: '14 menit lalu',
      actor: 'ops.pln@voltara.io',
      action: 'CHARGER_STATUS_UPDATE',
      details: 'SPKLU Sanur Fast Hub bay 02 changed to OCCUPIED',
      status: 'SUCCESS'
    },
    {
      id: 'log-03',
      timestamp: '1 jam lalu',
      actor: 'security.root@voltara.io',
      action: 'RLS_SECURITY_AUDIT',
      details: 'Verified 13 tables with Row Level Security enabled',
      status: 'VERIFIED'
    }
  ];

  const mockDataSources = [
    {
      name: 'PLN UID Bali Telemetry Feed',
      code: 'PLN-BALI-OCPP',
      protocol: 'OCPP 2.0.1 JSON/WSS',
      status: 'ACTIVE',
      lastPing: '12 detik lalu',
      latency: '24 ms'
    },
    {
      name: 'Voltron Network Gateway',
      code: 'VOLTRON-ID-API',
      protocol: 'OCPI 2.2.1 REST',
      status: 'ACTIVE',
      lastPing: '45 detik lalu',
      latency: '58 ms'
    },
    {
      name: 'Starvo CPO Realtime Ingest',
      code: 'STARVO-BALI-INGEST',
      protocol: 'MQTT 3.1.1 Broker',
      status: 'ACTIVE',
      lastPing: '3 menit lalu',
      latency: '112 ms'
    }
  ];

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Akses Dibatasi — Khusus Administrator</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Halaman ini memerlukan hak akses tingkat peran <code>ADMIN</code> atau <code>SUPER_ADMIN</code> yang dilindungi oleh Supabase Row Level Security (RLS).
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      {/* Admin Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>VOLTARA PLATFORM GOVERNANCE & AUDIT</span>
            <span>·</span>
            <span className="text-slate-300 font-semibold">{currentUser.role}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Platform Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Status PostgreSQL PostGIS, integritas RLS, federasi multi-CPO, dan audit jejak keamanan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostGIS: Aktif</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>RLS: 13 Tabel Terlindungi</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Total Pengguna Terdaftar"
            value="1,420"
            unit="akun"
            subtext="Supabase Auth Users"
          />
        </GlassCard>

        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Organisasi Multi-Tenant"
            value="4"
            unit="entitas"
            subtext="3 Operator · 1 Fleet"
          />
        </GlassCard>

        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Stasiun SPKLU Terindeks"
            value={stations.length}
            unit="lokasi"
            subtext="Koridor Bali & Tol Mandara"
          />
        </GlassCard>

        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Peringatan Operasional"
            value={alerts.length}
            unit="peringatan"
            subtext="Keandalan Jaringan 99.4%"
          />
        </GlassCard>
      </div>

      {/* Data Sources and Ingest Pipeline */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            Pipa Ingest Data Provider Eksternal (CPO Adapters)
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Model Data Ternormalisasi VOLTARA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockDataSources.map((ds) => (
            <GlassCard key={ds.code} variant="base" className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {ds.status}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{ds.latency}</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1">{ds.name}</h4>
              <p className="text-xs font-mono text-slate-400 mb-4">{ds.protocol}</p>
              <div className="pt-3 border-t border-white/10 flex justify-between text-xs font-mono text-slate-400">
                <span>Ping Terakhir:</span>
                <span className="text-slate-200">{ds.lastPing}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Security Audit Trail */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Log Jejak Audit Keamanan (Immutable Audit Logs)
          </h3>
          <span className="text-xs font-mono text-slate-400">
            PostgreSQL public.audit_logs
          </span>
        </div>

        <GlassCard variant="base" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.03] text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-3.5">WAKTU</th>
                  <th className="p-3.5">AKTOR</th>
                  <th className="p-3.5">AKSI KEAMANAN</th>
                  <th className="p-3.5">RINCIAN MUTASI</th>
                  <th className="p-3.5 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 text-slate-400">{log.timestamp}</td>
                    <td className="p-3.5 text-emerald-400">{log.actor}</td>
                    <td className="p-3.5 font-bold text-white">{log.action}</td>
                    <td className="p-3.5 text-slate-300">{log.details}</td>
                    <td className="p-3.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
