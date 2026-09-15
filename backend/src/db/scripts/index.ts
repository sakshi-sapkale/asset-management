import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export async function runDatabaseScripts(db: NodePgDatabase) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS assets (
      id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name varchar(255) NOT NULL,
      description text,
      asset_tag varchar(100) NOT NULL UNIQUE,
      status varchar(50) NOT NULL,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL
    )
  `);
}