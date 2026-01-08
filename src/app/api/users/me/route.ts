import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET = auth(async function GET(req) {
  try {
    if (!req.auth?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.auth.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
});

export const PATCH = auth(async function PATCH(req) {
  try {
    if (!req.auth?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, image } = body;

    const updateData: { name?: string; image?: string } = {};
    
    if (typeof name === 'string' && name.trim()) {
      updateData.name = name.trim();
    }
    
    if (typeof image === 'string') {
      updateData.image = image;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, req.auth.user.id));

    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.auth.user.id))
      .limit(1);

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
    });
  } catch (error) {
    console.error('PATCH /api/users/me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async function DELETE(req) {
  try {
    if (!req.auth?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.delete(users).where(eq(users.id, req.auth.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/users/me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
