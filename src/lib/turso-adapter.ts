/**
 * Custom Auth.js adapter using @libsql/client
 * Bypasses Drizzle completely for Cloudflare Workers compatibility
 */
import { createClient, Client } from '@libsql/client/web';
import type { Adapter } from 'next-auth/adapters';

function generateId(): string {
  return crypto.randomUUID();
}

function createTursoClient(): Client {
  const url = process.env.TURSO_CONNECTION_URL!;
  const authToken = process.env.TURSO_AUTH_TOKEN!;
  return createClient({ url, authToken });
}

export function TursoAdapter(): Adapter {
  return {
    async createUser(user) {
      const client = createTursoClient();
      const id = (user as any).id || generateId();
      
      await client.execute({
        sql: `INSERT INTO users (id, name, email, email_verified, image) VALUES (?, ?, ?, ?, ?)`,
        args: [id, user.name ?? null, user.email ?? null, user.emailVerified?.getTime() ?? null, user.image ?? null],
      });

      return {
        id,
        name: user.name ?? null,
        email: user.email ?? '',
        emailVerified: user.emailVerified ?? null,
        image: user.image ?? null,
      };
    },

    async getUser(id) {
      const client = createTursoClient();
      const result = await client.execute({
        sql: `SELECT id, name, email, email_verified, image FROM users WHERE id = ?`,
        args: [id],
      });

      const row = result.rows[0];
      if (!row) return null;

      return {
        id: row.id as string,
        name: row.name as string | null,
        email: (row.email as string) ?? '',
        emailVerified: row.email_verified ? new Date(row.email_verified as number) : null,
        image: row.image as string | null,
      };
    },

    async getUserByEmail(email) {
      const client = createTursoClient();
      const result = await client.execute({
        sql: `SELECT id, name, email, email_verified, image FROM users WHERE email = ?`,
        args: [email],
      });

      const row = result.rows[0];
      if (!row) return null;

      return {
        id: row.id as string,
        name: row.name as string | null,
        email: (row.email as string) ?? '',
        emailVerified: row.email_verified ? new Date(row.email_verified as number) : null,
        image: row.image as string | null,
      };
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const client = createTursoClient();
      const result = await client.execute({
        sql: `SELECT u.id, u.name, u.email, u.email_verified, u.image 
              FROM users u 
              INNER JOIN accounts a ON u.id = a.user_id 
              WHERE a.provider = ? AND a.provider_account_id = ?`,
        args: [provider, providerAccountId],
      });

      const row = result.rows[0];
      if (!row) return null;

      return {
        id: row.id as string,
        name: row.name as string | null,
        email: (row.email as string) ?? '',
        emailVerified: row.email_verified ? new Date(row.email_verified as number) : null,
        image: row.image as string | null,
      };
    },

    async updateUser(user) {
      const client = createTursoClient();
      
      await client.execute({
        sql: `UPDATE users SET name = ?, email = ?, email_verified = ?, image = ? WHERE id = ?`,
        args: [
          user.name ?? null,
          user.email ?? null,
          user.emailVerified?.getTime() ?? null,
          user.image ?? null,
          user.id,
        ],
      });

      const result = await client.execute({
        sql: `SELECT id, name, email, email_verified, image FROM users WHERE id = ?`,
        args: [user.id],
      });

      const row = result.rows[0];
      return {
        id: row.id as string,
        name: row.name as string | null,
        email: (row.email as string) ?? '',
        emailVerified: row.email_verified ? new Date(row.email_verified as number) : null,
        image: row.image as string | null,
      };
    },

    async deleteUser(userId) {
      const client = createTursoClient();
      await client.execute({
        sql: `DELETE FROM users WHERE id = ?`,
        args: [userId],
      });
    },

    async linkAccount(account) {
      const client = createTursoClient();
      const id = generateId();

      await client.execute({
        sql: `INSERT INTO accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token ?? null,
          account.access_token ?? null,
          account.expires_at ?? null,
          account.token_type ?? null,
          account.scope ?? null,
          account.id_token ?? null,
          (account.session_state as string) ?? null,
        ],
      });

      return account;
    },

    async unlinkAccount({ provider, providerAccountId }) {
      const client = createTursoClient();
      await client.execute({
        sql: `DELETE FROM accounts WHERE provider = ? AND provider_account_id = ?`,
        args: [provider, providerAccountId],
      });
    },

    async createSession(session) {
      const client = createTursoClient();

      await client.execute({
        sql: `INSERT INTO sessions (session_token, user_id, expires) VALUES (?, ?, ?)`,
        args: [session.sessionToken, session.userId, session.expires.getTime()],
      });

      return session;
    },

    async getSessionAndUser(sessionToken) {
      const client = createTursoClient();
      const result = await client.execute({
        sql: `SELECT s.session_token, s.user_id, s.expires, u.id, u.name, u.email, u.email_verified, u.image
              FROM sessions s
              INNER JOIN users u ON s.user_id = u.id
              WHERE s.session_token = ?`,
        args: [sessionToken],
      });

      const row = result.rows[0];
      if (!row) return null;

      return {
        session: {
          sessionToken: row.session_token as string,
          userId: row.user_id as string,
          expires: new Date(row.expires as number),
        },
        user: {
          id: row.id as string,
          name: row.name as string | null,
          email: (row.email as string) ?? '',
          emailVerified: row.email_verified ? new Date(row.email_verified as number) : null,
          image: row.image as string | null,
        },
      };
    },

    async updateSession(session) {
      const client = createTursoClient();

      await client.execute({
        sql: `UPDATE sessions SET expires = ? WHERE session_token = ?`,
        args: [session.expires?.getTime() ?? null, session.sessionToken],
      });

      const result = await client.execute({
        sql: `SELECT session_token, user_id, expires FROM sessions WHERE session_token = ?`,
        args: [session.sessionToken],
      });

      const row = result.rows[0];
      if (!row) return null;

      return {
        sessionToken: row.session_token as string,
        userId: row.user_id as string,
        expires: new Date(row.expires as number),
      };
    },

    async deleteSession(sessionToken) {
      const client = createTursoClient();
      await client.execute({
        sql: `DELETE FROM sessions WHERE session_token = ?`,
        args: [sessionToken],
      });
    },
  };
}
