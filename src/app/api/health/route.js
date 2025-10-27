import { NextResponse as OriginalNextResponse } from 'next/server';

// Apply the workaround pattern for NextResponse
const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

export async function GET() {
  try {
    // Optionally, you could add checks here to ensure database connectivity, etc.
    // For now, a simple "ok" response is sufficient for uptime monitoring.
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
