import { MapMarker, MarkerClusterer } from 'react-kakao-maps-sdk';
import { useTraces } from '@/hooks/useTraces';
import useCurrentLocation from '@/hooks/useCurrentLocation';
import type { TraceWithDistance } from '@/types/trace';

interface TraceMarkersProps {
  onTraceClick: (trace: TraceWithDistance) => void;
  onClusterClick: (traces: TraceWithDistance[]) => void;
}

export default function TraceMarkers({ onTraceClick, onClusterClick }: TraceMarkersProps) {
  const { location } = useCurrentLocation();
  const { data: traces } = useTraces(
    location?.latitude ?? 0,
    location?.longitude ?? 0,
    !!location
  );

  if (!traces || traces.length === 0) return null;

  const handleClusterClick = (cluster: any) => {
    const markers = cluster.getMarkers();
    const clusterTraces: TraceWithDistance[] = [];

    markers.forEach((marker: any) => {
      const pos = marker.getPosition();
      // Find the trace that matches this marker's position
      // Using a small epsilon for coordinate matching just in case
      const found = traces.find(t =>
        Math.abs(t.latitude - pos.getLat()) < 0.000001 &&
        Math.abs(t.longitude - pos.getLng()) < 0.000001
      );
      if (found) clusterTraces.push(found);
    });

    if (clusterTraces.length > 0) {
      onClusterClick(clusterTraces);
    }
  };

  return (
    <MarkerClusterer
      averageCenter={true}
      minLevel={1}
      gridSize={60}
      disableClickZoom={true} // We want to show our drawer instead of zooming
      onClusterclick={(_target: any, cluster: any) => handleClusterClick(cluster)}
      styles={[
        {
          width: '56px',
          height: '56px',
          background: 'rgba(0, 0, 0, 0.9)',
          borderRadius: '50%',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900',
          fontSize: '18px',
          border: '4px solid #ffffff',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          zIndex: '10'
        }
      ]}
    >
      {traces.map((trace) => (
        <MapMarker
          key={trace.id}
          position={{ lat: trace.latitude, lng: trace.longitude }}
          onClick={() => onTraceClick(trace)}
          image={{
            src: '/pin.png',
            size: { width: 48, height: 48 },
            options: {
              offset: { x: 24, y: 48 },
            }
          }}
        />
      ))}
    </MarkerClusterer>
  );
}
