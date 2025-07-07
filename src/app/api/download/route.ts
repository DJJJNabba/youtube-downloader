import { NextRequest, NextResponse } from 'next/server';
import { addDownloadJob } from '@/lib/queue';
import { getSession } from '@/lib/session';
import { isValidYouTubeUrl, sanitizeUrl } from '@/lib/validation';
import { rateLimit } from '@/middleware/rateLimit';

const rateLimitMiddleware = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes

export async function POST(req: NextRequest) {
  const rateLimitResponse = rateLimitMiddleware(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { url, format, type } = await req.json();
    
    if (!url || !format || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: url, format, type' },
        { status: 400 }
      );
    }

    if (!['mp3', 'mp4'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be mp3 or mp4' },
        { status: 400 }
      );
    }

    if (!['video', 'playlist'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be video or playlist' },
        { status: 400 }
      );
    }

    const sanitizedUrl = sanitizeUrl(url);
    if (!isValidYouTubeUrl(sanitizedUrl)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

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

    const jobId = addDownloadJob(sessionId, sanitizedUrl, format, type);
    
    return NextResponse.json({ jobId });
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}