import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { tursoExecute } from '@/lib/turso-client';
import { calculateDistance } from '@/lib/utils/distance';
import type { TraceWithDistance, CreateTraceInput } from '@/types/trace';

const MAX_DISTANCE_KM = 500;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    console.log('GET /api/traces - session:', JSON.stringify(session, null, 2));
    console.log('GET /api/traces - cookies:', request.cookies.getAll());

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    const result = await tursoExecute(`
      SELECT 
        t.id, t.user_id, t.title, t.content, t.image_url, 
        t.latitude, t.longitude, t.is_deleted, t.expires_at, 
        t.created_at, t.updated_at,
        u.id as user_id_joined, u.name as user_name, u.image as user_image
      FROM traces t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.is_deleted = 0 AND t.expires_at IS NULL
    `);

    const tracesWithDistance: TraceWithDistance[] = result.rows
      .filter(
        (row) =>
          row.user_id_joined !== null &&
          row.content !== null &&
          row.is_deleted !== null
      )
      .map((row) => {
        const distance = calculateDistance(
          lat,
          lng,
          Number(row.latitude),
          Number(row.longitude)
        );

        return {
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
          user: {
            id: row.user_id_joined,
            name: row.user_name,
            image: row.user_image,
          },
          distance,
        };
      })
      .filter((trace) => trace.distance <= MAX_DISTANCE_KM)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json(tracesWithDistance);
  } catch (error) {
    console.error('GET /api/traces error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateTraceInput = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    if (
      typeof body.latitude !== 'number' ||
      typeof body.longitude !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const now = Date.now();

    await tursoExecute(
      `INSERT INTO traces (id, user_id, title, content, image_url, latitude, longitude, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [id, session.user.id, body.title, body.content, body.imageUrl || null, body.latitude, body.longitude, now, now]
    );

    const newTrace = {
      id,
      userId: session.user.id,
      title: body.title,
      content: body.content,
      imageUrl: body.imageUrl || null,
      latitude: body.latitude,
      longitude: body.longitude,
      isDeleted: false,
      expiresAt: null,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    return NextResponse.json(newTrace, { status: 201 });
  } catch (error) {
    console.error('POST /api/traces error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
