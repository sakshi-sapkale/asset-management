import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export function validateBody(schema: z.ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(result.error);
    }

    req.body = result.data;
    next();
  };
}

export function validateParam(paramName: string, schema: z.ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params[paramName]);

    if (!result.success) {
      return next(
        new z.ZodError(
          result.error.issues.map((issue) => ({
            ...issue,
            path: [paramName, ...issue.path],
          })),
        ),
      );
    }

    req.params[paramName] = String(result.data);
    next();
  };
}