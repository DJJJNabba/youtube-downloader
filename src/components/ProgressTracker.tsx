'use client';

import { useState, useEffect } from 'react';

interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  createdAt: string;
  expiresAt: string;
}

interface ProgressTrackerProps {
  jobId: string;
  onComplete: () => void;
}

export default function ProgressTracker({ jobId, onComplete }: ProgressTrackerProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        const data = await response.json();
        setJob(data);
        
        if (data.status === 'completed' || data.status === 'failed') {
          onComplete();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [jobId, onComplete]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="text-red-600">
            <h3 className="text-sm font-medium">Error</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'processing': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'completed': return 'bg-green-50 border-green-200 text-green-800';
      case 'failed': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-600';
      case 'completed': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className={`rounded-lg p-6 ${getStatusColor(job.status)}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${job.status === 'processing' ? 'animate-pulse' : ''} ${getProgressBarColor(job.status)}`}></div>
          <span className="font-medium capitalize">{job.status}</span>
        </div>
        <span className="text-sm font-mono">
          {job.status === 'processing' ? `${job.progress}%` : job.status === 'completed' ? '100%' : ''}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressBarColor(job.status)}`}
          style={{ width: `${job.status === 'completed' ? 100 : job.progress}%` }}
        ></div>
      </div>
      
      {job.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-700">{job.error}</p>
        </div>
      )}
      
      {job.status === 'completed' && (
        <div className="flex items-center justify-between">
          <a
            href={`/api/download/${jobId}`}
            className="inline-flex items-center px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download File
          </a>
          <span className="text-xs text-gray-500">
            Ready for download
          </span>
        </div>
      )}
      
      {job.status !== 'completed' && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Started: {new Date(job.createdAt).toLocaleTimeString()}</span>
          <span>Expires: {new Date(job.expiresAt).toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
}