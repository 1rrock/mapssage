import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mapssage.zxcv1685.workers.dev"),
  title: {
    default: "Mapssage - 위치에 메시지를 남기세요",
    template: "%s | Mapssage"
  },
  description: "Mapssage - 현재 위치에 메시지를 남기고 공유하는 지도 기반 소셜 서비스. 소중한 순간을 지도의 그 위치에 기록해보세요.",
  keywords: ["지도", "메시지", "소셜", "위치기반", "기록", "공유"],
  authors: [{ name: "Mapssage Team" }],
  openGraph: {
    title: "Mapssage - 위치에 메시지를 남기세요",
    description: "현재 위치에 메시지를 남기고 공유하는 지도 기반 소셜 서비스",
    url: "/",
    siteName: "Mapssage",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mapssage - 위치에 메시지를 남기세요",
    description: "현재 위치에 메시지를 남기고 공유하는 지도 기반 소셜 서비스",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
