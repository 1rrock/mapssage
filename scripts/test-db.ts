
import { createClient } from '@libsql/client/web';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyConnection() {
    const url = process.env.TURSO_CONNECTION_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    console.log('Testing Turso Connection...');
    console.log('URL:', url ? 'Set' : 'Missing');
    console.log('Auth Token:', authToken ? 'Set' : 'Missing');

    if (!url || !authToken) {
        console.error('❌ Missing environment variables');
        process.exit(1);
    }

    try {
        const client = createClient({
            url,
            authToken,
        });

        const result = await client.execute('SELECT 1');
        console.log('✅ Connection successful!');

        console.log('Checking tables...');
        const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
        console.log('Existing tables:', tables.rows.map(r => r.name));

        const requiredTables = ['users', 'accounts', 'sessions'];
        const missingTables = requiredTables.filter(t => !tables.rows.some(r => r.name === t));

        if (missingTables.length > 0) {
            console.error('❌ Missing tables:', missingTables);
        } else {
            console.log('✅ All required tables exist.');
        }

    } catch (error) {
        console.error('❌ Connection failed:', error);
    }
}

verifyConnection();
