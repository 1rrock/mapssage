import { drizzle } from 'drizzle-orm/libsql/http';
import * as schema from './schema';

const url = process.env.TURSO_CONNECTION_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN!;

console.log('DB Connect:', { hasUrl: !!url, hasToken: !!authToken });

export const db = drizzle({
  connection: {
    url,
    authToken,
  },
  schema,
});
