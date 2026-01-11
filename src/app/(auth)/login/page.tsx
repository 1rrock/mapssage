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
    <main className="flex flex-col items-center justify-center min-h-[80vh] gap-8 py-12 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-28 w-28 flex items-center justify-center p-0 overflow-hidden animate-bounce">
          <img src="/logo.png" alt="Mapssage 마스코트 로고" className="h-full w-full object-contain" />
        </div>
        <section className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-foreground">Mapssage</h1>
          <p className="text-xl font-medium text-primary">지도의 그 자리에 따뜻한 마음을 남겨보세요</p>
        </section>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <Suspense fallback={<LoginButtonFallback />}>
          <LoginButton />
        </Suspense>

        <p className="text-xs text-foreground/40 text-center leading-relaxed">
          로그인하면 Mapssage의{' '}
          <a href="#" className="underline hover:text-primary transition-colors" aria-label="이용약관 확인">이용약관</a> 및{' '}
          <a href="#" className="underline hover:text-primary transition-colors" aria-label="개인정보처리방침 확인">개인정보처리방침</a>에 동의하게 됩니다.
        </p>
      </div>
    </main>
  );
}
