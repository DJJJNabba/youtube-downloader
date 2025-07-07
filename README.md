# YouTube Downloader

A secure Next.js web application for downloading YouTube videos and playlists as MP3 or MP4 files using yt-dlp.

## Features

- 🎵 **Video to MP3**: Extract audio from single YouTube videos
- 🎬 **Video to MP4**: Download single YouTube videos as MP4
- 🎵 **Playlist to MP3**: Extract audio from entire YouTube playlists
- 🎬 **Playlist to MP4**: Download entire YouTube playlists as MP4
- 🔒 **Secure**: Session-based access without user accounts
- ⚡ **Async Processing**: Non-blocking downloads with queue system
- 📊 **Progress Tracking**: Real-time download progress indicators
- 🛡️ **Rate Limited**: IP-based rate limiting to prevent abuse
- 🗑️ **Auto Cleanup**: Files automatically deleted after 30 minutes
- 📱 **Responsive**: Clean and simple UI that works on all devices

## Prerequisites

- Node.js 18+ 
- Redis server
- yt-dlp installed on the system
- FFmpeg (required by yt-dlp for audio extraction)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd youtube-downloader
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Redis configuration and secure tokens.

4. Start Redis server:
```bash
redis-server
```

5. Install yt-dlp:
```bash
# On Ubuntu/Debian
sudo apt install yt-dlp

# On macOS
brew install yt-dlp

# Or using pip
pip install yt-dlp
```

6. Install FFmpeg (for audio extraction):
```bash
# On Ubuntu/Debian
sudo apt install ffmpeg

# On macOS
brew install ffmpeg
```

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. Set up a reverse proxy (nginx recommended) for SSL termination and rate limiting.

4. Configure Redis for persistence and security.

5. Set up monitoring and logging.

## API Endpoints

- `POST /api/session` - Create a new session
- `POST /api/download` - Start a download job
- `GET /api/status/[jobId]` - Check download status
- `GET /api/download/[jobId]` - Download completed file
- `GET /api/history` - Get download history for current session
- `POST /api/cleanup` - Manual cleanup (requires auth token)

## Security Features

- **Session Management**: Short-lived tokens for user association
- **Rate Limiting**: IP-based request limiting (5 requests per 15 minutes)
- **URL Validation**: Strict YouTube URL validation
- **Input Sanitization**: All user inputs are sanitized
- **File Isolation**: Downloads are isolated per session
- **Auto Expiration**: Files automatically deleted after 30 minutes
- **No User Data**: No personal information stored or required

## Configuration

### Environment Variables

- `REDIS_HOST` - Redis server hostname (default: localhost)
- `REDIS_PORT` - Redis server port (default: 6379)
- `CLEANUP_TOKEN` - Token for manual cleanup API (change in production)
- `NODE_ENV` - Environment (development/production)

### Rate Limiting

Default rate limits:
- 5 download requests per 15 minutes per IP
- Automatic cleanup of rate limit data

### File Cleanup

- Files expire after 30 minutes
- Automatic cleanup runs every 5 minutes
- Manual cleanup available via API endpoint

## Troubleshooting

### Common Issues

1. **yt-dlp not found**: Ensure yt-dlp is installed and in PATH
2. **Redis connection failed**: Check Redis server is running and accessible
3. **FFmpeg error**: Install FFmpeg for audio extraction functionality
4. **Download stuck**: Check yt-dlp version and YouTube availability

### Logs

Check the Next.js server logs for detailed error information:
```bash
npm run dev  # Development
npm start    # Production
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational purposes only. Respect YouTube's Terms of Service and applicable copyright laws.

## Disclaimer

This tool is provided as-is for educational and personal use only. Users are responsible for complying with YouTube's Terms of Service and all applicable laws regarding content downloading and copyright.