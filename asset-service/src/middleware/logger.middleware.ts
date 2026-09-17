import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

import { logger } from '../logger';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = req.header('x-request-id') ?? randomUUID();
  const startedAt = Date.now();

  res.setHeader('x-request-id', requestId);
  res.locals.requestId = requestId;
  logger.info(
    {
      requestId,
      method: req.method,
      path: req.originalUrl,
      body: req.body,
    },
    'Request received',
  );

  res.on('finish', () => {
    logger.info(
      {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
        responseHeaders: res.getHeaders(),
      },
      'Response sent',
    );
  });

  next();
}