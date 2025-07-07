import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/queue';
import { getSession } from '@/lib/session';

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    const sessionId = req.cookies.get('sessionId')?.value;
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

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.sessionId !== sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      error: job.error,
      createdAt: job.createdAt,
      expiresAt: job.expiresAt,
    });
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}