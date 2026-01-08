'use client';

import { Map } from 'react-kakao-maps-sdk';
import { useMapStore } from '@/stores/mapStore';
import useCurrentLocation from '@/hooks/useCurrentLocation';
import { useEffect, useState, useRef } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

interface KakaoMapProps {
  children?: React.ReactNode;
}

export default function KakaoMap({ children }: KakaoMapProps) {
  const { center, level, setCenter, centerVersion } = useMapStore();
  const { location, error, loading } = useCurrentLocation();
  const [isReady, setIsReady] = useState(false);
  const mapRef = useRef<kakao.maps.Map>(null);

  useEffect(() => {
    if (location) {
      setCenter(location.latitude, location.longitude);
      setIsReady(true);
    } else if (error && !isReady) {
      setCenter(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      setIsReady(true);
    }
  }, [location, error, setCenter, isReady]);

  useEffect(() => {
    if (mapRef.current && centerVersion > 0) {
      const moveLatLng = new kakao.maps.LatLng(center.lat, center.lng);
      mapRef.current.panTo(moveLatLng);
    }
  }, [centerVersion, center.lat, center.lng]);

  if (loading && !isReady) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative h-full w-full">
      {error && (
        <div className="absolute left-6 top-24 z-10 rounded-2xl bg-amber-50/90 backdrop-blur-sm px-4 py-3 text-sm text-amber-800 shadow-lg border border-amber-100 animate-in slide-in-from-top-4">
          <span className="mr-2">📍</span>
          위치 권한이 거부되어 기본 위치(서울)로 표시됩니다
        </div>
      )}
      <Map
        ref={mapRef}
        center={center}
        level={level}
        className="h-full w-full"
        isPanto={true}
      >
        {children}
      </Map>
    </div>
  );
}
