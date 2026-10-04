import React from 'react';
import { ChargingStation } from '../../../types/station';
import { VoltaraMap } from '../../map/VoltaraMap';

interface InteractiveSchematicMapProps {
  stations: ChargingStation[];
  selectedStation: ChargingStation | null;
  onSelectStation: (station: ChargingStation) => void;
  className?: string;
}

/**
 * Backward compatibility wrapper:
 * Renders the real geographic 3D satellite/vector map of Bali (VoltaraMap)
 * with real coordinates, real roads, and live vehicle tracking.
 */
export const InteractiveSchematicMap: React.FC<InteractiveSchematicMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  className = ''
}) => {
  return (
    <VoltaraMap
      stations={stations}
      selectedStationId={selectedStation?.id}
      onSelectStation={(st) => onSelectStation(st as ChargingStation)}
      className={className}
    />
  );
};

export default InteractiveSchematicMap;
