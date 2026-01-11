'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from '@/components/auth/UserMenu';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path
      ? 'text-primary font-semibold'
      : 'text-gray-600 hover:text-primary';

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background transition-all" role="banner">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-10">
          <Link
            href="/map"
            className="flex items-center gap-2 group transition-transform hover:scale-105"
            aria-label="Mapssage 홈으로 이동"
          >
            <img src="/logo.png" alt="Mapssage Logo" className="h-10 w-10 object-contain" />
          </Link>
          <nav className="hidden items-center gap-4 md:flex" aria-label="메인 네비게이션">
            <Link
              href="/map"
              className={`text-sm font-bold transition-all relative py-2 px-6 rounded-full ${pathname === '/map'
                ? 'bg-primary text-white shadow-md'
                : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                }`}
              aria-current={pathname === '/map' ? 'page' : undefined}
            >
              지도
            </Link>
            <Link
              href="/mypage"
              className={`text-sm font-bold transition-all relative py-2 px-6 rounded-full ${pathname === '/mypage'
                ? 'bg-primary text-white shadow-md'
                : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                }`}
              aria-current={pathname === '/mypage' ? 'page' : undefined}
            >
              마이페이지
            </Link>
          </nav>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
