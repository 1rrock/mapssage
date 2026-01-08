import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { traces } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [trace] = await db
      .select()
      .from(traces)
      .where(eq(traces.id, id))
      .limit(1);

    if (!trace) {
      return NextResponse.json({ error: 'Trace not found' }, { status: 404 });
    }

    if (trace.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db
      .update(traces)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(traces.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/traces/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const [trace] = await db
      .select()
      .from(traces)
      .where(eq(traces.id, id))
      .limit(1);

    if (!trace) {
      return NextResponse.json({ error: 'Trace not found' }, { status: 404 });
    }

    if (trace.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (body.restore === true) {
      await db
        .update(traces)
        .set({ isDeleted: false, updatedAt: new Date() })
        .where(eq(traces.id, id));

      return NextResponse.json({ success: true, action: 'restored' });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('PATCH /api/traces/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
