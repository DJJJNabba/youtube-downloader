'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DownloadHistory from '@/components/DownloadHistory';

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch('/api/session', {
          method: 'POST',
        });
        
        if (response.ok) {
          const data = await response.json();
          setSessionId(data.sessionId);
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">YouTube Downloader</h1>
          <p className="text-gray-600">Download YouTube videos and playlists as MP3 or MP4 files</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/video/mp3" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Video to MP3</h2>
              </div>
              <p className="text-gray-600">Extract audio from single YouTube videos</p>
            </div>
          </Link>

          <Link href="/video/mp4" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Video to MP4</h2>
              </div>
              <p className="text-gray-600">Download single YouTube videos as MP4</p>
            </div>
          </Link>

          <Link href="/playlist/mp3" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Playlist to MP3</h2>
              </div>
              <p className="text-gray-600">Extract audio from entire YouTube playlists</p>
            </div>
          </Link>

          <Link href="/playlist/mp4" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v2a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 10v8m6-8v8" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Playlist to MP4</h2>
              </div>
              <p className="text-gray-600">Download entire YouTube playlists as MP4</p>
            </div>
          </Link>
        </div>

        {sessionId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <DownloadHistory />
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Files are automatically deleted after 30 minutes for security.</p>
          <p>Downloads are limited to prevent abuse.</p>
        </div>
      </div>
    </div>
  );
}