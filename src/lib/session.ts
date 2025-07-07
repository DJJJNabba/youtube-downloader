import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessions = new Map<string, Session>();

export const createSession = (): string => {
  const sessionId = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

  const session: Session = {
    id: sessionId,
    createdAt: now,
    expiresAt,
  };

  sessions.set(sessionId, session);
  return sessionId;
};

export const getSession = (sessionId: string): Session | undefined => {
  const session = sessions.get(sessionId);
  if (session && session.expiresAt > new Date()) {
    return session;
  }
  if (session) {
    sessions.delete(sessionId);
  }
  return undefined;
};

export const cleanupExpiredSessions = () => {
  const now = new Date();
  const expiredSessions = Array.from(sessions.values()).filter(session => session.expiresAt < now);
  
  expiredSessions.forEach(session => {
    sessions.delete(session.id);
  });
};