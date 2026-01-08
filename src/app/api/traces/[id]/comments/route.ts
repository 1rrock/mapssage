import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { comments, users } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

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

    const allComments = await db
      .select({
        comment: comments,
        user: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.traceId, traceId),
          eq(comments.isDeleted, false)
        )
      )
      .orderBy(comments.createdAt);

    const result = allComments
      .filter((row) => row.user !== null)
      .map((row) => ({
        ...row.comment,
        user: row.user!,
        createdAt: new Date(row.comment.createdAt),
        updatedAt: new Date(row.comment.updatedAt),
      }));

    return NextResponse.json(result);
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
      const [parentComment] = await db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.id, parentId),
            eq(comments.traceId, traceId),
            isNull(comments.parentId)
          )
        );
      
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found or is already a reply' },
          { status: 400 }
        );
      }
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        traceId,
        userId: session.user.id,
        parentId: parentId || null,
        content: content.trim(),
      })
      .returning();

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      ...newComment,
      user,
      createdAt: new Date(newComment.createdAt),
      updatedAt: new Date(newComment.updatedAt),
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/traces/[id]/comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
