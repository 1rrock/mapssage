'use client';

import useKakaoLoader from '@/hooks/useKakaoLoader';
import LoadingScreen from '@/components/common/LoadingScreen';

export function KakaoMapProvider({ children }: { children: React.ReactNode }) {
  const loaded = useKakaoLoader();
  
  if (!loaded) {
    return <LoadingScreen />;
  }
  
  return <>{children}</>;
}
