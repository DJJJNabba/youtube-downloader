import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredJobs } from '@/lib/queue';
import { cleanupExpiredSessions } from '@/lib/session';
import { cleanupRateLimitData } from '@/middleware/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.CLEANUP_TOKEN || 'default-cleanup-token';
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    cleanupExpiredJobs();
    cleanupExpiredSessions();
    cleanupRateLimitData();

    return NextResponse.json({ message: 'Cleanup completed successfully' });
  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}