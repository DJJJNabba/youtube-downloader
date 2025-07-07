import { NextRequest, NextResponse } from 'next/server';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 10, windowMs: number = 15 * 60 * 1000) => {
  return (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const clientData = requestCounts.get(ip);
    
    if (!clientData || clientData.resetTime < windowStart) {
      requestCounts.set(ip, { count: 1, resetTime: now });
      return null;
    }
    
    if (clientData.count >= maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    clientData.count++;
    return null;
  };
};

export const cleanupRateLimitData = () => {
  const now = Date.now();
  const fifteenMinutesAgo = now - 15 * 60 * 1000;
  
  for (const [ip, data] of requestCounts.entries()) {
    if (data.resetTime < fifteenMinutesAgo) {
      requestCounts.delete(ip);
    }
  }
};