import { NextRequest, NextResponse } from 'next/server';
import { getJobsBySession } from '@/lib/queue';
import { getSession } from '@/lib/session';

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

    const jobs = getJobsBySession(sessionId);
    
    const history = jobs.map(job => ({
      id: job.id,
      url: job.url,
      format: job.format,
      type: job.type,
      status: job.status,
      progress: job.progress,
      error: job.error,
      createdAt: job.createdAt,
      expiresAt: job.expiresAt,
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}