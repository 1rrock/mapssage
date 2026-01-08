'use client';

import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import useCurrentLocation from '@/hooks/useCurrentLocation';

export default function CurrentLocationMarker() {
  const { location } = useCurrentLocation();

  if (!location) return null;

  return (
    <CustomOverlayMap
      position={{ lat: location.latitude, lng: location.longitude }}
      yAnchor={0.5}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute h-12 w-12 animate-ping rounded-full bg-blue-400 opacity-75" />
        <div className="relative h-6 w-6 rounded-full border-4 border-white bg-blue-500 shadow-lg" />
      </div>
    </CustomOverlayMap>
  );
}
