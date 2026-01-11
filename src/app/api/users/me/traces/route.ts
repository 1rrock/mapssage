import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { tursoExecute } from '@/lib/turso-client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    let sql = `
      SELECT id, user_id, title, content, image_url, latitude, longitude, 
             is_deleted, expires_at, created_at, updated_at
      FROM traces 
      WHERE user_id = ?
    `;
    
    if (!includeDeleted) {
      sql += ' AND is_deleted = 0';
    }
    
    sql += ' ORDER BY created_at DESC';

    const result = await tursoExecute(sql, [session.user.id]);

    const traces = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      imageUrl: row.image_url,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      isDeleted: row.is_deleted === '1' || row.is_deleted === 1,
      expiresAt: row.expires_at ? new Date(Number(row.expires_at)) : null,
      createdAt: new Date(Number(row.created_at)),
      updatedAt: new Date(Number(row.updated_at)),
    }));

    return NextResponse.json(traces);
  } catch (error) {
    console.error('GET /api/users/me/traces error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
