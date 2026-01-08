'use client';

import { useMapStore } from '@/stores/mapStore';
import useCurrentLocation from '@/hooks/useCurrentLocation';

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
      className="fixed bottom-28 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl hover:bg-white active:scale-95 transition-all border border-[#E5D5C5]"
      aria-label="현재 위치로 이동"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="h-6 w-6 text-[#264653]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    </button>
  );
}
