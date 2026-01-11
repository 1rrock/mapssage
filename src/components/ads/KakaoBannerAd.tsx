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

export default function KakaoBannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !containerRef.current) return;

    const ins = document.createElement('ins');
    ins.className = 'kakao_ad_area';
    ins.style.display = 'none';
    ins.setAttribute('data-ad-unit', 'DAN-GSXWJED7PxXrSj7c');
    ins.setAttribute('data-ad-width', '320');
    ins.setAttribute('data-ad-height', '50');

    containerRef.current.appendChild(ins);
    initialized.current = true;

    if (window.adfit) {
      window.adfit.display('DAN-GSXWJED7PxXrSj7c');
    }

    return () => {
      if (window.adfit) {
        window.adfit.destroy('DAN-GSXWJED7PxXrSj7c');
      }
    };
  }, []);

  return (
    <div className="flex justify-center py-4">
      <div
        ref={containerRef}
        style={{ width: 320, height: 50 }}
      />
    </div>
  );
}
