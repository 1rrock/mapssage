import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { tursoExecute } from '@/lib/turso-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: traceId } = await params;

    const result = await tursoExecute(`
      SELECT 
        c.id, c.trace_id, c.user_id, c.parent_id, c.content, 
        c.is_deleted, c.created_at, c.updated_at,
        u.id as user_id_joined, u.name as user_name, u.image as user_image
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.trace_id = ? AND c.is_deleted = 0
      ORDER BY c.created_at
    `, [traceId]);

    const comments = result.rows
      .filter((row) => row.user_id_joined !== null)
      .map((row) => ({
        id: row.id,
        traceId: row.trace_id,
        userId: row.user_id,
        parentId: row.parent_id,
        content: row.content,
        isDeleted: row.is_deleted === '1' || row.is_deleted === 1,
        createdAt: new Date(Number(row.created_at)),
        updatedAt: new Date(Number(row.updated_at)),
        user: {
          id: row.user_id_joined,
          name: row.user_name,
          image: row.user_image,
        },
      }));

    return NextResponse.json(comments);
  } catch (error) {
    console.error('GET /api/traces/[id]/comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: traceId } = await params;
    const { content, parentId } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (parentId) {
      const parentResult = await tursoExecute(
        'SELECT id FROM comments WHERE id = ? AND trace_id = ? AND parent_id IS NULL',
        [parentId, traceId]
      );
      
      if (parentResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Parent comment not found or is already a reply' },
          { status: 400 }
        );
      }
    }

    const id = crypto.randomUUID();
    const now = Date.now();

    await tursoExecute(
      `INSERT INTO comments (id, trace_id, user_id, parent_id, content, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [id, traceId, session.user.id, parentId || null, content.trim(), now, now]
    );

    const userResult = await tursoExecute(
      'SELECT id, name, image FROM users WHERE id = ?',
      [session.user.id]
    );
    const user = userResult.rows[0];

    return NextResponse.json({
      id,
      traceId,
      userId: session.user.id,
      parentId: parentId || null,
      content: content.trim(),
      isDeleted: false,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/traces/[id]/comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
