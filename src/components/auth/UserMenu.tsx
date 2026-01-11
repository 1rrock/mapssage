'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const queryClient = useQueryClient();

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);
      setIsOpen(false);

      queryClient.clear();

      await signOut({ callbackUrl: '/login', redirect: true });
    } catch (error) {
      console.error('Sign out failed:', error);
      setIsSigningOut(false);
    }
  }, [isSigningOut, queryClient]);

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#F3E5D8] transition-all border border-transparent hover:border-[#E5D5C5]"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || '사용자'}
            className="w-9 h-9 rounded-full border border-white shadow-sm"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#FF5A5F]/10 flex items-center justify-center text-[#FF5A5F] font-bold shadow-inner">
            {session.user.name?.[0] || '?'}
          </div>
        )}
        <span className="text-sm font-bold text-[#264653] hidden md:block">
          {session.user.name || '사용자'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium text-foreground">
                {session.user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>

            <div className="py-1">
              <Link
                href="/mypage"
                className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                마이페이지
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
