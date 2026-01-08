
import { createId } from '@paralleldrive/cuid2';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyInsertion() {
    console.log('Testing Database Insertion...');

    // Import db dynamically after env vars are loaded
    const { db } = await import('../src/lib/db/index');
    const { users, accounts } = await import('../src/lib/db/schema');

    // Need to use 'eq' from drizzle-orm but for now let's just insert
    // If we wanted to clean up, we'd need: import { eq } from 'drizzle-orm';

    const userId = createId();
    const testUser = {
        id: userId,
        name: 'Test Turso User',
        email: `test-turso-${userId}@example.com`,
        image: 'https://example.com/image.png',
    };

    try {
        console.log('Inserting user:', testUser);
        await db.insert(users).values(testUser).run();
        console.log('✅ User inserted successfully');

        const accountId = createId();
        const testAccount = {
            id: accountId,
            userId: userId,
            type: 'oauth',
            provider: 'kakao-test',
            providerAccountId: `kakao-${userId}`,
            access_token: 'test-access-token',
            token_type: 'bearer',
        };

        console.log('Inserting account:', testAccount);
        await db.insert(accounts).values(testAccount).run();
        console.log('✅ Account inserted successfully');

    } catch (error) {
        console.error('❌ Insertion failed:', error);
    }
}

verifyInsertion();
