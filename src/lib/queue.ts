import Queue from 'bull';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export interface DownloadJob {
  id: string;
  sessionId: string;
  url: string;
  format: 'mp3' | 'mp4';
  type: 'video' | 'playlist';
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  filePath?: string;
  createdAt: Date;
  expiresAt: Date;
}

const downloadQueue = new Queue('download queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

const jobs = new Map<string, DownloadJob>();

export const addDownloadJob = (sessionId: string, url: string, format: 'mp3' | 'mp4', type: 'video' | 'playlist'): string => {
  const jobId = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

  const job: DownloadJob = {
    id: jobId,
    sessionId,
    url,
    format,
    type,
    progress: 0,
    status: 'pending',
    createdAt: now,
    expiresAt,
  };

  jobs.set(jobId, job);
  
  downloadQueue.add('download', { jobId, sessionId, url, format, type });
  
  return jobId;
};

export const getJob = (jobId: string): DownloadJob | undefined => {
  return jobs.get(jobId);
};

export const getJobsBySession = (sessionId: string): DownloadJob[] => {
  return Array.from(jobs.values()).filter(job => job.sessionId === sessionId);
};

export const updateJobProgress = (jobId: string, progress: number) => {
  const job = jobs.get(jobId);
  if (job) {
    job.progress = progress;
    jobs.set(jobId, job);
  }
};

export const updateJobStatus = (jobId: string, status: DownloadJob['status'], error?: string, filePath?: string) => {
  const job = jobs.get(jobId);
  if (job) {
    job.status = status;
    if (error) job.error = error;
    if (filePath) job.filePath = filePath;
    jobs.set(jobId, job);
  }
};

downloadQueue.process('download', async (job) => {
  const { jobId, url, format, type } = job.data;
  const downloadJob = jobs.get(jobId);
  
  if (!downloadJob) {
    throw new Error('Job not found');
  }

  updateJobStatus(jobId, 'processing');

  const outputDir = path.join(process.cwd(), 'downloads');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${jobId}.%(ext)s`);
  
  const args = [
    '--no-playlist',
    '--output', outputPath,
  ];

  if (format === 'mp3') {
    args.push('--extract-audio', '--audio-format', 'mp3');
  } else {
    args.push('--format', 'best[ext=mp4]');
  }

  if (type === 'playlist') {
    args.splice(0, 1); // Remove --no-playlist
  }

  args.push(url);

  return new Promise((resolve, reject) => {
    const ytdlp = spawn('yt-dlp', args);

    ytdlp.stdout.on('data', (data) => {
      const output = data.toString();
      const progressMatch = output.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
      if (progressMatch) {
        const progress = parseFloat(progressMatch[1]);
        updateJobProgress(jobId, progress);
      }
    });

    ytdlp.stderr.on('data', (data) => {
      console.error(`yt-dlp stderr: ${data}`);
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        // Find the actual downloaded file
        const files = fs.readdirSync(outputDir).filter(f => f.startsWith(jobId));
        if (files.length > 0) {
          const actualFilePath = path.join(outputDir, files[0]);
          updateJobStatus(jobId, 'completed', undefined, actualFilePath);
          resolve(actualFilePath);
        } else {
          updateJobStatus(jobId, 'failed', 'Downloaded file not found');
          reject(new Error('Downloaded file not found'));
        }
      } else {
        updateJobStatus(jobId, 'failed', `yt-dlp exited with code ${code}`);
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });
  });
});

export const cleanupExpiredJobs = () => {
  const now = new Date();
  const expiredJobs = Array.from(jobs.values()).filter(job => job.expiresAt < now);
  
  expiredJobs.forEach(job => {
    if (job.filePath && fs.existsSync(job.filePath)) {
      fs.unlinkSync(job.filePath);
    }
    jobs.delete(job.id);
  });
};