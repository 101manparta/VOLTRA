import React, { useMemo, useState } from 'react';
import { Filter, Layers, MapPin, Search, SlidersHorizontal, Sparkles, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChargingStation } from '../types/station';
import { VoltaraMap } from '../components/map/VoltaraMap';
import { StationCard } from '../components/domain/explorer/StationCard';
import { StationDetailModal } from '../components/domain/explorer/StationDetailModal';
import { DecisionCard } from '../components/domain/recommendation/DecisionCard';
import { GlassCard } from '../components/ui/GlassCard';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { TactileButton } from '../components/ui/TactileButton';

export const ExplorerPage: React.FC = () => {
  const {
    stations,
    selectedStation,
    setSelectedStation,
    filterConnector,
    setFilterConnector,
    filterMinPower,
    setFilterMinPower,
    searchQuery,
    setSearchQuery,
    startChargingAtStation,
    isLoadingStations
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'high_confidence'>('all');
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Filtered station collection
  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = station.name.toLowerCase().includes(q);
        const matchesOp = station.operator.toLowerCase().includes(q);
        const matchesAddr = station.address.toLowerCase().includes(q);
        if (!matchesName && !matchesOp && !matchesAddr) return false;
      }

      // Connector filter
      if (filterConnector !== 'ALL') {
        const hasConnector = station.connectors.some(c => c.type === filterConnector);
        if (!hasConnector) return false;
      }

      // Min Power
      if (filterMinPower > 0) {
        const hasPower = station.connectors.some(c => c.maxPowerKw >= filterMinPower);
        if (!hasPower) return false;
      }

      // High confidence tab
      if (activeTab === 'high_confidence' && station.confidence.overallScore < 90) {
        return false;
      }

      return true;
    });
  }, [stations, searchQuery, filterConnector, filterMinPower, activeTab]);

  const handleSelectStation = (station: ChargingStation) => {
    setSelectedStation(station);
    setIsDetailOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 md:py-8 flex flex-col gap-6">
      {/* 1. FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by station, hub, or operator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 backdrop-blur-md font-sans"
          />
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <SegmentedControl
            size="sm"
            value={filterConnector}
            onChange={setFilterConnector}
            options={[
              { id: 'ALL', label: 'All Plugs' },
              { id: 'CCS2', label: 'CCS2' },
              { id: 'Type2', label: 'Type 2' },
              { id: 'CHAdeMO', label: 'CHAdeMO' },
            ]}
          />

          <SegmentedControl
            size="sm"
            value={String(filterMinPower)}
            onChange={(val) => setFilterMinPower(Number(val))}
            options={[
              { id: '0', label: 'Any kW' },
              { id: '50', label: '50+ kW' },
              { id: '120', label: '120+ kW' },
            ]}
          />
        </div>
      </div>

      {/* 2. REPUTATION & RECOMMENDATION DECISION CARD */}
      <DecisionCard />

      {/* 3. MAIN SPLIT COMMAND CENTER: LIST (LEFT) & MAP (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Station Feed (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-2">
              VERIFIED STATIONS ({filteredStations.length})
              {isLoadingStations && (
                <span className="inline-block w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`transition-colors ${activeTab === 'all' ? 'text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                All Stations
              </button>
              <span>·</span>
              <button
                onClick={() => setActiveTab('high_confidence')}
                className={`transition-colors ${activeTab === 'high_confidence' ? 'text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                High Confidence Only (&gt;90%)
              </button>
            </div>
          </div>

          {filteredStations.length === 0 ? (
            <GlassCard variant="base" className="p-8 text-center flex flex-col items-center">
              <MapPin className="w-8 h-8 text-slate-600 mb-2" />
              <h4 className="text-base font-semibold text-white">No stations matching filters</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Try loosening your minimum kilowatt threshold or clearing your search term.
              </p>
              <TactileButton
                variant="glass"
                size="sm"
                onClick={() => {
                  setFilterConnector('ALL');
                  setFilterMinPower(0);
                  setSearchQuery('');
                }}
                className="mt-4"
              >
                Reset Filters
              </TactileButton>
            </GlassCard>
          ) : (
            <div className="flex flex-col gap-3.5">
              {filteredStations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  onSelect={handleSelectStation}
                  onStartSession={startChargingAtStation}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Real Geographic 3D Satellite Map (5 cols, Sticky) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 flex flex-col gap-4">
          <VoltaraMap
            stations={filteredStations}
            selectedStationId={selectedStation?.id}
            onSelectStation={(st) => handleSelectStation(st as any)}
            className="h-[460px] lg:h-[540px]"
          />

          {/* Quick Context Card */}
          <GlassCard variant="base" className="p-4 text-xs font-mono text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Bali SPKLU Corridor: 86% Regional Uptime</span>
            </div>
            <div className="flex items-center gap-3">
              <StatusIndicator lastReportedAt={new Date().toISOString()} variant="compact" />
              <span className="text-slate-300 font-semibold">{stations.length} Active Stations</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* 4. DETAIL MODAL */}
      <StationDetailModal
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onStartSession={startChargingAtStation}
      />
    </div>
  );
};
