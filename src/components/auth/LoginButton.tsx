'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);
      const origin = window.location.origin;
      const callbackPath = searchParams.get('callbackUrl') || '/map';
      const callbackUrl = callbackPath.startsWith('http')
        ? callbackPath
        : `${origin}${callbackPath}`;

      await signIn('kakao', { callbackUrl });
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleKakaoLogin}
      disabled={isLoading}
      className="flex items-center justify-center gap-3 w-full max-w-sm px-6 py-4 bg-[#FEE500] text-[#3A1D1D] rounded-2xl font-bold hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
    >
      {isLoading ? (
        <>
          <div className="h-5 w-5 border-3 border-[#3A1D1D]/20 border-t-[#3A1D1D] rounded-full animate-spin" />
          <span>잠시만 기다려주세요...</span>
        </>
      ) : (
        <>
          <svg className="h-5 w-5" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 0C4.03 0 0 3.12 0 7c0 2.52 1.62 4.73 4.05 6.05L3.22 16.5c-.06.18.13.34.3.25l4.17-2.5c.43.05.87.08 1.31.08 4.97 0 9-3.12 9-7s-4.03-7-9-7z"
              fill="currentColor"
            />
          </svg>
          <span>카카오로 시작하기</span>
        </>
      )}
    </button>
  );
}
