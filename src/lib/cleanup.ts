import { cleanupExpiredSessions } from './session';
import { cleanupRateLimitData } from '@/middleware/rateLimit';

export const startCleanupScheduler = () => {
  // Run cleanup every 5 minutes using setInterval
  setInterval(() => {
    console.log('Running cleanup tasks...');
    
    try {
      cleanupExpiredSessions();
      cleanupRateLimitData();
      
      console.log('Cleanup tasks completed successfully');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  console.log('Cleanup scheduler started - runs every 5 minutes');
};