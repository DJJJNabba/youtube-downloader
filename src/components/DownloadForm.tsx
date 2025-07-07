'use client';

import { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';

interface DownloadFormProps {
  format: 'mp3' | 'mp4';
  type: 'video' | 'playlist';
  onSubmit: (url: string, format: 'mp3' | 'mp4', type: 'video' | 'playlist') => void;
  loading?: boolean;
}

export default function DownloadForm({ format, type, onSubmit, loading }: DownloadFormProps) {
  const [url, setUrl] = useState('');
  const { sessionId, loading: sessionLoading, error: sessionError } = useSession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && sessionId) {
      onSubmit(url.trim(), format, type);
    }
  };

  if (sessionLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Initializing session...</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">Session error: {sessionError}</p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-600">No session available. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          YouTube {type === 'video' ? 'Video' : 'Playlist'} URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={`https://www.youtube.com/watch?v=... or https://www.youtube.com/playlist?list=...`}
          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={loading}
          spellCheck="false"
          autoComplete="off"
        />
        <p className="text-xs text-gray-500 mt-1">
          Paste a YouTube {type} URL above
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Format: <span className="font-bold text-gray-900 bg-blue-100 px-2 py-1 rounded-md text-xs">{format.toUpperCase()}</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Type: <span className="font-bold text-gray-900 bg-green-100 px-2 py-1 rounded-md text-xs">{type === 'video' ? 'Single Video' : 'Playlist'}</span></span>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
            Session: {sessionId.slice(0, 8)}...
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Processing...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download {format.toUpperCase()}
          </div>
        )}
      </button>
    </form>
  );
}