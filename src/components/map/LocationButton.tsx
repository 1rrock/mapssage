'use client';

import { useMapStore } from '@/stores/mapStore';
import useCurrentLocation from '@/hooks/useCurrentLocation';
import { LocateFixed } from 'lucide-react';

export default function LocationButton() {
  const { forceCenter } = useMapStore();
  const { location } = useCurrentLocation();

  const handleClick = () => {
    if (location) {
      forceCenter(location.latitude, location.longitude);
    }
  };

  if (!location) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-28 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl hover:bg-white active:scale-95 transition-all border border-border"
      aria-label="현재 위치로 이동"
    >
      <LocateFixed className="h-6 w-6 text-foreground" strokeWidth={2.5} />
    </button>
  );
}
