import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { MapRef, Marker, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Configure same-origin static worker URL to avoid Vite dynamic worker resolution error
if (typeof window !== 'undefined') {
  try {
    const config = (maplibregl as any).config || (maplibregl as any).default?.config;
    if (config) {
      config.WORKER_URL = '/maplibre-gl-worker.mjs';
    }
  } catch (err) {
    console.warn('MapLibre worker config initialization note:', err);
  }
}
import {
  Activity,
  Compass,
  Eye,
  Layers,
  MapPin,
  Navigation,
  Radio,
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react';
import { ChargerMarker } from './ChargerMarker';
import { ChargingStation as MapChargingStation, MapMarkerData } from '../../types/map';
import { ChargingStation as DomainChargingStation } from '../../types/station';
import { StatusIndicator } from '../ui/StatusIndicator';

export type AnyMapStation = MapMarkerData | MapChargingStation | DomainChargingStation;

// Geographically accurate Bali coordinates
export const BALI_GEO_CONFIG = {
  center: {
    latitude: -8.6920,
    longitude: 115.2250
  },
  zoom: 11.6,
  pitch: 46,
  bearing: -14,
  bounds: [114.35, -8.95, 115.80, -8.02] as [number, number, number, number]
};

// Real GPS waypoint corridor from Kuta/Airport to Sanur Mobility Hub along Jl. Bypass Ngurah Rai & Bali Mandara
const REAL_BALI_ROUTE_GEOJSON: any = {
  type: 'Feature',
  properties: {
    name: 'Sanur Corridor Express Route'
  },
  geometry: {
    type: 'LineString',
    coordinates: [
      [115.2340, -8.7250], // Benoa approach
      [115.2420, -8.7180], // Bypass junction
      [115.2485, -8.7110], // Suwung corridor
      [115.2530, -8.7040], // Mertasari junction
      [115.2580, -8.6965], // Your EV position
      [115.2605, -8.6935], // Bypass Ngurah Rai
      [115.2635, -8.6912]  // Sanur Mobility Hub entrance
    ]
  }
};

/**
 * 1. High-resolution Dark-Themed Satellite Imagery Style
 * Combines high-resolution satellite raster with dark atmospheric tint and street labels
 */
export const BALI_SATELLITE_STYLE: any = {
  version: 8,
  sources: {
    'satellite-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Esri, Maxar, Earthstar Geographics'
    },
    'dark-carto-labels': {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
      ],
      tileSize: 256,
      maxzoom: 19
    },
    'road-highways': {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
      ],
      tileSize: 256,
      maxzoom: 19
    }
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite-imagery',
      paint: {
        'raster-brightness-max': 0.88,
        'raster-contrast': 0.18,
        'raster-saturation': -0.1
      }
    },
    {
      id: 'dark-vignette',
      type: 'background',
      paint: {
        'background-color': '#060911',
        'background-opacity': 0.22
      }
    },
    {
      id: 'road-layer',
      type: 'raster',
      source: 'road-highways',
      paint: {
        'raster-opacity': 0.35
      }
    },
    {
      id: 'labels-layer',
      type: 'raster',
      source: 'dark-carto-labels',
      paint: {
        'raster-opacity': 0.95
      }
    }
  ]
};

/**
 * 2. Dark Cyber Style (Clean obsidian vector with high road contrast)
 */
export const BALI_DARK_CYBER_STYLE: any = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'CartoDB / OpenStreetMap'
    }
  },
  layers: [
    {
      id: 'carto-dark-base',
      type: 'raster',
      source: 'carto-dark',
      paint: {
        'raster-brightness-max': 0.9,
        'raster-contrast': 0.15
      }
    }
  ]
};

/**
 * 3. 3D Terrain Topography Style
 */
