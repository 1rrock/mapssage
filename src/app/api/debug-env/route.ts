import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasAuthUrl: !!process.env.AUTH_URL,
    authUrl: process.env.AUTH_URL,
    hasKakaoClientId: !!process.env.KAKAO_CLIENT_ID,
    hasKakaoClientSecret: !!process.env.KAKAO_CLIENT_SECRET,
    hasTursoUrl: !!process.env.TURSO_CONNECTION_URL,
    nodeEnv: process.env.NODE_ENV,
  });
}
