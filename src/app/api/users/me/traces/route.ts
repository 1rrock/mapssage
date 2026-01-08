import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { traces } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const GET = auth(async function GET(req) {
  try {
    if (!req.auth?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const conditions = [eq(traces.userId, req.auth.user.id)];
    
    if (!includeDeleted) {
      conditions.push(eq(traces.isDeleted, false));
    }

    const myTraces = await db
      .select()
      .from(traces)
      .where(and(...conditions))
      .orderBy(desc(traces.createdAt));

    return NextResponse.json(myTraces);
  } catch (error) {
    console.error('GET /api/users/me/traces error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
