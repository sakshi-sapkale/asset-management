import 'dotenv/config';

import app from './app';
import { closeDatabase, initializeDatabase } from './db';
import { logger } from './logger';

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  logger.info({ port: PORT }, 'Starting asset service');
  await initializeDatabase();

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Asset service is listening');
  });

  const shutdown = async () => {
    logger.info('Shutdown signal received');
    server.close(async (error) => {
      if (error) {
        logger.error({ err: error }, 'HTTP server failed to close cleanly');
        process.exitCode = 1;
      }

      await closeDatabase();
      logger.info('Asset service shutdown complete');
      process.exit();
    });
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

start().catch((error) => {
  logger.error({ err: error }, 'Unable to start asset service');
  process.exit(1);
});