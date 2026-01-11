import Header from '@/components/layout/Header';
import KakaoSideAd from '@/components/ads/KakaoSideAd';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <KakaoSideAd />
    </div>
  );
}
