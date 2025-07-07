import cron from 'node-cron';
import { cleanupExpiredJobs } from './queue';
import { cleanupExpiredSessions } from './session';
import { cleanupRateLimitData } from '@/middleware/rateLimit';

export const startCleanupScheduler = () => {
  // Run cleanup every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    console.log('Running cleanup tasks...');
    
    try {
      cleanupExpiredJobs();
      cleanupExpiredSessions();
      cleanupRateLimitData();
      
      console.log('Cleanup tasks completed successfully');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });
  
  console.log('Cleanup scheduler started - runs every 5 minutes');
};