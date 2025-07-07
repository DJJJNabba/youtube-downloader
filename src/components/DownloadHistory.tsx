'use client';

import { useState, useEffect } from 'react';

interface HistoryItem {
  id: string;
  url: string;
  format: 'mp3' | 'mp4';
  type: 'video' | 'playlist';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  createdAt: string;
  expiresAt: string;
}

export default function DownloadHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        const data = await response.json();
        setHistory(data.history);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Download History</h2>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Download History</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Error loading history: {error}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Download History</h2>
      
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No downloads yet. Start by submitting a YouTube URL above.
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.format.toUpperCase()} • {item.type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate" title={item.url}>
                    {truncateUrl(item.url)}
                  </p>
                  
                  {item.status === 'processing' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{item.progress}%</span>
                    </div>
                  )}
                  
                  {item.error && (
                    <p className="text-xs text-red-600 mt-1">{item.error}</p>
                  )}
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  {item.status === 'completed' && (
                    <a
                      href={`/api/download/${item.id}`}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-400">
                Created: {new Date(item.createdAt).toLocaleString()} • 
                Expires: {new Date(item.expiresAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}