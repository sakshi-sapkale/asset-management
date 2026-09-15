import 'dotenv/config';

import app from './app';
import { closeDatabase, initializeDatabase } from './db';

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  await initializeDatabase();

  const server = app.listen(PORT, () => {
    console.log(`Asset Service running on port ${PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

start().catch((error) => {
  console.error('Unable to start Asset Service:', error);
  process.exit(1);
});