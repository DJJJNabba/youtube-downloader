'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SessionContextType {
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  createSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/session', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }

      const data = await response.json();
      setSessionId(data.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Session creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always create a new session for reliability in development
    createSession();
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId, loading, error, createSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}