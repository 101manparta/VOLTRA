import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Layers,
  Power,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { stationService } from '../services/stationService';
import { ChargingStation } from '../types/station';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricDisplay } from '../components/ui/MetricDisplay';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { TactileButton } from '../components/ui/TactileButton';

export const OperatorPage: React.FC = () => {
  const { currentUser, setRoute } = useApp();
  const [operatorStations, setOperatorStations] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);

  const orgName = currentUser.organizationName || 'PLN UID Bali (Icon+)';

  const loadStations = async () => {
    setIsLoading(true);
    const all = await stationService.getStations();
    // Filter stations matching this operator
    const filtered = all.filter(s =>
      s.operator.toLowerCase().includes('pln') ||
      s.name.toLowerCase().includes('pln') ||
      currentUser.role === 'ADMIN' ||
      currentUser.role === 'SUPER_ADMIN'
    );
    setOperatorStations(filtered);
    if (filtered.length > 0 && !selectedStation) {
      setSelectedStation(filtered[0]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadStations();
  }, [currentUser]);

  const totalChargers = operatorStations.length;
  const onlineChargers = operatorStations.filter(s => s.status === 'AVAILABLE' || s.status === 'OCCUPIED').length;
  const faultChargers = operatorStations.filter(s => s.status === 'FAULT').length;
  const offlineChargers = operatorStations.filter(s => s.status === 'OFFLINE').length;
  const totalBays = operatorStations.reduce((acc, s) => acc + s.connectors.length, 0);
  const activeBays = operatorStations.reduce(
    (acc, s) => acc + s.connectors.filter(c => c.status === 'OCCUPIED').length,
    0
  );
  const networkReliability = totalChargers > 0
    ? Math.round((onlineChargers / totalChargers) * 100)
    : 98;

  const handleToggleStatus = async (stationId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
    await stationService.updateChargerStatus(stationId, nextStatus as any);
    await loadStations();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      {/* Operator Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CPO CHARGE POINT OPERATOR COMMAND</span>
            <span>·</span>
            <span className="text-slate-300 font-semibold">{orgName}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Operator Live Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pemantauan langsung status daya, proteksi isolasi bay, antrean fisik, dan kepatuhan OCPP 2.0.1.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <TactileButton
            variant="glass"
            size="sm"
            onClick={loadStations}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Segarkan
          </TactileButton>
          <TactileButton
            variant="primary"
            size="sm"
            onClick={() => setRoute('explore')}
            icon={<ArrowUpRight className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />}
          >
            Buka Peta Bali
          </TactileButton>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Total Stasiun Dikelola"
            value={totalChargers}
            unit="hub"
            subtext={`${totalBays} Konektor Aktif`}
          />
        </GlassCard>

        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Stasiun Online"
            value={onlineChargers}
            unit="aktif"
            trend={`${networkReliability}%`}
            subtext="Keandalan Jaringan"
          />
        </GlassCard>

        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Bay Terpakai"
            value={activeBays}
            unit={`/ ${totalBays}`}
            subtext="Sesi Pengisian Langsung"
          />
        </GlassCard>

        <GlassCard variant="base" className="p-5">
          <MetricDisplay
            label="Gangguan / Derating"
            value={faultChargers}
            unit="peringatan"
            trend={faultChargers > 0 ? "Fault" : undefined}
            subtext={offlineChargers > 0 ? `${offlineChargers} Hub Offline` : 'Seluruh Hub Normal'}
          />
        </GlassCard>
      </div>

      {/* Chargers Grid with Real-time Status Control */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            Daftar Aset Stasiun SPKLU ({operatorStations.length})
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Terikat dengan RLS Organisasi: {orgName}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {operatorStations.map((station) => {
            const isAvail = station.status === 'AVAILABLE';
            const isFault = station.status === 'FAULT';

            return (
              <GlassCard key={station.id} variant="base" className="p-5 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-base font-bold text-white">{station.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{station.address}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isAvail
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isFault
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {station.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs font-mono mt-3">
                    <div className="flex justify-between text-slate-400">
                      <span>Indeks Kepercayaan:</span>
                      <span className="text-emerald-400 font-bold">{station.confidence.overallScore}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Tarif per kWh:</span>
                      <span className="text-white">Rp {station.pricingPerKwh.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Antrean Lapangan:</span>
                      <span className="text-white">{station.queueLength} Kendaraan</span>
                    </div>
                  </div>

                  {/* Connectors status */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Konektor Bay</span>
                    <div className="flex flex-wrap gap-1.5">
                      {station.connectors.map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'AVAILABLE' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {c.type} · {c.maxPowerKw} kW
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <StatusIndicator lastReportedAt={station.lastReportedAt} variant="compact" />

                  <TactileButton
                    variant="glass"
                    size="sm"
                    onClick={() => handleToggleStatus(station.id, station.status)}
                  >
                    Ubah Status Sesi
                  </TactileButton>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
