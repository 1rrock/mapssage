import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { traces, users } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
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

    const allTraces = await db
      .select({
        trace: traces,
        user: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(traces)
      .leftJoin(users, eq(traces.userId, users.id))
      .where(
        and(
          eq(traces.isDeleted, false),
          isNull(traces.expiresAt)
        )
      );

    const tracesWithDistance: TraceWithDistance[] = allTraces
      .filter(
        (row) =>
          row.user !== null &&
          row.trace.content !== null &&
          row.trace.isDeleted !== null
      )
      .map((row) => {
        const distance = calculateDistance(
          lat,
          lng,
          row.trace.latitude,
          row.trace.longitude
        );

        return {
          ...row.trace,
          content: row.trace.content!,
          isDeleted: row.trace.isDeleted!,
          user: row.user!,
          distance,
          createdAt: new Date(row.trace.createdAt),
          updatedAt: new Date(row.trace.updatedAt),
          expiresAt: row.trace.expiresAt ? new Date(row.trace.expiresAt) : null,
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

    const [newTrace] = await db
      .insert(traces)
      .values({
        userId: session.user.id,
        title: body.title,
        content: body.content,
        imageUrl: body.imageUrl || null,
        latitude: body.latitude,
        longitude: body.longitude,
      })
      .returning();

    return NextResponse.json(newTrace, { status: 201 });
  } catch (error) {
    console.error('POST /api/traces error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
