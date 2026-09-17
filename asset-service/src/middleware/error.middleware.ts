import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '../logger';

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  ASSET_TAG_ALREADY_EXISTS: 'ASSET_TAG_ALREADY_EXISTS',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

function isDuplicateAssetTagError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  if ('code' in error && error.code === '23505') {
    return true;
  }

  if ('cause' in error) {
    return isDuplicateAssetTagError(error.cause);
  }

  return false;
}

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    const fieldErrors = Object.fromEntries(
      error.issues
        .filter((issue) => issue.path.length > 0)
        .map((issue) => [issue.path.join('.'), issue.message]),
    );

    logger.error(
      {
        requestId: res.locals.requestId,
        method: req.method,
        path: req.originalUrl,
        fieldErrors,
      },
      Object.values(fieldErrors).join('; ') || 'Request validation failed',
    );

    return res.status(400).json({
      message: 'Validation failed.',
      fieldErrors,
    });
  }

  if (isDuplicateAssetTagError(error)) {
    logger.error(
      {
        err: error,
        requestId: res.locals.requestId,
        method: req.method,
        path: req.originalUrl,
      },
      'Asset tag already exists',
    );

    return res.status(409).json({
      message: 'An asset with this asset tag already exists.',
      fieldErrors: {
        assetTag: 'An asset with this asset tag already exists.',
      },
    });
  }

  logger.error(
    {
      err: error,
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
    },
    'Unhandled request error',
  );
  return res.status(500).json({
    message: 'An unexpected error occurred.',
  });
}