import { NextResponse } from 'next/server';
import { createClient } from '@tursodatabase/serverless/compat';

export async function GET(request: Request) {
  const url = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return NextResponse.json({
      error: 'Missing DB credentials',
      hasUrl: !!url,
      hasToken: !!authToken,
    });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'SELECT 1 as test';

  try {
    const client = createClient({ url, authToken });
    const result = await client.execute(query);
    
    return NextResponse.json({
      success: true,
      result: result.rows,
      url: url.substring(0, 30) + '...',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