export const BALI_TERRAIN_STYLE: any = {
  version: 8,
  sources: {
    'opentopo': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 18,
      attribution: 'Esri Topo'
    },
    'dark-overlay': {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
      ],
      tileSize: 256,
      maxzoom: 19
    }
  },
  layers: [
    {
      id: 'topo-base',
      type: 'raster',
      source: 'opentopo',
      paint: {
        'raster-brightness-max': 0.72,
        'raster-contrast': 0.25,
        'raster-saturation': -0.4
      }
    },
    {
      id: 'topo-labels',
      type: 'raster',
      source: 'dark-overlay',
      paint: {
        'raster-opacity': 0.9
      }
    }
  ]
};

function getStationCoordinates(station: AnyMapStation): { lat: number; lng: number } {
  if ('latitude' in station && typeof station.latitude === 'number') {
    return { lat: station.latitude, lng: station.longitude };
  }
  if ('coordinates' in station && station.coordinates) {
    return { lat: station.coordinates.lat, lng: station.coordinates.lng };
  }
  return { lat: -8.6705, lng: 115.2126 };
}

export interface VoltaraMapProps {
  stations?: AnyMapStation[];
  selectedStationId?: string | null;
  onSelectStation?: (station: AnyMapStation) => void;
  className?: string;
  initialPitch?: number;
  children?: React.ReactNode;
}

