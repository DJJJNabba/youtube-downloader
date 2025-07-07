'use client';

import { useState } from 'react';
import Link from 'next/link';
import DownloadForm from '@/components/DownloadForm';
import ProgressTracker from '@/components/ProgressTracker';

export default function VideoToMP3() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (url: string, format: 'mp3' | 'mp4', type: 'video' | 'playlist') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format, type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start download');
      }

      const data = await response.json();
      setCurrentJobId(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleJobComplete = () => {
    setCurrentJobId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Video to MP3</h1>
              <p className="text-gray-600">Extract audio from a single YouTube video</p>
            </div>
          </div>

          <DownloadForm
            format="mp3"
            type="video"
            onSubmit={handleDownload}
            loading={loading}
          />

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="text-red-600">
                  <h3 className="text-sm font-medium">Error</h3>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {currentJobId && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Download Progress</h2>
              <ProgressTracker jobId={currentJobId} onComplete={handleJobComplete} />
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Supported formats: YouTube videos • Files expire after 30 minutes</p>
        </div>
      </div>
    </div>
  );
}