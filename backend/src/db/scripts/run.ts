import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { runDatabaseScripts } from './index';
import { logger } from '../../logger';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

async function main() {
  try {
    await runDatabaseScripts(db);
    logger.info('Database scripts completed successfully');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  logger.error({ err: error }, 'Database scripts failed');
  process.exitCode = 1;
});