'use client';

import { useState } from 'react';

interface DownloadFormProps {
  format: 'mp3' | 'mp4';
  type: 'video' | 'playlist';
  onSubmit: (url: string, format: 'mp3' | 'mp4', type: 'video' | 'playlist') => void;
  loading?: boolean;
}

export default function DownloadForm({ format, type, onSubmit, loading }: DownloadFormProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim(), format, type);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          YouTube {type === 'video' ? 'Video' : 'Playlist'} URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={`Enter YouTube ${type} URL`}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={loading}
        />
      </div>
      
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>Format: <strong>{format.toUpperCase()}</strong></span>
        <span>Type: <strong>{type === 'video' ? 'Single Video' : 'Playlist'}</strong></span>
      </div>

      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Processing...' : `Download ${format.toUpperCase()}`}
      </button>
    </form>
  );
}