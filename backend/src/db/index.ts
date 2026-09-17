import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { runDatabaseScripts } from './scripts';
import { logger } from '../logger';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString: databaseUrl });

pool.on('connect', () => {
  logger.info('Database connection established');
});

pool.on('error', (error) => {
  logger.error({ err: error }, 'Database connection error');
});

export const db = drizzle(pool);

export async function initializeDatabase() {
  try {
    await runDatabaseScripts(db);
    logger.info('Database initialization completed');
  } catch (error) {
    logger.error({ err: error }, 'Database failed to connect or initialize');
    throw error;
  }
}

export async function closeDatabase() {
  await pool.end();
}