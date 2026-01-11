import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { tursoExecute } from '@/lib/turso-client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await tursoExecute(
      'SELECT id, name, email, image FROM users WHERE id = ? LIMIT 1',
      [session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    });
  } catch (error) {
    console.error('GET /api/users/me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, image } = body;

    const updates: string[] = [];
    const values: any[] = [];

    if (typeof name === 'string' && name.trim()) {
      updates.push('name = ?');
      values.push(name.trim());
    }

    if (typeof image === 'string') {
      updates.push('image = ?');
      values.push(image);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(session.user.id);
    await tursoExecute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const result = await tursoExecute(
      'SELECT id, name, email, image FROM users WHERE id = ? LIMIT 1',
      [session.user.id]
    );

    const user = result.rows[0];
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    });
  } catch (error) {
    console.error('PATCH /api/users/me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await tursoExecute('DELETE FROM users WHERE id = ?', [session.user.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/users/me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
