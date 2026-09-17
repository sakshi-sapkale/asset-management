import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: {
    service: 'asset-service',
  },
  redact: {
    paths: ['req.headers.authorization', 'DATABASE_URL', '*.DATABASE_URL'],
    censor: '[REDACTED]',
  },
});