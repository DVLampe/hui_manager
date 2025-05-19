import { NextResponse as OriginalNextResponse } from 'next/server'; // Renamed
import { cookies } from 'next/headers';

export async function POST(request) {
  let NextResponseToUse = OriginalNextResponse;
  if (OriginalNextResponse && typeof OriginalNextResponse.json === 'undefined' && OriginalNextResponse.default && typeof OriginalNextResponse.default.json === 'function') {
    NextResponseToUse = OriginalNextResponse.default;
  }
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in POST /api/auth/logout!');
    // Fallback for critical error, though logout might partially work by just clearing cookies on client
    return new Response(JSON.stringify({ message: 'Lỗi nghiêm trọng phía server khi đăng xuất.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Clear the authentication cookie
    const response = NextResponseToUse.json({ message: 'Logout successful' }, { status: 200 });
    response.cookies.set('huiAuthToken', '', {
      httpOnly: true,
      secure: true, // Simplified for diagnostics
      sameSite: 'strict',
      maxAge: 0, // Expire the cookie immediately
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponseToUse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
