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

const jobs = new Map<string, DownloadJob>();
const pendingJobs: string[] = [];

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
  pendingJobs.push(jobId);
  
  // Process job immediately (simplified queue)
  processNextJob();
  
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

const processNextJob = async () => {
  if (pendingJobs.length === 0) return;
  
  const jobId = pendingJobs.shift();
  if (!jobId) return;
  
  const downloadJob = jobs.get(jobId);
  if (!downloadJob) return;

  updateJobStatus(jobId, 'processing');

  const outputDir = path.join(process.cwd(), 'downloads');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const ytdlpPath = process.env.YTDLP_PATH || '~/.local/bin/yt-dlp';
  const ffmpegPath = process.env.FFMPEG_PATH || '~/.local/bin';
  const outputPath = path.join(outputDir, `${jobId}.%(ext)s`);
  
  const args = [
    '--no-playlist',
    '--output', outputPath,
    '--ffmpeg-location', ffmpegPath.replace('~', process.env.HOME || ''),
  ];

  if (downloadJob.format === 'mp3') {
    args.push('--extract-audio', '--audio-format', 'mp3');
  } else {
    args.push('--format', 'best[ext=mp4]');
  }

  if (downloadJob.type === 'playlist') {
    args.splice(0, 1); // Remove --no-playlist
  }

  args.push(downloadJob.url);

  try {
    await new Promise<void>((resolve, reject) => {
      const ytdlp = spawn(ytdlpPath.replace('~', process.env.HOME || ''), args);

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
            resolve();
          } else {
            updateJobStatus(jobId, 'failed', 'Downloaded file not found');
            reject(new Error('Downloaded file not found'));
          }
        } else {
          updateJobStatus(jobId, 'failed', `yt-dlp exited with code ${code}`);
          reject(new Error(`yt-dlp exited with code ${code}`));
        }
      });

      ytdlp.on('error', (error) => {
        updateJobStatus(jobId, 'failed', `Failed to start yt-dlp: ${error.message}`);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
  }

  // Process next job
  setTimeout(processNextJob, 1000);
};

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