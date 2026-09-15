import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { runDatabaseScripts } from './scripts';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString: databaseUrl });

export const db = drizzle(pool);

export async function initializeDatabase() {
  await runDatabaseScripts(db);
}

export async function closeDatabase() {
  await pool.end();
}