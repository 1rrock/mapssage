import NextAuth from 'next-auth';
import KakaoProvider from 'next-auth/providers/kakao';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './db';
import { authConfig } from './auth.config';
import { users, accounts, sessions } from './db/schema';
import { JWT } from 'next-auth/jwt';
import { generateRandomNickname } from './nickname';

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch("https://kauth.kakao.com/oauth/token", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.KAKAO_CLIENT_ID!,
        client_secret: process.env.KAKAO_CLIENT_SECRET!,
        refresh_token: token.refreshToken as string,
      }),
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    } as JWT;
  } catch (error) {
    console.error("RefreshAccessTokenError", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    } as JWT;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: true,
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      authorization: {
        url: "https://kauth.kakao.com/oauth/authorize",
        params: { scope: "profile_nickname profile_image" }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile, email, credentials }) {
      if (user && !user.name) {
        user.name = generateRandomNickname();
        // Set default image if not provided
        if (!user.image) {
          user.image = '/default-avatar.png'; // Or use R2 URL later
        }
      }
      return true;
    },
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        // Calculate expiration time (account.expires_at is usually in seconds)
        // If undefined, default to 1 hour (3600s)
        const expiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: expiresAt,
          user: {
            id: user.id, // Ensure user ID is preserved in token
            name: user.name,
            email: user.email,
            image: user.image
          }
        };
      }

      // Return previous token if the access token has not expired yet
      // Added a 10-second buffer
      if (Date.now() < (token.expiresAt as number) - 10000) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.user && session.user) {
        session.user.id = (token.user as any).id;
        session.user.name = (token.user as any).name;
        session.user.image = (token.user as any).image;
      }

      // We can expose error to the client if refresh failed
      if (token.error) {
        (session as any).error = token.error;
      }

      return session;
    },
  },
  // Keep the insecure cookie for localhost dev if needed, 
  // but standard NextAuth handles this. Re-adding user's preference just in case
  cookies: {
    sessionToken: {
      name: 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
});
