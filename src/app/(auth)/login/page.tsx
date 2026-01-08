import { LoginButton } from '@/components/auth/LoginButton';
import { Suspense } from 'react';

function LoginButtonFallback() {
  return (
    <button
      disabled
      className="flex items-center justify-center gap-2 w-full max-w-sm px-6 py-3 bg-[#FEE500] text-[#000000] rounded-lg font-semibold opacity-50 cursor-not-allowed"
    >
      <div className="h-5 w-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      <span>로딩 중...</span>
    </button>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-24 w-24 rounded-3xl bg-white shadow-xl flex items-center justify-center p-0 overflow-hidden animate-bounce">
          <img src="/logo.png" alt="Mapssage Logo" className="h-full w-full object-contain" />
        </div>
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-[#264653]">Mapssage</h1>
          <p className="text-xl font-medium text-[#FF5A5F]">지도에 메시지를 남기세요</p>
        </div>
      </div>

      <Suspense fallback={<LoginButtonFallback />}>
        <LoginButton />
      </Suspense>

      <p className="text-xs text-muted-foreground text-center max-w-sm">
        로그인하면 Mapssage의{' '}
        <a href="#" className="underline">이용약관</a> 및{' '}
        <a href="#" className="underline">개인정보처리방침</a>에 동의하게 됩니다.
      </p>
    </div>
  );
}
