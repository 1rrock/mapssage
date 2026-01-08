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
    <header className="fixed top-0 z-50 w-full border-b border-[#000000]/5 bg-[#E3E3E3] transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-10">
          <Link href="/map" className="flex items-center gap-2 group transition-transform hover:scale-105">
            <img src="/logo.png" alt="Mapssage Logo" className="h-8 w-8 object-contain" />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/map"
              className={`text-sm font-bold transition-all relative py-1.5 px-4 rounded-full ${pathname === '/map'
                ? 'bg-black text-white shadow-sm'
                : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
            >
              지도
            </Link>
            <Link
              href="/mypage"
              className={`text-sm font-bold transition-all relative py-1.5 px-4 rounded-full ${pathname === '/mypage'
                ? 'bg-black text-white shadow-sm'
                : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
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
