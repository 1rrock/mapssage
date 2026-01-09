/**
 * Custom Auth.js adapter for Cloudflare Workers
 * Uses raw fetch to Turso HTTP API - no Node.js dependencies
 */
import type { Adapter } from 'next-auth/adapters';

function generateId(): string {
  return crypto.randomUUID();
}

interface TursoResponse {
  results: Array<{
    columns: string[];
    rows: any[][];
  }>;
}

async function tursoExecute(sql: string, args: any[] = []): Promise<{ columns: string[]; rows: Record<string, any>[] }> {
  const url = process.env.TURSO_CONNECTION_URL!;
  const authToken = process.env.TURSO_AUTH_TOKEN!;
  
  const httpUrl = url.replace('libsql://', 'https://');
  
  const response = await fetch(`${httpUrl}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql,
            args: args.map(arg => {
              if (arg === null) return { type: 'null', value: null };
              if (typeof arg === 'number') return { type: 'integer', value: String(arg) };
              if (typeof arg === 'string') return { type: 'text', value: arg };
              return { type: 'text', value: String(arg) };
            }),
          },
        },
        { type: 'close' },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Turso HTTP error: ${response.status} ${text}`);
  }

  const data = await response.json() as any;
  
  if (data.results?.[0]?.type === 'error') {
    throw new Error(`Turso query error: ${data.results[0].error.message}`);
  }

  const result = data.results?.[0]?.response?.result;
  if (!result) {
    return { columns: [], rows: [] };
  }

  const columns = result.cols?.map((c: any) => c.name) || [];
  const rows = (result.rows || []).map((row: any[]) => {
    const obj: Record<string, any> = {};
    columns.forEach((col: string, i: number) => {
      const cell = row[i];
      obj[col] = cell?.value ?? null;
    });
    return obj;
  });

  return { columns, rows };
}

export function TursoAdapter(): Adapter {
  return {
    async createUser(user) {
      const id = (user as any).id || generateId();
      
      await tursoExecute(
        `INSERT INTO users (id, name, email, email_verified, image) VALUES (?, ?, ?, ?, ?)`,
        [id, user.name ?? null, user.email ?? null, user.emailVerified?.getTime() ?? null, user.image ?? null]
      );

      return {
        id,
        name: user.name ?? null,
        email: user.email ?? '',
        emailVerified: user.emailVerified ?? null,
        image: user.image ?? null,
      };
    },

    async getUser(id) {
      const result = await tursoExecute(
        `SELECT id, name, email, email_verified, image FROM users WHERE id = ?`,
        [id]
      );

      const row = result.rows[0];
      if (!row) return null;

      return {
        id: row.id as string,
        name: row.name as string | null,
        email: (row.email as string) ?? '',
        emailVerified: row.email_verified ? new Date(Number(row.email_verified)) : null,
        image: row.image as string | null,
      };
    },

    async getUserByEmail(email) {
      const result = await tursoExecute(
        `SELECT id, name, email, email_verified, image FROM users WHERE email = ?`,
        [email]
      );

      const row = result.rows[0];
      if (!row) return null;

      return {
        id: row.id as string,
        name: row.name as string | null,
        email: (row.email as string) ?? '',
        emailVerified: row.email_verified ? new Date(Number(row.email_verified)) : null,
        image: row.image as string | null,
      };
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const result = await tursoExecute(
        `SELECT u.id, u.name, u.email, u.email_verified, u.image 
         FROM users u 
         INNER JOIN accounts a ON u.id = a.user_id 
         WHERE a.provider = ? AND a.provider_account_id = ?`,
        [provider, providerAccountId]
      );

      const row = result.rows[0];
      if (!row) return null;

      return {
        id: row.id as string,
        name: row.name as string | null,
        email: (row.email as string) ?? '',
        emailVerified: row.email_verified ? new Date(Number(row.email_verified)) : null,
        image: row.image as string | null,
      };
    },

    async updateUser(user) {
      await tursoExecute(
        `UPDATE users SET name = ?, email = ?, email_verified = ?, image = ? WHERE id = ?`,
        [user.name ?? null, user.email ?? null, user.emailVerified?.getTime() ?? null, user.image ?? null, user.id]
      );

      const result = await tursoExecute(
        `SELECT id, name, email, email_verified, image FROM users WHERE id = ?`,
        [user.id]
      );

      const row = result.rows[0];
      return {
        id: row.id as string,
        name: row.name as string | null,
        email: (row.email as string) ?? '',
        emailVerified: row.email_verified ? new Date(Number(row.email_verified)) : null,
        image: row.image as string | null,
      };
    },

    async deleteUser(userId) {
      await tursoExecute(`DELETE FROM users WHERE id = ?`, [userId]);
    },

    async linkAccount(account) {
      const id = generateId();

      await tursoExecute(
        `INSERT INTO accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
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
        ]
      );

      return account;
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await tursoExecute(
        `DELETE FROM accounts WHERE provider = ? AND provider_account_id = ?`,
        [provider, providerAccountId]
      );
    },

    async createSession(session) {
      await tursoExecute(
        `INSERT INTO sessions (session_token, user_id, expires) VALUES (?, ?, ?)`,
        [session.sessionToken, session.userId, session.expires.getTime()]
      );

      return session;
    },

    async getSessionAndUser(sessionToken) {
      const result = await tursoExecute(
        `SELECT s.session_token, s.user_id, s.expires, u.id, u.name, u.email, u.email_verified, u.image
         FROM sessions s
         INNER JOIN users u ON s.user_id = u.id
         WHERE s.session_token = ?`,
        [sessionToken]
      );

      const row = result.rows[0];
      if (!row) return null;

      return {
        session: {
          sessionToken: row.session_token as string,
          userId: row.user_id as string,
          expires: new Date(Number(row.expires)),
        },
        user: {
          id: row.id as string,
          name: row.name as string | null,
          email: (row.email as string) ?? '',
          emailVerified: row.email_verified ? new Date(Number(row.email_verified)) : null,
          image: row.image as string | null,
        },
      };
    },

    async updateSession(session) {
      await tursoExecute(
        `UPDATE sessions SET expires = ? WHERE session_token = ?`,
        [session.expires?.getTime() ?? null, session.sessionToken]
      );

      const result = await tursoExecute(
        `SELECT session_token, user_id, expires FROM sessions WHERE session_token = ?`,
        [session.sessionToken]
      );

      const row = result.rows[0];
      if (!row) return null;

      return {
        sessionToken: row.session_token as string,
        userId: row.user_id as string,
        expires: new Date(Number(row.expires)),
      };
    },

    async deleteSession(sessionToken) {
      await tursoExecute(`DELETE FROM sessions WHERE session_token = ?`, [sessionToken]);
    },
  };
}
