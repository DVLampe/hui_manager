import { NextResponse as OriginalNextResponse } from 'next/server';
import logger from '@/lib/logger.server'; // Use the server-side logger

// Apply the workaround pattern for NextResponse
const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

export async function POST(request) {
  try {
    const body = await request.json();
    const { level, message, context } = body;

    switch (level) {
      case 'info':
        logger.info(message, context);
        break;
      case 'warn':
        logger.warn(message, context);
        break;
      case 'error':
        logger.error(message, context);
        break;
      default:
        logger.info(message, context);
        break;
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    // Don't use the logger here to avoid an infinite loop if logging itself fails
    console.error("Error in logging API route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
