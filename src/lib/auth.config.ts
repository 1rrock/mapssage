import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnAuth = nextUrl.pathname.startsWith('/api/auth');
      const isHome = nextUrl.pathname === '/';

      // Allow authentication endpoints
      if (isOnAuth) {
        return true;
      }

      // Redirect logged-in users away from login page
      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/map', nextUrl));
        }
        return true;
      }

      // Handle Home page
      if (isHome) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/map', nextUrl));
        } else {
          return Response.redirect(new URL('/login', nextUrl));
        }
      }

      // Protect sensitive routes
      const protectedPaths = ['/map', '/mypage', '/api/traces', '/api/upload', '/api/users'];
      const isProtected = protectedPaths.some(path => nextUrl.pathname.startsWith(path));

      if (isProtected) {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/login', nextUrl));
        }
        return true;
      }

      // Allow other public paths by default (e.g. valid public APIs if any)
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
