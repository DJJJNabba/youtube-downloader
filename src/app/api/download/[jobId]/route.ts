import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/queue';
import { getSession } from '@/lib/session';
import fs from 'fs';
import path from 'path';

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

    if (job.status !== 'completed' || !job.filePath) {
      return NextResponse.json(
        { error: 'Download not ready' },
        { status: 400 }
      );
    }

    if (!fs.existsSync(job.filePath)) {
      return NextResponse.json(
        { error: 'File not found or expired' },
        { status: 404 }
      );
    }

    const fileName = path.basename(job.filePath);
    const fileBuffer = fs.readFileSync(job.filePath);
    
    const mimeType = job.format === 'mp3' ? 'audio/mpeg' : 'video/mp4';
    
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Download file API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}