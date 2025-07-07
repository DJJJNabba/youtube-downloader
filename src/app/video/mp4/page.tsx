'use client';

import { useState } from 'react';
import Link from 'next/link';
import DownloadForm from '@/components/DownloadForm';
import ProgressTracker from '@/components/ProgressTracker';

export default function VideoToMP4() {
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
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Video to MP4</h1>
              <p className="text-gray-600">Download a single YouTube video as MP4</p>
            </div>
          </div>

          <DownloadForm
            format="mp4"
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