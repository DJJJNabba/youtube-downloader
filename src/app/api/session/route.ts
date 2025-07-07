import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

export async function POST() {
  try {
    const sessionId = createSession();
    
    const response = NextResponse.json({ sessionId });
    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
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