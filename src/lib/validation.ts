export const isValidYouTubeUrl = (url: string): boolean => {
  const patterns = [
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+(&.*)?$/,
    /^https?:\/\/(www\.)?youtube\.com\/playlist\?list=[\w-]+(&.*)?$/,
    /^https?:\/\/youtu\.be\/[\w-]+(\?.*)?$/,
  ];
  
  return patterns.some(pattern => pattern.test(url));
};

export const sanitizeUrl = (url: string): string => {
  return url.trim().replace(/[<>]/g, '');
};