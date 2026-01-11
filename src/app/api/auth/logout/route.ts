import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  const cookieOptions = 'Path=/; Secure; SameSite=Lax; Max-Age=0';
  
  const cookiesToDelete = [
    '__Secure-authjs.session-token',
    '__Secure-authjs.callback-url',
    '__Secure-authjs.csrf-token',
    '__Host-authjs.csrf-token',
    '__Secure-authjs.pkce.code_verifier',
  ];

  for (const name of cookiesToDelete) {
    response.headers.append('Set-Cookie', `${name}=; ${cookieOptions}`);
  }

  return response;
}
