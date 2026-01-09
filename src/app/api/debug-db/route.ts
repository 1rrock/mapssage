import { NextResponse } from 'next/server';
import { createClient } from '@tursodatabase/serverless/compat';

export async function GET() {
  const url = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return NextResponse.json({
      error: 'Missing DB credentials',
      hasUrl: !!url,
      hasToken: !!authToken,
    });
  }

  try {
    const client = createClient({ url, authToken });
    const result = await client.execute('SELECT 1 as test');
    
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
