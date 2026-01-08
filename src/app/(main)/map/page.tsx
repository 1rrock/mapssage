'use client';

import { useState } from 'react';
import { KakaoMapProvider } from '@/components/map/KakaoMapProvider';
import KakaoMap from '@/components/map/KakaoMap';
import CurrentLocationMarker from '@/components/map/CurrentLocationMarker';
import LocationButton from '@/components/map/LocationButton';
import TraceMarkers from '@/components/trace/TraceMarkers';
import TraceDetailDrawer from '@/components/trace/TraceDetailDrawer';
import TraceListDrawer from '@/components/trace/TraceListDrawer';
import CreateTraceButton from '@/components/trace/CreateTraceButton';
import type { TraceWithDistance } from '@/types/trace';

export default function MapPage() {
  const [selectedTrace, setSelectedTrace] = useState<TraceWithDistance | null>(null);
  const [clusterTraces, setClusterTraces] = useState<TraceWithDistance[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const handleTraceClick = (trace: TraceWithDistance) => {
    setSelectedTrace(trace);
    setDetailOpen(true);
    setListOpen(false); // Close list if navigating to detail
  };

  const handleClusterClick = (traces: TraceWithDistance[]) => {
    setClusterTraces(traces);
    setListOpen(true);
  };

  return (
    <KakaoMapProvider>
      <div className="relative h-screen w-full">
        <KakaoMap>
          <CurrentLocationMarker />
          <TraceMarkers
            onTraceClick={handleTraceClick}
            onClusterClick={handleClusterClick}
          />
        </KakaoMap>
        <LocationButton />
        <CreateTraceButton />

        <TraceListDrawer
          traces={clusterTraces}
          open={listOpen}
          onOpenChange={setListOpen}
          onTraceClick={handleTraceClick}
        />

        <TraceDetailDrawer
          trace={selectedTrace}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </div>
    </KakaoMapProvider>
  );
}
