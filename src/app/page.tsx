import { auth } from '@/lib/auth';
import { UserMenu } from '@/components/auth/UserMenu';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Mapssage</h1>
          <UserMenu />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            위치에 메시지을 남기세요
          </h2>
          <p className="text-lg text-muted-foreground">
            현재 위치에 메시지를 남기고, 다른 사람들의 메시지을 발견하세요.
          </p>

          {session?.user ? (
            <div className="space-y-4">
              <p className="text-foreground">
                환영합니다, <span className="font-semibold">{session.user.name}</span>님!
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/map"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  지도 보기
                </Link>
                <Link
                  href="/mypage"
                  className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                >
                  마이페이지
                </Link>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              시작하기
            </Link>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Mapssage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

