import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function runMigration() {
  const url = process.env.TURSO_CONNECTION_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  
  if (!url || !token) {
    throw new Error('Missing TURSO_CONNECTION_URL or TURSO_AUTH_TOKEN');
  }
  
  const client = createClient({ url, authToken: token });
  const db = drizzle(client);

  console.log('Running migrations...');
  
  await migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('Migrations completed!');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});
