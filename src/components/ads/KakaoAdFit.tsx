'use client';

import { useEffect, useRef, useId, useState } from 'react';
import { usePathname } from 'next/navigation';

type AdSize = '160x600' | '320x50';

interface KakaoAdFitProps {
  size: AdSize;
  className?: string;
}

const AD_CONFIGS = {
  '160x600': {
    adUnit: 'DAN-y0tanuSoxDkjUqsA',
    width: 160,
    height: 600,
  },
  '320x50': {
    adUnit: 'DAN-GSXWJED7PxXrSj7c',
    width: 320,
    height: 50,
  },
} as const;

declare global {
  interface Window {
    adfit?: {
      display: (id: string) => void;
      destroy: (id: string) => void;
    };
  }
}

function generateAdId() {
  return `kakao-fit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function isAdfitReady(): boolean {
  return typeof window.adfit === 'object' &&
    window.adfit !== null &&
    typeof window.adfit.display === 'function';
}

export function KakaoAdFit({ size, className = '' }: KakaoAdFitProps) {
  const pathname = usePathname();
  const reactId = useId();
  const [adId, setAdId] = useState<string | null>(null);
  const adRef = useRef<HTMLModElement>(null);
  const displayedRef = useRef(false);
  const config = AD_CONFIGS[size];

  useEffect(() => {
    setAdId(generateAdId());
  }, [pathname, size]);

  useEffect(() => {
    if (!adId) return;

    displayedRef.current = false;

    const displayAd = () => {
      if (displayedRef.current || !adRef.current) return;

      if (isAdfitReady()) {
        try {
          window.adfit!.display(adId);
          displayedRef.current = true;
        } catch {
        }
      }
    };

    const handleAdfitLoaded = () => {
      if (!displayedRef.current) {
        displayAd();
      }
    };

    let retryCount = 0;
    const maxRetries = 20;
    const retryInterval = setInterval(() => {
      if (displayedRef.current || retryCount >= maxRetries) {
        clearInterval(retryInterval);
        return;
      }
      displayAd();
      retryCount++;
    }, 250);

    window.addEventListener('adfitLoaded', handleAdfitLoaded);

    return () => {
      clearInterval(retryInterval);
      window.removeEventListener('adfitLoaded', handleAdfitLoaded);
      if (displayedRef.current && window.adfit?.destroy) {
        try {
          window.adfit.destroy(adId);
        } catch {
        }
      }
    };
  }, [adId]);

  if (!adId) return null;

  return (
    <div className={`flex justify-center ${className}`} key={`${pathname}-${reactId}-${size}`}>
      <ins
        ref={adRef}
        id={adId}
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={config.adUnit}
        data-ad-width={config.width.toString()}
        data-ad-height={config.height.toString()}
      />
    </div>
  );
}

export function KakaoSideAd({ className = '' }: { className?: string }) {
  return (
    <div className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block ${className}`}>
      <KakaoAdFit size="160x600" />
    </div>
  );
}

export function KakaoBannerAd({ className = '' }: { className?: string }) {
  return <KakaoAdFit size="320x50" className={`py-4 ${className}`} />;
}
