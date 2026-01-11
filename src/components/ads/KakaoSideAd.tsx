'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adfit?: {
      display: (unitId: string) => void;
      destroy: (unitId: string) => void;
    };
  }
}

export default function KakaoSideAd() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !containerRef.current) return;

    const ins = document.createElement('ins');
    ins.className = 'kakao_ad_area';
    ins.style.display = 'none';
    ins.setAttribute('data-ad-unit', 'DAN-y0tanuSoxDkjUqsA');
    ins.setAttribute('data-ad-width', '160');
    ins.setAttribute('data-ad-height', '600');

    containerRef.current.appendChild(ins);
    initialized.current = true;

    if (window.adfit) {
      window.adfit.display('DAN-y0tanuSoxDkjUqsA');
    }

    return () => {
      if (window.adfit) {
        window.adfit.destroy('DAN-y0tanuSoxDkjUqsA');
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
      style={{ width: 160, height: 600 }}
    />
  );
}