export const VoltaraMap: React.FC<VoltaraMapProps> = ({
  stations = [],
  selectedStationId,
  onSelectStation,
  className = '',
  initialPitch = BALI_GEO_CONFIG.pitch,
  children
}) => {
  const mapRef = useRef<MapRef | null>(null);

  const [viewState, setViewState] = useState({
    latitude: BALI_GEO_CONFIG.center.latitude,
    longitude: BALI_GEO_CONFIG.center.longitude,
    zoom: BALI_GEO_CONFIG.zoom,
    pitch: initialPitch,
    bearing: BALI_GEO_CONFIG.bearing
  });

  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [mapStyleKey, setMapStyleKey] = useState<'satellite' | 'cyber' | 'topo'>('satellite');

  // Real-time telemetry simulation state
  const [telemetryTick, setTelemetryTick] = useState<number>(0);
  const [vehicleHeading, setVehicleHeading] = useState<number>(34);

  // Live vehicle position on Sanur corridor
  const vehiclePos = useMemo(() => {
    // Subtle GPS drifting along the road to demonstrate real-time telemetry
    const jitter = Math.sin(telemetryTick * 0.4) * 0.0004;
    return {
      lat: -8.6965 + jitter,
      lng: 115.2580 + jitter * 0.5,
      speedKmh: 42 + Math.round(Math.sin(telemetryTick) * 4),
      batteryPercent: 76
    };
  }, [telemetryTick]);

  // Real-time simulation clock (3 seconds intervals)
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTick((t) => t + 1);
      setVehicleHeading((h) => 30 + Math.round(Math.sin(Date.now() / 3000) * 8));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const activeMapStyle = useMemo(() => {
    switch (mapStyleKey) {
      case 'satellite':
        return BALI_SATELLITE_STYLE;
      case 'cyber':
        return BALI_DARK_CYBER_STYLE;
      case 'topo':
        return BALI_TERRAIN_STYLE;
      default:
        return BALI_SATELLITE_STYLE;
    }
  }, [mapStyleKey]);

  // Smoothly fly camera to selected station
  useEffect(() => {
    if (!selectedStationId || !mapRef.current) return;
    const target = stations.find((s) => s.id === selectedStationId);
    if (!target) return;

    const { lat, lng } = getStationCoordinates(target);

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 14.5,
      pitch: is3DMode ? 52 : 0,
      bearing: -15,
      duration: 1200,
      essential: true
    });
  }, [selectedStationId, stations, is3DMode]);

  // Recenter map back to Bali corridor overview
  const handleRecenterBali = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [BALI_GEO_CONFIG.center.longitude, BALI_GEO_CONFIG.center.latitude],
      zoom: BALI_GEO_CONFIG.zoom,
      pitch: is3DMode ? 46 : 0,
      bearing: BALI_GEO_CONFIG.bearing,
      duration: 1000
    });
  }, [is3DMode]);

  // Focus on vehicle
  const handleFocusVehicle = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [vehiclePos.lng, vehiclePos.lat],
      zoom: 15.2,
      pitch: 54,
      bearing: vehicleHeading,
      duration: 1000
    });
  }, [vehiclePos, vehicleHeading]);

  // Toggle 3D Perspective Tilt
  const handleToggle3D = useCallback(() => {
    setIs3DMode((prev) => {
      const next = !prev;
      if (mapRef.current) {
        mapRef.current.easeTo({
          pitch: next ? 48 : 0,
          duration: 600
        });
      }
      return next;
    });
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden border border-white/[0.14] shadow-2xl bg-[#06080F] ${className}`}>
      {/* 1. TOP FLOATING COMMAND BAR */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Corridor badge with live telemetry status */}
        <div className="pointer-events-auto px-3.5 py-2 rounded-2xl bg-[#080C16]/90 backdrop-blur-xl border border-white/15 shadow-xl flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
            </span>
            <span className="font-semibold text-white tracking-tight">Peta Real-Time Bali (WGS84)</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Telemetry Live ({telemetryTick}s)</span>
          </div>
        </div>

        {/* Right: Layer Style & 3D Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Map Style Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-[#080C16]/90 backdrop-blur-xl border border-white/15 shadow-lg">
            <button
              onClick={() => setMapStyleKey('satellite')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-medium transition-all ${
                mapStyleKey === 'satellite'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Citra Satelit Beresolusi Tinggi"
            >
              🛰️ Satelit
            </button>
            <button
              onClick={() => setMapStyleKey('cyber')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-medium transition-all ${
                mapStyleKey === 'cyber'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Peta Cyber Dark Mode"
            >
              🌑 Cyber
            </button>
            <button
              onClick={() => setMapStyleKey('topo')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-medium transition-all ${
                mapStyleKey === 'topo'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Topografi & Elevasi Bali"
            >
              🏔️ Topo
            </button>
          </div>

          {/* 3D Depth Toggle */}
          <button
            onClick={handleToggle3D}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold backdrop-blur-xl border transition-all flex items-center gap-1.5 shadow-md ${
              is3DMode
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                : 'bg-black/70 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
            title="Ubah Perspektif 3D / 2D"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3D {is3DMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Focus Vehicle */}
          <button
            onClick={handleFocusVehicle}
            className="p-2 rounded-xl bg-[#080C16]/90 hover:bg-white/10 backdrop-blur-xl border border-white/15 text-blue-400 hover:text-white transition-all shadow-md"
            title="Fokus ke Mobil Listrik Anda (EV)"
          >
            <Navigation className="w-4 h-4 fill-current rotate-45" />
          </button>

          {/* Recenter Bali Button */}
          <button
            onClick={handleRecenterBali}
            className="p-2 rounded-xl bg-[#080C16]/90 hover:bg-white/10 backdrop-blur-xl border border-white/15 text-slate-300 hover:text-white transition-all shadow-md"
            title="Pusatkan Koridor Bali"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. HIGH-PERFORMANCE WEBGL 3D MAP CANVAS (MapLibre GL) */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: any) => setViewState(evt.viewState)}
        onError={(evt: any) => {
          // Gracefully log worker or network tile warnings without interrupting UI
          if (evt?.error) {
            console.debug('MapLibre notice:', evt.error.message || evt.error);
          }
        }}
        mapLib={maplibregl as any}
        mapStyle={activeMapStyle}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        reuseMaps
      >
        {/* Built-in Navigation & Pitch Controller */}
        <NavigationControl
          position="bottom-right"
          showCompass
          visualizePitch
        />

        {/* 3. REAL-TIME NAVIGATION ROUTE CORRIDOR (GeoJSON Polyline) */}
        <Source id="bali-route" type="geojson" data={REAL_BALI_ROUTE_GEOJSON}>
          {/* Outer glow layer */}
          <Layer
            id="route-glow"
            type="line"
            paint={{
              'line-color': '#10B981',
              'line-width': 8,
              'line-opacity': 0.35,
              'line-blur': 4
            }}
          />
          {/* Inner cyber dashed active route */}
          <Layer
            id="route-core"
            type="line"
            paint={{
              'line-color': '#34D399',
              'line-width': 3.5,
              'line-dasharray': [2, 2]
            }}
          />
        </Source>

        {/* 4. REAL-TIME "YOUR EV" VEHICLE MARKER */}
        <Marker
          latitude={vehiclePos.lat}
          longitude={vehiclePos.lng}
          anchor="center"
          onClick={(e: any) => {
            if (e && e.originalEvent) e.originalEvent.stopPropagation();
            handleFocusVehicle();
          }}
        >
          <div className="relative flex flex-col items-center cursor-pointer group">
            {/* Vehicle Micro HUD Tag */}
            <div className="mb-2 px-2.5 py-0.5 rounded-full bg-blue-950/90 border border-blue-400/50 backdrop-blur-md shadow-xl flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              <span className="text-[11px] font-bold text-white tracking-tight">Mobil Anda (Ioniq 5)</span>
              <span className="text-slate-500 text-[10px]">·</span>
              <span className="font-mono text-[11px] font-bold text-blue-300">
                {vehiclePos.batteryPercent}%
              </span>
              <span className="text-slate-500 text-[10px]">·</span>
              <span className="font-mono text-[10px] text-slate-300">
                {vehiclePos.speedKmh} km/h
              </span>
            </div>

            {/* Glowing 3D Vehicle Radar Node */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 rounded-full border border-blue-400/50 animate-ping opacity-60 pointer-events-none" />
              <div className="absolute w-8 h-8 rounded-full bg-blue-500/20 blur-sm pointer-events-none" />

              <div className="relative z-10 w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 border border-white shadow-[0_0_20px_rgba(59,130,246,0.9)] flex items-center justify-center transition-transform group-hover:scale-115">
                <Navigation
                  className="w-4 h-4 text-slate-950 fill-slate-950 transition-transform duration-300"
                  style={{ transform: `rotate(${vehicleHeading}deg)` }}
                />
              </div>

              {/* Ground Shadow */}
              <div className="absolute -bottom-1.5 w-7 h-2 bg-black/70 rounded-full blur-[2px] pointer-events-none" />
            </div>
          </div>
        </Marker>

        {/* 5. 3D CHARGING STATIONS ANCHORED AT EXACT BALI LAT/LNG */}
        {stations.map((station) => {
          const { lat, lng } = getStationCoordinates(station);
          const isSelected = selectedStationId === station.id;

          const power = 'maxPowerKw' in station ? station.maxPowerKw : 150;
          const confidence = 'confidenceScore' in station
            ? station.confidenceScore
            : station.confidence?.overallScore || 90;

          const rawStatus = 'status' in station ? station.status : 'AVAILABLE';
          const status = (rawStatus ? String(rawStatus).toLowerCase() : 'available') as 'available' | 'busy' | 'offline';

          return (
            <Marker
              key={station.id}
              latitude={lat}
              longitude={lng}
              anchor="bottom"
              onClick={(e: any) => {
                if (e && e.originalEvent) e.originalEvent.stopPropagation();
                onSelectStation?.(station);
              }}
            >
              <ChargerMarker
                latitude={lat}
                longitude={lng}
                status={status}
                stationName={station.name}
                powerKw={power}
                confidenceScore={confidence}
                isSelected={isSelected}
                onClick={() => onSelectStation?.(station)}
              />
            </Marker>
          );
        })}

        {children}
      </Map>

      {/* 6. BOTTOM REAL-TIME TELEMETRY STRIP */}
      <div className="absolute bottom-3 left-4 right-16 z-10 pointer-events-none flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-[#080C16]/90 backdrop-blur-xl border border-white/[0.1] shadow-2xl">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-slate-300 font-semibold">Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-300 font-semibold">Terpakai</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-300 font-semibold">Gangguan/Risiko</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Rute Aktif: Tol Bali Mandara → Sanur Hub
          </span>
          <span className="text-slate-600">·</span>
          <span>Koordinat Asli WGS84</span>
        </div>
      </div>
    </div>
  );
};

export default VoltaraMap;
