import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('sessionId')?.value || req.cookies.get('sessionId_client')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    return NextResponse.json({ sessionId });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const sessionId = createSession();
    
    const response = NextResponse.json({ sessionId });
    // Set both HttpOnly cookie AND a regular cookie for client access
    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 2 * 60 * 60, // 2 hours
      path: '/',
    });
    
    // Also set a non-HttpOnly cookie for client-side access
    response.cookies.set('sessionId_client', sessionId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 2 * 60 * 60, // 2 hours
      path: '/',
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}