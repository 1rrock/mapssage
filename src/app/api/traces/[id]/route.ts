import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { tursoExecute } from '@/lib/turso-client';

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

    const result = await tursoExecute(
      'SELECT id, user_id FROM traces WHERE id = ? LIMIT 1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Trace not found' }, { status: 404 });
    }

    const trace = result.rows[0];
    if (trace.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await tursoExecute(
      'UPDATE traces SET is_deleted = 1, updated_at = ? WHERE id = ?',
      [Date.now(), id]
    );

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

    const result = await tursoExecute(
      'SELECT id, user_id FROM traces WHERE id = ? LIMIT 1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Trace not found' }, { status: 404 });
    }

    const trace = result.rows[0];
    if (trace.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (body.restore === true) {
      await tursoExecute(
        'UPDATE traces SET is_deleted = 0, updated_at = ? WHERE id = ?',
        [Date.now(), id]
      );

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
