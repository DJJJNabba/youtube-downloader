import { startCleanupScheduler } from './lib/cleanup';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    startCleanupScheduler();
  }
}