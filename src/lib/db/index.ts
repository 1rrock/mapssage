import { createClient } from '@libsql/client/http';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const url = process.env.TURSO_CONNECTION_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN!;

console.log('DB Connect:', { hasUrl: !!url, hasToken: !!authToken });

const client = createClient({ url, authToken });
export const db = drizzle({ client, schema });
